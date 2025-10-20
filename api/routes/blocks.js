import express from "express";
import {
  getBlocks,
  addBlock,
  deleteBlock,
  updateBlock,
} from "../controllers/blockController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { ObjectId } from "mongodb"; // Потрібно для роботи з ObjectId

const router = express.Router();

// --- Виправлений GET-маршрут ---
router.get("/", verifyToken, async (req, res, next) => {
  try {
    // !!! ВИПРАВЛЕНО: Використовуємо поле 'uid' або 'user_id' !!!
    const userId = req.user.uid || req.user.user_id;

    // Тимчасову діагностику (console.log) тепер можна видалити
    // console.log("Об'єкт req.user після verifyToken:", req.user);
    // console.log("Використовуваний userId:", userId);

    if (!userId) {
      return res.status(401).json({
        message: "Не вдалося визначити ідентифікатор користувача з токена.",
      });
    }
    // Викликаємо функцію доступу до даних (DAL)
    const blocks = await getBlocks(userId);

    // Відправляємо лише чисті дані (blocks), що запобігає BSONError
    res.status(200).json(blocks);
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
    const blockData = {
      ...req.body,
      userId: userId,
      createdAt: new Date(),
    };

    // Викликаємо функцію DAL
    const result = await addBlock(blockData);

    // Повертаємо ID новоствореного блоку
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
    const blockId = req.params.id;
    const userId = req.user.id || req.user._id;

    // Викликаємо функцію DAL.
    // Примітка: Логіку перевірки userId та blockId слід додати у blockController
    const updateData = { ...req.body, updatedAt: new Date() };

    const result = await updateBlock(blockId, updateData);

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "Блок не знайдено або недостатньо прав" });
    }

    res.status(200).json({
      message: "Блок успішно оновлено",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    next(err);
  }
});

// --- Виправлений DELETE-маршрут ---
router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const blockId = req.params.id;

    // Викликаємо функцію DAL.
    const result = await deleteBlock(blockId);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Блок не знайдено" });
    }

    res.status(200).json({ message: "Блок успішно видалено" });
  } catch (err) {
    next(err);
  }
});

export default router;
