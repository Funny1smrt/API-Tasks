import express from "express";
import { getTasks, addTask } from "../controllers/taskController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getTasks);
router.post(
  "/",
  verifyToken,
  (req, res, next) => {
    console.log("Incoming note:", req.body);
    next(); // передаємо далі в addTask
  },
  addTask
);


export default router;
