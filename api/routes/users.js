import express from "express";
import jwt from "jsonwebtoken";
import { authAdmin } from "../config/firebase.js";
import dotenv from "dotenv";

import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

// Завантаження .env
dotenv.config();

const router = express.Router();

// 🔐 Захищені маршрути
router.get("/", verifyToken, getUsers);
router.get("/:id", verifyToken, getUser);
router.put("/:id", verifyToken, updateUser);
router.delete("/:id", verifyToken, deleteUser);

// 🔸 Авторизація через Firebase + видача JWT
router.post("/auth", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "Немає idToken" });
    }

    // Перевіряємо токен Firebase
    const decoded = await authAdmin.verifyIdToken(idToken);

    // Генеруємо власний JWT
    const jwtToken = jwt.sign(
      { uid: decoded.uid, email: decoded.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.status(200).json({ jwt: jwtToken });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Invalid Firebase token" });
  }
});

export default router;
