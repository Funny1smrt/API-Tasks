import express from "express";
import {
  getJournals,
  addJournal,
  updateJournal,
  deleteJournal,
} from "../controllers/journalController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { broadcastResourceUpdate } from "../server.js";

const router = express.Router();

// --- Виправлений GET-маршрут ---
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.uid || req.user.user_id;

    if (!userId) {
      return res.status(401).json({
        message: "Не вдалося визначити ідентифікатор користувача з токена.",
      });
    }
    // Викликаємо функцію доступу до даних (DAL)
    const journals = await getJournals(userId);

    // Відправляємо лише чисті дані (journals), що запобігає BSONError
    res.status(200).json(journals);
  } catch (err) {
    // Передаємо помилку далі для централізованої обробки
    next(err);
  }
});

// --- Виправлений POST-маршрут ---
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.uid || req.user.user_id;

    if (!userId) {
      return res.status(401).json({
        message: "Не вдалося визначити ідентифікатор користувача з токена.",
      });
    }
    // Створюємо об'єкт для збереження, додаючи userId
    const journalData = {
      ...req.body,
      userId: userId,
      createdAt: new Date(),
    };

    // Викликаємо функцію DAL
    const result = await addJournal(journalData);
    await broadcastResourceUpdate("journals", userId, getJournals);
    // Повертаємо ID новоствореного Журналу
    res.status(201).json({
      message: "Журнал успішно додано",
      id: result.insertedId,
    });
  } catch (err) {
    next(err);
  }
});

// --- Виправлений PUT-маршрут ---
router.put("/:id", verifyToken, async (req, res, next) => {
  try {
    const journalId = req.params.id;
    const userId = req.user.uid || req.user._id;
    if (!userId) {
      return res.status(401).json({
        message: "Не вдалося визначити ідентифікатор користувача з токена.",
      });
    }

    // Викликаємо функцію DAL.
    // Примітка: Логіку перевірки userId та journalId слід додати у journalController
    const updateData = { ...req.body, updatedAt: new Date() };

    const result = await updateJournal(journalId, updateData);

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "Журнал не знайдено або недостатньо прав" });
    }
    broadcastResourceUpdate("journals", userId, getJournals);
    res.status(200).json({
      message: "Журнал успішно оновлено",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    next(err);
  }
});

// --- Виправлений DELETE-маршрут ---
router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const journalId = req.params.id;
    const userId = req.user.uid || req.user._id;
    if (!userId) {
      return res.status(401).json({
        message: "Не вдалося визначити ідентифікатор користувача з токена.",
      });
    }
    // Викликаємо функцію DAL.
    const result = await deleteJournal(journalId);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Журнал не знайдено" });
    }
    broadcastResourceUpdate("journals", userId, getJournals);
    res.status(200).json({ message: "Журнал успішно видалено" });
  } catch (err) {
    next(err);
  }
});

export default router;
