import { authAdmin } from "../config/firebase.js";

export const verifyToken = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Немає токена" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Немає токена" });

  try {
    const decoded = await authAdmin.verifyIdToken(token);
    req.user = decoded; // decoded.uid буде доступний
    next();
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: "Недійсний токен" });
  }
};
