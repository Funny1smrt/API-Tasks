import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "Немає токена" });
  }

  const token = header.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Немає токена" });
  }

  try {
    // 🔹 Перевіряємо токен, підписаний нашим JWT_SECRET_KEY
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // 🔹 Зберігаємо дані користувача у req для наступних middleware або маршрутів
    req.user = decoded;

    next(); // переходимо до наступного обробника
  } catch (err) {
    console.error("JWT verify error:", err.message);
    res.status(403).json({ message: "Недійсний або прострочений токен" });
  }
};
export const verifyTokenUserId = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return decoded.uid;
  } catch (err) {
    console.error("JWT verify error:", err.message);
    return null;
  }
}
