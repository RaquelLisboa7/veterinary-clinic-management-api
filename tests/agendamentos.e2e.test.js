const request = require("supertest");
const app = require("../src/app");
const { prisma } = require("../src/lib/prisma");

describe("Fluxo de agendamento", () => {
    beforeEach(async () => {
  await prisma.agendamento.deleteMany();
  await prisma.atendimento.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
});

  let token;
  const email = `cliente_${Date.now()}@email.com`;

  function getFutureDate(hoursAhead = 1) {
  return new Date(
    Date.now() +
    hoursAhead * 60 * 60 * 1000 +
    Math.floor(Math.random() * 60000) 
  ).toISOString();
}

  it("deve registrar, logar e criar agendamento", async () => {
    const registerRes = await request(app).post("/auth/register").send({
      name: "Cliente Teste",
      email,
      password: "123456",
      role: "cliente",
    });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body).toHaveProperty("id");

    console.log(registerRes.status, registerRes.body);

    const loginRes = await request(app).post("/auth/login").send({
      email,
      password: "123456",
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty("accessToken");

    token = loginRes.body.accessToken;

    const futureDate = getFutureDate(2);

    const createRes = await request(app)
      .post("/agendamentos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        dataHora: futureDate,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body).toHaveProperty("id");
    expect(createRes.body).toHaveProperty("userId");
    expect(createRes.body.userId).toBe(loginRes.body.user.id);
    expect(createRes.body.status).toBe("criado");
  });

  it("não deve permitir agendamento em horário já ocupado", async () => {
  const email = `cliente_dup_${Date.now()}@email.com`;

  await request(app).post("/auth/register").send({
    name: "Cliente Dup",
    email,
    password: "123456",
    role: "cliente",
  });

  const loginRes = await request(app).post("/auth/login").send({
    email,
    password: "123456",
  });

  const token = loginRes.body.accessToken;

  const date = getFutureDate(2);

  const first = await request(app)
    .post("/agendamentos")
    .set("Authorization", `Bearer ${token}`)
    .send({ dataHora: date });

  expect(first.status).toBe(201);

  const second = await request(app)
    .post("/agendamentos")
    .set("Authorization", `Bearer ${token}`)
    .send({ dataHora: date });

  expect(second.status).toBe(409);
});
  
it("não deve permitir cancelar com menos de 2h de antecedência", async () => {
  const email = `cliente_cancel_${Date.now()}@email.com`;

  await request(app).post("/auth/register").send({
    name: "Cliente Cancel",
    email,
    password: "123456",
    role: "cliente",
  });

  const loginRes = await request(app).post("/auth/login").send({
    email,
    password: "123456",
  });

  const token = loginRes.body.accessToken;

  const date = getFutureDate(1);

  const create = await request(app)
    .post("/agendamentos")
    .set("Authorization", `Bearer ${token}`)
    .send({ dataHora: date });

  expect(create.status).toBe(201);

  const agendamentoId = create.body.id;

  const cancel = await request(app)
    .patch(`/agendamentos/${agendamentoId}/cancelar`)
    .set("Authorization", `Bearer ${token}`);

  expect(cancel.status).toBe(409);
});

it("cliente não deve acessar agendamento de outro cliente", async () => {
  const email1 = `cliente1_${Date.now()}@email.com`;

  await request(app).post("/auth/register").send({
    name: "Cliente 1",
    email: email1,
    password: "123456",
    role: "cliente",
  });

  const login1 = await request(app).post("/auth/login").send({
    email: email1,
    password: "123456",
  });

  const token1 = login1.body.accessToken;

  const date = getFutureDate(2);

  const agendamento = await request(app)
    .post("/agendamentos")
    .set("Authorization", `Bearer ${token1}`)
    .send({ dataHora: date });

  expect(agendamento.status).toBe(201);

  const agendamentoId = agendamento.body.id;

  const email2 = `cliente2_${Date.now()}@email.com`;

  await request(app).post("/auth/register").send({
    name: "Cliente 2",
    email: email2,
    password: "123456",
    role: "cliente",
  });

  const login2 = await request(app).post("/auth/login").send({
    email: email2,
    password: "123456",
  });

  const token2 = login2.body.accessToken;

  const response = await request(app)
    .get(`/agendamentos/${agendamentoId}`)
    .set("Authorization", `Bearer ${token2}`);

  expect(response.status).toBe(403); // ou 403 dependendo da sua regra
});

it("admin deve acessar qualquer agendamento", async () => {
  const emailCliente = `cliente_admin_view_${Date.now()}@email.com`;
  const emailAdmin = `admin_view_${Date.now()}@email.com`;

  await request(app).post("/auth/register").send({
    name: "Cliente View",
    email: emailCliente,
    password: "123456",
    role: "cliente",
  });

  await request(app).post("/auth/register").send({
    name: "Admin View",
    email: emailAdmin,
    password: "123456",
    role: "admin",
  });

  const loginCliente = await request(app).post("/auth/login").send({
    email: emailCliente,
    password: "123456",
  });

  const loginAdmin = await request(app).post("/auth/login").send({
    email: emailAdmin,
    password: "123456",
  });

  const tokenCliente = loginCliente.body.accessToken;
  const tokenAdmin = loginAdmin.body.accessToken;

  const date = getFutureDate(3);

  const agendamento = await request(app)
    .post("/agendamentos")
    .set("Authorization", `Bearer ${tokenCliente}`)
    .send({ dataHora: date });

  expect(agendamento.status).toBe(201);

  const response = await request(app)
    .get(`/agendamentos/${agendamento.body.id}`)
    .set("Authorization", `Bearer ${tokenAdmin}`);

  expect(response.status).toBe(200);
  expect(response.body.id).toBe(agendamento.body.id);
});

});

afterAll(async () => {
  await prisma.$disconnect();
})