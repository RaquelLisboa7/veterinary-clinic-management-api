const agendamentoService = require("../services/agendamento.service");
const { createAgendamentoSchema,  cancelAgendamentoSchema, } = require("../validations/agendamento.validation");

async function create(req, res, next) {
  try {
    const data = createAgendamentoSchema.parse(req.body);

    const agendamento = await agendamentoService.create({
      userId: Number(req.user.sub),
      dataHora: data.dataHora,
    });

    return res.status(201).json(agendamento);
  } catch (error) {
    return next(error);
  }
}

async function cancel(req, res, next) {
  try {
    const { id } = req.params;
    cancelAgendamentoSchema.parse(req.body);

    const agendamento = await agendamentoService.cancel({
      agendamentoId: Number(id),
      actor: {
        userId: Number(req.user.sub),
        role: req.user.role,
      },
    });

    return res.status(200).json(agendamento);
  } catch (error) {
    return next(error);
  }
}

async function index(req, res, next) {
  try {
    const agendamentos = await agendamentoService.findAll({
      userId: Number(req.user.sub),
      role: req.user.role,
    });

    return res.status(200).json(agendamentos);
  } catch (error) {
    return next(error);
  }
}

async function show(req, res, next) {
  try {
    const { id } = req.params;

    const agendamento = await agendamentoService.findById(Number(id), {
      userId: Number(req.user.sub),
      role: req.user.role,
    });

    return res.status(200).json(agendamento);
  } catch (error) {
    return next(error);
  }
}

module.exports = { 
    create,
    cancel,
    index,
    show
 };