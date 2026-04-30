const { Router } = require("express");
const controller = require("../controllers/agendamento.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = Router();

router.post("/", authMiddleware, controller.create);
router.patch("/:id/cancelar", authMiddleware, controller.cancel);
router.get("/", authMiddleware, controller.index);
router.get("/:id", authMiddleware, controller.show);

module.exports = router;