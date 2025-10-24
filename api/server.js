import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import taskRoutes from "./routes/tasks.js"
import noteRoutes from "./routes/notes.js";
import note_componentRoutes from "./routes/note_components.js";
import journalRoutes from "./routes/journals.js";
import userRoutes from "./routes/users.js";
import avatarRoutes from "./routes/avatars.js";
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const startServer = async () => {
  await connectDB(); // чекаємо на підключення MongoDB
  app.use("/api/users", userRoutes);
  app.use("/api/tasks", taskRoutes);
  app.use("/api/notes", noteRoutes);
  app.use("/api/note_components", note_componentRoutes);
  app.use("/api/journals", journalRoutes);
  app.use("/api/avatars", avatarRoutes);
  app.use((err, req, res, next) => {
    console.error(err.stack); // Для налагодження
    const statusCode = err.status || 500;
    res.status(statusCode).json({
      message: err.message || "Сталася внутрішня помилка сервера",
      error: process.env.NODE_ENV === "production" ? {} : err.stack,
    });
  });
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, "0.0.0.0", () =>
    console.log(`🚀 Сервер запущено на http://192.168.50.88:${PORT}`)
  );
};

startServer();
