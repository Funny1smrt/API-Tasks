import express from "express";
import {
  getNotes,
  addNote,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { broadcastResourceUpdate } from "../server.js";

const router = express.Router();

// middleware/getUserId.js
export function getUserId(req, res, next) {
  req.userId = req.user?.uid || req.user?._id;
  if (!req.userId) {
    return res.status(401).json({
      message: "Не вдалося визначити користувача",
    });
  }
  next();
}

// GET - отримати нотатки
router.get("/", verifyToken, getUserId, async (req, res, next) => {
  try {
    const reqQuery = req.query;
    console.log("reqQuery in route:", reqQuery);
    const notes = await getNotes(req.userId, reqQuery);

    res.status(200).json(notes ?? []);
  } catch (err) {
    next(err);
  }
});

// POST - створити нотатку
router.post("/", verifyToken, getUserId, async (req, res, next) => {
  try {
    const noteData = {
      ...req.body,
      userId: req.userId,
      createdAt: new Date(),
    };

    const result = await addNote(noteData);
    await broadcastResourceUpdate("notes", req.userId, getNotes, {journalId: req.body.journalId });

    res.status(201).json({
      message: "Нотатку успішно додано",
      id: result.insertedId,
    });
  } catch (err) {
    next(err);
  }
});

// PUT - оновити нотатку
router.put("/:id", verifyToken, getUserId, async (req, res, next) => {
  try {
    const noteId = req.params.id;

    const updateData = { ...req.body, updatedAt: new Date() };
    const result = await updateNote(noteId, updateData);

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "Нотатку не знайдено або недостатньо прав" });
    }
    console.log(req.body);

    await broadcastResourceUpdate("notes", req.userId, getNotes, req.query);

    res.status(200).json({
      message: "Нотатку успішно оновлено",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE - видалити нотатку
router.delete("/:id", verifyToken, getUserId, async (req, res, next) => {
  try {
    const noteId = req.params.id;

    const result = await deleteNote(noteId);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Нотатку не знайдено" });
    }

    await broadcastResourceUpdate("notes", req.userId, getNotes, req.query);

    res.status(200).json({ message: "Нотатку успішно видалено" });
  } catch (err) {
    next(err);
  }
});

export default router;
