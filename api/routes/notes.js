import express from "express";
import {
  getNotes,
  addNote,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- Виправлений GET-маршрут ---
router.get("/", verifyToken, async (req, res, next) => {
  try {
    // Припускаємо, що verifyToken успішно додає інформацію про користувача до req.user
    // і що у req.user є поле `id` або `_id`
    const userId = req.user.uid || req.user._id;
    // const journalId = req.query.journalId;
    // const allNotes = req.query.allNotes;
    const reqQuery = req.query;

    if (!userId) {
      return res.status(401).json({
        message: "Не вдалося визначити ідентифікатор користувача з токена.",
      });
    }


    // Викликаємо функцію доступу до даних (DAL)
    const notes = await getNotes(userId, reqQuery);

    // Відправляємо лише чисті дані (notes), що запобігає BSONError
    res.status(200).json(notes);
  } catch (err) {
    // Передаємо помилку далі для централізованої обробки
    next(err);
  }
});

// --- Виправлений POST-маршрут ---
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.uid || req.user._id;

    if (!userId) {
      return res.status(401).json({
        message: "Не вдалося визначити ідентифікатор користувача з токена.",
      });
    }
    // Створюємо об'єкт для збереження, додаючи userId
    const noteData = {
      ...req.body,
      userId: userId,
      createdAt: new Date(),
    };

    // Викликаємо функцію DAL
    const result = await addNote(noteData);

    // Повертаємо ID новоствореного ноту
    res.status(201).json({
      message: "Блок успішно додано",
      id: result.insertedId,
    });
  } catch (err) {
    next(err);
  }
});

// --- Виправлений PUT-маршрут ---
router.put("/:id", verifyToken, async (req, res, next) => {
  try {
    const noteId = req.params.id;

    // Викликаємо функцію DAL.
    // Примітка: Логіку перевірки userId та noteId слід додати у noteController
    const updateData = { ...req.body, updatedAt: new Date() };

    const result = await updateNote(noteId, updateData);

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "Запис не знайдено або недостатньо прав" });
    }

    res.status(200).json({
      message: "Запис успішно оновлено",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    next(err);
  }
});

// --- Виправлений DELETE-маршрут ---
router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const noteId = req.params.id;

    // Викликаємо функцію DAL.
    const result = await deleteNote(noteId);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Запис не знайдено" });
    }

    res.status(200).json({ message: "Запис успішно видалено" });
  } catch (err) {
    next(err);
  }
});

export default router;
