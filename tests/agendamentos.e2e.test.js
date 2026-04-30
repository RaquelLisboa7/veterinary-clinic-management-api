const request = require("supertest");
const app = require("../src/app");
const { prisma } = require("../src/lib/prisma");

describe("Fluxo de agendamento", () => {
  let token;
  const email = `cliente_${Date.now()}@email.com`;

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

    const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();

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

  const date = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

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

  const date = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString();

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
});

afterAll(async () => {
  await prisma.$disconnect();
})