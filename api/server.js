import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import taskRoutes from "./routes/tasks.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const startServer = async () => {
  await connectDB(); // чекаємо на підключення Mongo
  app.use("/api/tasks", taskRoutes);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Сервер запущено на порті ${PORT}`));
};

startServer();
