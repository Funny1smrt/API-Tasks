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

// GET - отримати нотатки
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.uid || req.user._id;
    const reqQuery = req.query;

    if (!userId) {
      return res.status(401).json({
        message: "Не вдалося визначити ідентифікатор користувача з токена.",
      });
    }

    const notes = await getNotes(userId, reqQuery);
    res.status(200).json(notes);
  } catch (err) {
    next(err);
  }
});

// POST - створити нотатку
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.uid || req.user._id;

    if (!userId) {
      return res.status(401).json({
        message: "Не вдалося визначити ідентифікатор користувача з токена.",
      });
    }

    const noteData = {
      ...req.body,
      userId: userId,
      createdAt: new Date(),
    };

    const result = await addNote(noteData);

    // ✅ ВИПРАВЛЕНО: додано broadcast для real-time оновлення
    broadcastResourceUpdate("notes", userId, getNotes, req.query);

    res.status(201).json({
      message: "Нотатку успішно додано",
      id: result.insertedId,
    });
  } catch (err) {
    next(err);
  }
});

// PUT - оновити нотатку
router.put("/:id", verifyToken, async (req, res, next) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.uid || req.user._id;

    if (!userId) {
      return res.status(401).json({
        message: "Не вдалося визначити ідентифікатор користувача з токена.",
      });
    }

    const updateData = { ...req.body, updatedAt: new Date() };
    const result = await updateNote(noteId, updateData);

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "Нотатку не знайдено або недостатньо прав" });
    }

    // ✅ ВИПРАВЛЕНО: додано broadcast
    broadcastResourceUpdate("notes", userId, getNotes, req.query);

    res.status(200).json({
      message: "Нотатку успішно оновлено",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE - видалити нотатку
router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.uid || req.user._id;

    if (!userId) {
      return res.status(401).json({
        message: "Не вдалося визначити ідентифікатор користувача з токена.",
      });
    }

    const result = await deleteNote(noteId);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Нотатку не знайдено" });
    }

    // ✅ ВИПРАВЛЕНО: додано broadcast
    await broadcastResourceUpdate("notes", userId, getNotes, req.query);

    res.status(200).json({ message: "Нотатку успішно видалено" });
  } catch (err) {
    next(err);
  }
});

export default router;
