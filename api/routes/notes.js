import express from "express";
import {
  getNotes,
  addNote,
  deleteNote,
  updateNote,
} from "../controllers/noteController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getNotes);
router.post(
  "/",
  verifyToken,
  (req, res, next) => {
    console.log("Incoming note:", req.body);
    next(); // передаємо далі в addNote
  },
  addNote
);

router.put("/:id", verifyToken, updateNote);
router.delete("/:id", verifyToken, deleteNote);

export default router;
