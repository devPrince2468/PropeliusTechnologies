import { Router } from "express";
import todoController from "../controllers/todo.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.get("/", authenticate, todoController.getTodos);
router.get("/:id", authenticate, todoController.getTodo);
router.post("/", authenticate, todoController.addTodo);
router.delete("/:id", authenticate, todoController.deleteTodo);
router.put("/:id", authenticate, todoController.updateTodo);
router.patch("/:id/mark", authenticate, todoController.markTodoComplete);
router.patch("/:id/unmark", authenticate, todoController.unmarkTodoComplete);

export default router;
