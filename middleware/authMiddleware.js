import admin from "../config/firebase.js";

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"

  if (!token) return res.status(401).json({ message: "Немає токена" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // додаємо дані користувача
    next();
  } catch (err) {
    res.status(403).json({ message: "Недійсний токен" });
  }
};
