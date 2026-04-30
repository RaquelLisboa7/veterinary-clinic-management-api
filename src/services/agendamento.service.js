const { prisma } = require("../lib/prisma");
const AppError = require("../errors/app.error");
const { logAction } = require("./audit-log.service");

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
        createdBy: userId,
      },
    });

    await logAction(tx, {
      action: "AGENDAMENTO_CRIADO",
      entity: "Agendamento",
      entityId: agendamento.id,
      actorId: userId,
      actorRole: "cliente",
      details: `Agendamento criado para ${date.toISOString()}`,
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
        throw new AppError(
          "Cancelamento permitido apenas com 2h de antecedência",
          409
        );
      }
    }

    const updated = await tx.agendamento.update({
      where: { id: agendamentoId },
      data: {
        status: "cancelado",
        canceledBy: actor.userId,
        canceledAt: new Date(),
      },
    });

    await logAction(tx, {
      action: "AGENDAMENTO_CANCELADO",
      entity: "Agendamento",
      entityId: agendamentoId,
      actorId: actor.userId,
      actorRole: actor.role,
      details: `Agendamento cancelado por ${actor.role}`,
    });

    return updated;
  });
}

async function findAll(actor) {
 const where = {};

if (actor.role === "cliente") {
  where.userId = actor.userId;
}

  return prisma.agendamento.findMany({
    where,
    include: {
      user: true,
      atendimento: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  
}

async function findById(id, actor) {
  const agendamento = await prisma.agendamento.findUnique({
    where: { id },
    include: {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  atendimento: true,
  }
  });

  if (!agendamento) {
    throw new AppError("Agendamento não encontrado", 404);
  }

  if (actor.role === "cliente" && agendamento.userId !== actor.userId) {
    throw new AppError("Acesso negado", 403);
  }

  return agendamento;
}

module.exports = {
  create,
  cancel,
  findAll,
  findById,
};