import express from "express";
import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { broadcastResourceUpdate } from "../server.js";
const router = express.Router();

// --- Виправлений GET-маршрут ---
router.get("/", verifyToken, async (req, res, next) => {
  try {
    // Припускаємо, що verifyToken успішно додає інформацію про користувача до req.user
    // і що у req.user є поле `id` або `_id`
    const userId = req.user.uid || req.user._id;

    if (!userId) {
      return res.status(401).json({
        message: "Не вдалося визначити ідентифікатор користувача з токена.",
      });
    }

    // Викликаємо функцію доступу до даних (DAL)
    const tasks = await getTasks(userId);

    // Відправляємо лише чисті дані (tasks), що запобігає BSONError
    res.status(200).json(tasks);
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
    const taskData = {
      ...req.body,
      userId: userId,
      createdAt: new Date(),
    };

    // Викликаємо функцію DAL
    const result = await addTask(taskData);
    broadcastResourceUpdate("tasks", userId, getTasks);
    // Повертаємо ID новоствореного ноту
    res.status(201).json({
      message: "Завдання успішно додано",
      id: result.insertedId,
    });
  } catch (err) {
    next(err);
  }
});

// --- Виправлений PUT-маршрут ---
router.put("/:id", verifyToken, async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.uid || req.user._id;
    if (!userId) {
      return res.status(401).json({
        message: "Не вдалося визначити ідентифікатор користувача з токена.",
      });
    }
    // Викликаємо функцію DAL.
    // Примітка: Логіку перевірки userId та taskId слід додати у taskController
    const updateData = { ...req.body, updatedAt: new Date() };

    const result = await updateTask(taskId, updateData);

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "Запис не знайдено або недостатньо прав" });
    }
    broadcastResourceUpdate("tasks", userId, getTasks);
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
    const taskId = req.params.id;
    const userId = req.user.uid || req.user._id;
    if (!userId) {
      return res.status(401).json({
        message: "Не вдалося визначити ідентифікатор користувача з токена.",
      });
    }
    // Викликаємо функцію DAL.
    const result = await deleteTask(taskId);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Запис не знайдено" });
    }
    broadcastResourceUpdate("tasks", userId, getTasks);
    res.status(200).json({ message: "Запис успішно видалено" });
  } catch (err) {
    next(err);
  }
});

export default router;
