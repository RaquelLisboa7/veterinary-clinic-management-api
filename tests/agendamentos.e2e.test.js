const request = require("supertest");
const app = require("../src/app");
const { prisma } = require("../src/lib/prisma");

describe("Fluxo de agendamento", () => {
  beforeEach(async () => {
    await prisma.agendamento.deleteMany();
    await prisma.atendimento.deleteMany();
    await prisma.pet.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  });

  function getFutureDate(hoursAhead = 1) {
    return new Date(
      Date.now() +
        hoursAhead * 60 * 60 * 1000 +
        Math.floor(Math.random() * 60000)
    ).toISOString();
  }

  async function createPet(userId) {
    return prisma.pet.create({
      data: {
        name: "Rex",
        species: "cão",
        tutorId: userId,
      },
    });
  }

  // 🔥 NOVO HELPER (melhoria)
  async function createAndLoginUser(role = "cliente") {
    const email = `${role}_${Date.now()}@email.com`;

    await request(app).post("/auth/register").send({
      name: role,
      email,
      password: "123456",
      role,
    });

    const login = await request(app).post("/auth/login").send({
      email,
      password: "123456",
    });

    return login.body;
  }

  it("deve registrar, logar e criar agendamento", async () => {
    const user = await createAndLoginUser("cliente");

    const token = user.accessToken;
    const pet = await createPet(user.user.id);

    const futureDate = getFutureDate(2);

    const createRes = await request(app)
      .post("/agendamentos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        petId: pet.id,
        dataHora: futureDate,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.tutorId).toBe(user.user.id);
  });

  it("não deve permitir agendamento em horário já ocupado", async () => {
    const user = await createAndLoginUser("cliente");

    const token = user.accessToken;
    const pet = await createPet(user.user.id);

    const date = getFutureDate(2);

    const first = await request(app)
      .post("/agendamentos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        petId: pet.id,
        dataHora: date,
      });

    expect(first.status).toBe(201);

    const second = await request(app)
      .post("/agendamentos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        petId: pet.id,
        dataHora: date,
      });

    expect(second.status).toBe(409);
  });

  it("não deve permitir cancelar com menos de 2h de antecedência", async () => {
    const user = await createAndLoginUser("cliente");

    const token = user.accessToken;
    const pet = await createPet(user.user.id);

    const date = getFutureDate(1);

    const create = await request(app)
      .post("/agendamentos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        petId: pet.id,
        dataHora: date,
      });

    expect(create.status).toBe(201);

    const cancel = await request(app)
      .patch(`/agendamentos/${create.body.id}/cancelar`)
      .set("Authorization", `Bearer ${token}`);

    expect(cancel.status).toBe(409);
  });

  it("cliente não deve acessar agendamento de outro cliente", async () => {
    const user1 = await createAndLoginUser("cliente");
    const token1 = user1.accessToken;

    const pet1 = await createPet(user1.user.id);

    const date = getFutureDate(2);

    const agendamento = await request(app)
      .post("/agendamentos")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        petId: pet1.id,
        dataHora: date,
      });

    const user2 = await createAndLoginUser("cliente");
    const token2 = user2.accessToken;

    const response = await request(app)
      .get(`/agendamentos/${agendamento.body.id}`)
      .set("Authorization", `Bearer ${token2}`);

    expect(response.status).toBe(403);
  });

  it("admin deve acessar qualquer agendamento", async () => {
    const cliente = await createAndLoginUser("cliente");
    const admin = await createAndLoginUser("admin");

    const pet = await createPet(cliente.user.id);

    const date = getFutureDate(3);

    const agendamento = await request(app)
      .post("/agendamentos")
      .set("Authorization", `Bearer ${cliente.accessToken}`)
      .send({
        petId: pet.id,
        dataHora: date,
      });

    const response = await request(app)
      .get(`/agendamentos/${agendamento.body.id}`)
      .set("Authorization", `Bearer ${admin.accessToken}`);

    expect(response.status).toBe(200);
  });

  it("admin deve cancelar agendamento de outro usuário", async () => {
    const cliente = await createAndLoginUser("cliente");

    const pet = await createPet(cliente.user.id);

    const date = getFutureDate(3);

    const agendamento = await request(app)
      .post("/agendamentos")
      .set("Authorization", `Bearer ${cliente.accessToken}`)
      .send({
        petId: pet.id,
        dataHora: date,
      });

    const admin = await createAndLoginUser("admin");

    const cancel = await request(app)
      .patch(`/agendamentos/${agendamento.body.id}/cancelar`)
      .set("Authorization", `Bearer ${admin.accessToken}`);

    expect(cancel.status).toBe(200);
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});