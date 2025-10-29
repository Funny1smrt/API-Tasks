import express from "express";
import {
  getNote_components,
  addNote_component,
  updateNote_component,
  deleteNote_component,
} from "../controllers/note_componentsController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { broadcastResourceUpdate } from "../server.js";

const router = express.Router();

// --- Виправлений GET-маршрут ---
router.get("/", verifyToken, async (req, res, next) => {
  try {
    // Припускаємо, що verifyToken успішно додає інформацію про користувача до req.user
    // і що у req.user є поле `id` або `_id`
    const userId = req.user.uid || req.user._id;
    const noteId = req.query.noteId;
    console.log("noteId", noteId);
    if (!userId) {
      return res.status(401).json({
        message: "Не вдалося визначити ідентифікатор користувача з токена.",
      });
    }

    // Викликаємо функцію доступу до даних (DAL)
    const note_components = await getNote_components(userId, noteId);

    // Відправляємо лише чисті дані (note_components), що запобігає BSONError
    res.status(200).json(note_components);
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
    const note_componentData = {
      ...req.body,
      userId: userId,
      createdAt: new Date(),
    };

    // Викликаємо функцію DAL
    const result = await addNote_component(note_componentData);
    await broadcastResourceUpdate(
      "note_components",
      userId,
      getNote_components,
      { noteId: req.body.noteId }
    );
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
    const note_componentId = req.params.id;

    // Викликаємо функцію DAL.
    // Примітка: Логіку перевірки userId та noteId слід додати у noteController
    const updateData = { ...req.body, updatedAt: new Date() };

    const result = await updateNote_component(note_componentId, updateData);

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "Запис не знайдено або недостатньо прав" });
    }
    await broadcastResourceUpdate(
      "note_components",
      req.userId,
      getNote_components,
      req.query
    );
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
    const note_componentId = req.params.id;

    // Викликаємо функцію DAL.
    const result = await deleteNote_component(note_componentId);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Запис не знайдено" });
    }
    await broadcastResourceUpdate(
      "note_components",
      req.userId,
      getNote_components,
      req.query
    );
    res.status(200).json({ message: "Запис успішно видалено" });
  } catch (err) {
    next(err);
  }
});

export default router;
