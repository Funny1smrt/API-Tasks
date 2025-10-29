import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getTags, addTag, updateTag, deleteTag } from "../controllers/tagController.js";
import { broadcastResourceUpdate } from "../server.js";

const router = express.Router();

// ----------------------------------------------------
// GET / (Отримати теги)
// ----------------------------------------------------
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.uid || req.user._id;

    if (!userId) {
      // Тут достатньо перевірки, якщо verifyToken пропустив без uid
      return res
        .status(401)
        .json({ message: "Unauthorized: Missing user ID." });
    }

    const tags = await getTags(userId);

    res.status(200).json({ message: "Теги успішно отримані", tags });
  } catch (err) {
    next(err);
  }
});

router.post("/", verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.uid || req.user._id;

    if (!userId) {
      return res.status(401).json({
        message: "Не вдалося визначити ідентифікатор користувача з токена.",
      });
    }

    const tagData = {
      ...req.body,
      userId: userId,
      createdAt: new Date(),
    };

    const result = await addTag(tagData);

    // ✅ ВИПРАВЛЕНО: додано broadcast для real-time оновлення
    broadcastResourceUpdate("tags", userId, getTags);

    res.status(201).json({
      message: "Тег успішно додано",
      id: result.insertedId,
    });
  } catch (err) {
    next(err);
  }
});

router.put("/:tagId", verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.uid || req.user._id;
    const { tagId } = req.params;
    if (!userId) {
      return res.status(401).json({
        message: "Не вдалося визначити ідентифікатор користувача з токена.",
      });
    }
    const updateData = req.body;

    const result = await updateTag(tagId, updateData);

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: "Тег не знайдено або недостатньо прав" });
    }
    broadcastResourceUpdate("tags", userId, getTags);

    res.status(200).json({ message: "Тег успішно оновлено" });
  } catch (err) {
    next(err);
  }
});
router.delete("/:tagId", verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.uid || req.user._id;
    const { tagId } = req.params;
    console.log("Deleting tag with ID:", tagId);
    if (!userId) {
      return res.status(401).json({
        message: "Не вдалося визначити ідентифікатор користувача з токена.",
      });
    }
    const result = await deleteTag(tagId);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Тег не знайдено" });
    }
    broadcastResourceUpdate("tags", userId, getTags);
    res.status(200).json({ message: "Тег успішно видалено" });
  } catch (err) {
    next(err);
  }
});

export default router;
