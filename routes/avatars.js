import multer from "multer";
import { getAvatar, uploadAvatar } from "../controllers/avatarController.js";
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

    const result = await getAvatar(userId);

    res.status(200).json({ message: "Аватар успішно отримано", result });
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
      }

      const result = await uploadAvatar(userId, req.file);

      res.status(201).json({ message: "Аватар успішно завантажено", result });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
