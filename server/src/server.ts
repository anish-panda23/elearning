import express, { Request, Response, NextFunction } from "express";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import { Server as SocketIOServer } from "socket.io";
import pino from "pino";
import { handleAICourseAskStream, handleGenerateQuiz, handleSmartCourseSearch } from "./controllers/ai.controller";

export const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
});

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/elearning";

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Real-time Socket.io
const activeCourseUsers = new Map<string, Set<string>>();

io.on("connection", (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on("join-course", ({ courseId, userId }) => {
    socket.join(courseId);
    if (!activeCourseUsers.has(courseId)) {
      activeCourseUsers.set(courseId, new Set());
    }
    activeCourseUsers.get(courseId)?.add(userId || socket.id);
    io.to(courseId).emit("active-users-count", activeCourseUsers.get(courseId)?.size || 0);
  });

  socket.on("leave-course", ({ courseId, userId }) => {
    socket.leave(courseId);
    activeCourseUsers.get(courseId)?.delete(userId || socket.id);
    io.to(courseId).emit("active-users-count", activeCourseUsers.get(courseId)?.size || 0);
  });

  socket.on("disconnect", () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Observability & Health Check
app.get("/health", async (req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "UP" : "DOWN";
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    },
  });
});

// AI & RAG Routes
app.get("/ai/ask-stream", handleAICourseAskStream);
app.post("/ai/generate-quiz", handleGenerateQuiz);
app.get("/ai/smart-search", handleSmartCourseSearch);

// Fallback Route Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong",
  });
});

if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      logger.info("MongoDB connected successfully");
      server.listen(PORT, () => {
        logger.info(`Server running with TypeScript & Socket.io on port ${PORT}`);
      });
    })
    .catch((e) => logger.error(`MongoDB connection error: ${e.message}`));
}

export { app, server, io };
