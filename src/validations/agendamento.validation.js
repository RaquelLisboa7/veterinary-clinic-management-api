const { z } = require("zod");

const createAgendamentoSchema = z.object({
  dataHora: z.string().datetime(),
});

const cancelAgendamentoSchema = z.object({});


module.exports = { createAgendamentoSchema,
    cancelAgendamentoSchema
};