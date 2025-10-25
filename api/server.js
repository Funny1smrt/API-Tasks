import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import taskRoutes from "./routes/tasks.js";
import noteRoutes from "./routes/notes.js";
import note_componentRoutes from "./routes/note_components.js";
import journalRoutes from "./routes/journals.js";
import userRoutes from "./routes/users.js";
import avatarRoutes from "./routes/avatars.js";
import { getTasks } from "./controllers/taskController.js";
import { getJournals } from "./controllers/journalController.js";
import { getNotes } from "./controllers/noteController.js";
import { getNote_components } from "./controllers/note_componentsController.js";
import { getAvatar } from "./controllers/avatarController.js";
import { verifyTokenUserId } from "./middleware/authMiddleware.js";
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: [
      "http://192.168.50.88:3000", // Стара (можливо, неактуальна) адреса
      "http://localhost:5173", // ✅ ДОДАНО: Актуальна адреса вашого Vite/React клієнта
      "http://localhost:3000", // Додайте, якщо використовуєте Create React App
      "http://localhost:5000", // Додайте для внутрішніх перевірок
      "http://192.168.50.88:5173", // Додайте, якщо ви звертаєтеся до IP-адреси
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
export const broadcastResourceUpdate = async (
  resourceType,
  userId,
  getDataFunction
) => {
  try {
    const data = await getDataFunction(userId);
    const roomName = `${resourceType}:${userId}`;
    // Подія: 'notes', 'journals' тощо.
    io.to(roomName).emit(`${resourceType}`, data);
    console.log(`Broadcasted ${resourceType} update to room: ${roomName}`);
  } catch (error) {
    console.error(`Error broadcasting ${resourceType}:`, error);
  }
};
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`); // Клієнт повинен надіслати подію "join-user-room" після успішної автентифікації на React
  // Хелпер, що повертає функцію отримання даних за типом ресурсу
  const getDataFetcher = (resourceType) => {
    switch (resourceType) {
      case "tasks":
        return getTasks;
      case "journals":
        return getJournals;
      case "notes":
        return getNotes;
      case "note_components":
        return getNote_components;
      case "avatars":
        return getAvatar;
      // ...
      default:
        return null;
    }
  };
  socket.on("join-user-room", async (data) => {
    // Перевірка на наявність токену та типу ресурсу
    const { token, resourceType, reqQuery = {} } = data;
    if (!token || !resourceType) {
      // Первинна перевірка на наявність даних
      console.warn("Attempted join failed: Token or resourceType is missing.");
      return;
    }
    const userId = await verifyTokenUserId(token);
    console.log("userId", userId);
    if (userId) {
      const room = `${resourceType}:${userId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);

      try {
        const fetcher = getDataFetcher(resourceType); // Отримуємо функцію
        if (fetcher) {
          const resourceData = await fetcher(userId, reqQuery);

          // ✅ Надсилаємо тільки один ресурс: journals, tasks, notes, тощо.
          io.to(socket.id).emit(resourceType, resourceData);
        }
      } catch (error) {
        console.error(
          `Error fetching initial data for ${resourceType}:`,
          error
        );
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`); // Socket.IO автоматично видаляє сокет з усіх кімнат при відключенні
  });
});
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
  const PORT = 5000 || process.env.PORT;
  server.listen(PORT, "0.0.0.0", () =>
    console.log(`🚀 Сервер запущено на http://192.168.50.88:${PORT}`)
  );
};

startServer();
