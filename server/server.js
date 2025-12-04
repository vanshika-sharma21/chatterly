import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from "socket.io";

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialise Socket.io
export const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

// Store online users
export const userSockcetMap = {}; // {userId: socketId}

// Socket.io Events
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if (userId) userSockcetMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSockcetMap));

    socket.on("disconnect", () => {
        console.log("User Disconnected", userId);
        delete userSockcetMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSockcetMap));
    });
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "4mb" }));

// Root Route (for Vercel preview)
app.get("/", (req, res) => {
    res.send("Backend is running successfully 🚀");
});

// API Routes
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Connect DB
await connectDB();

// Start server in BOTH local & Vercel
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Export for Vercel
export default app;
