import express from "express";
import {
  getTasks,
  addTask,
  deleteTask,
} from "../controllers/taskController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getTasks);
router.post("/", verifyToken, addTask);
router.delete("/:id", verifyToken, deleteTask);

export default router;
