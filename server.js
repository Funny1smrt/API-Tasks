import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import http, { get } from "http";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import taskRoutes from "./routes/tasks.js";
import noteRoutes from "./routes/notes.js";
import note_componentRoutes from "./routes/note_components.js";
import journalRoutes from "./routes/journals.js";
import userRoutes from "./routes/users.js";
import avatarRoutes from "./routes/avatars.js";
import { getTags } from "./controllers/tagController.js";
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
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5000",
      "http://192.168.50.88:5173",
      "http://192.168.50.88:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
export const broadcastResourceUpdate = async (
  resourceType,
  userId,
  getDataFunction,
  reqQuery = {}
) => {
  try {
    const data = await getDataFunction(userId, reqQuery);

    // Формуємо назву кімнати з урахуванням query параметрів
    const queryString =
      Object.keys(reqQuery).length > 0 ? `:${JSON.stringify(reqQuery)}` : "";
    const roomName = `${resourceType}:${userId}${queryString}`;

    io.to(roomName).emit(resourceType, data);
    console.log(`📡 Broadcast ${resourceType} update to room: ${roomName}`);
  } catch (error) {
    console.error(`❌ Error broadcasting ${resourceType}:`, error);
  }
};

// Мапа функцій для отримання даних
const dataFetchers = {
  tasks: getTasks,
  journals: getJournals,
  notes: getNotes,
  note_components: getNote_components,
  avatars: getAvatar,
  tags: getTags,
};

io.on("connection", (socket) => {
  console.log(`✅ Socket connected: ${socket.id}`);

  socket.on("join-user-room", async (data) => {
    const { token, resourceType, reqQuery = {} } = data;

    if (!token || !resourceType) {
      console.warn("⚠️ Join failed: Token or resourceType missing");
      return;
    }

    const userId = verifyTokenUserId(token);

    if (!userId) {
      console.warn("⚠️ Invalid token");
      return;
    }

    // Формуємо назву кімнати
    const queryString =
      Object.keys(reqQuery).length > 0 ? `:${JSON.stringify(reqQuery)}` : "";
    const room = `${resourceType}:${userId}${queryString}`;

    socket.join(room);
    console.log(`🚪 Socket ${socket.id} joined room: ${room}`);

    try {
      const fetcher = dataFetchers[resourceType];

      if (fetcher) {
        const resourceData = await fetcher(userId, reqQuery);
        socket.emit(resourceType, resourceData);
        console.log(`📤 Sent initial ${resourceType} data to ${socket.id}`);
      } else {
        console.warn(`⚠️ Unknown resource type: ${resourceType}`);
      }
    } catch (error) {
      console.error(`❌ Error fetching ${resourceType}:`, error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

const startServer = async () => {
  try {
    await connectDB();

    app.use("/api/users", userRoutes);
    app.use("/api/tasks", taskRoutes);
    app.use("/api/notes", noteRoutes);
    app.use("/api/note_components", note_componentRoutes);
    app.use("/api/journals", journalRoutes);
    app.use("/api/avatars", avatarRoutes);

    // Middleware обробки помилок
    app.use((err, req, res, next) => {
      console.error("❌ Server error:", err.stack);
      const statusCode = err.status || 500;
      res.status(statusCode).json({
        message: err.message || "Сталася внутрішня помилка сервера",
        error: process.env.NODE_ENV === "production" ? {} : err.stack,
      });
    });

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Сервер запущено на http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
