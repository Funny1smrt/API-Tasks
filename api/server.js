import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import noteRoutes from "./routes/notes.js";
import blockRoutes from "./routes/blocks.js";
import userRoutes from "./routes/users.js";
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const startServer = async () => {
  await connectDB(); // чекаємо на підключення MongoDB
  app.use("/api/users", userRoutes);
  app.use("/api/notes", noteRoutes);
  app.use("/api/blocks", blockRoutes);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`🚀 Сервер запущено на http://localhost:${PORT}`)
  );
};

startServer();
