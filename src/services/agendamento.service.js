const { prisma } = require("../lib/prisma");
const AppError = require("../errors/app.error");

const MAX_AGENDAMENTOS_DIA = 10;
const CANCELAMENTO_ANTECEDENCIA_MIN = 120; 


async function create({ userId, dataHora }) {
  const date = new Date(dataHora);

  return await prisma.$transaction(async (tx) => {
    const conflito = await tx.agendamento.findFirst({
      where: {
        dataHora: date,
        status: {
         in: ["criado", "confirmado"],
        },
      },
    });

    if (conflito) {
      throw new AppError("Horário já ocupado", 409);
    }

    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const totalNoDia = await tx.agendamento.count({
        where: {
            dataHora: {
            gte: startOfDay,
            lte: endOfDay,
            },
            status: {
            in: ["criado", "confirmado"],
            },
        },
        });

    if (totalNoDia >= MAX_AGENDAMENTOS_DIA) {
        throw new AppError("Limite de agendamentos por dia atingido", 409);
    }

    const agendamento = await tx.agendamento.create({
      data: {
        userId,
        dataHora: date,
        status: "criado",
      },
    });

    return agendamento;
  });
}

async function cancel({ agendamentoId, actor }) {
  return await prisma.$transaction(async (tx) => {
    const agendamento = await tx.agendamento.findUnique({
      where: { id: agendamentoId },
    });

    if (!agendamento) {
      throw new AppError("Agendamento não encontrado", 404);
    }

    if (agendamento.status === "cancelado") {
      throw new AppError("Agendamento já cancelado", 400);
    }

    const isOwner = agendamento.userId === actor.userId;
    const isStaff = ["admin", "atendente"].includes(actor.role);

    if (!isOwner && !isStaff) {
      throw new AppError("Acesso negado", 403);
    }

    if (actor.role === "cliente") {
      const diffMs = new Date(agendamento.dataHora).getTime() - Date.now();
      const diffMin = diffMs / 1000 / 60;

      if (diffMin < CANCELAMENTO_ANTECEDENCIA_MIN) {
        throw new AppError("Cancelamento permitido apenas com 2h de antecedência", 409);
      }
    }

    const updated = await tx.agendamento.update({
      where: { id: agendamentoId },
      data: { status: "cancelado" },
    });

    return updated;
  });
}

module.exports = { create ,
    cancel
};