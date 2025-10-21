import multer from "multer";
import { getAvatar, uploadAvatar } from "../controllers/avatarsController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import express from "express";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ----------------------------------------------------
// GET / (Отримати аватари)
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

    // 🛑 ПЕРЕДАЄМО ТОКЕН у контролер
    const result = await getAvatar(userId);

    // ✅ Виправлено повідомлення про успіх
    res.status(200).json({ message: "Аватари успішно отримано", result });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------
// POST /upload (Завантажити аватар)
// ----------------------------------------------------
router.post(
  "/upload",
  verifyToken,
  upload.single("file"),
  async (req, res, next) => {
    try {
      const userId = req.user.uid || req.user._id;
      // 🛑 Перевірка наявності файлу (проблема 400 Bad Request)
      if (!req.file) {
        return res
          .status(400)
          .json({
            message: "File not found. Ensure the field name is 'file'.",
          });
      }

      if (!userId) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Missing user ID." });
      } // 🛑 ПЕРЕДАЄМО ТОКЕН у контролер

      const result = await uploadAvatar(userId, req.file);

      res.status(201).json({ message: "Аватар успішно завантажено", result });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
