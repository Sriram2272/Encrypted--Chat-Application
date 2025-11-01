import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketServer } from "socket.io";
import { storage } from "./storage";
import { hashPassword, verifyPassword, generateToken, verifyToken, authenticateToken, type AuthRequest } from "./auth";
import type { InsertUser, InsertMessage } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, publicKey, isAdmin } = req.body as {
        username: string;
        password: string;
        publicKey: string;
        isAdmin?: boolean;
      };

      if (!username || !password || !publicKey) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existingUser = storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const passwordHash = await hashPassword(password);
      const insertUser: InsertUser = {
        username,
        passwordHash,
        publicKey,
        isAdmin: isAdmin || false,
        disabled: false,
      };

      const user = storage.createUser(insertUser);
      const token = generateToken({
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
      });

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Missing credentials" });
      }

      const user = storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (user.disabled) {
        return res.status(403).json({ error: "Account disabled" });
      }

      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken({
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
      });

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // User routes
  app.get("/api/users", authenticateToken, (req: AuthRequest, res) => {
    const users = storage.getAllUsers().map(u => ({
      id: u.id,
      username: u.username,
      publicKey: u.publicKey,
      isAdmin: u.isAdmin,
      disabled: u.disabled,
    }));
    res.json(users);
  });

  app.get("/api/users/:id/pubkey", authenticateToken, (req: AuthRequest, res) => {
    const userId = parseInt(req.params.id);
    const user = storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      username: user.username,
      publicKey: user.publicKey,
    });
  });

  // Admin routes
  app.post("/api/admin/users/:id/toggle", authenticateToken, (req: AuthRequest, res) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const userId = parseInt(req.params.id);
    const user = storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    storage.updateUserDisabled(userId, !user.disabled);
    res.json({ success: true });
  });

  app.get("/api/admin/messages", authenticateToken, (req: AuthRequest, res) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const messages = storage.getAllMessages().map(msg => {
      const sender = storage.getUser(msg.sender);
      const receiver = storage.getUser(msg.receiver);
      return {
        id: msg.id,
        sender: msg.sender,
        senderUsername: sender?.username || "Unknown",
        receiver: msg.receiver,
        receiverUsername: receiver?.username || "Unknown",
        ciphertext: msg.ciphertext,
        nonce: msg.nonce,
        createdAt: msg.createdAt,
      };
    });

    res.json(messages);
  });

  const httpServer = createServer(app);
  
  // WebSocket setup
  const io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Track online users with socket ID mapping (for multi-tab support)
  const userSockets = new Map<number, Set<string>>();

  const getUserOnlineStatus = (): number[] => {
    return Array.from(userSockets.keys());
  };

  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    try {
      const user = verifyToken(token);
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.user.id;
    socket.join(`user:${userId}`);

    // Track this socket for the user
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
      // Only emit status change if this is the first socket for this user
      io.emit("user_status", { userId, online: true });
    }
    userSockets.get(userId)!.add(socket.id);

    // Send initial online users list to the connecting client
    socket.emit("online_users", getUserOnlineStatus());

    console.log(`User ${socket.data.user.username} connected`);

    socket.on("send_message", (payload: { to: number; ciphertext: string; nonce: string }) => {
      const insertMessage: InsertMessage = {
        sender: userId,
        receiver: payload.to,
        ciphertext: payload.ciphertext,
        nonce: payload.nonce,
      };

      const message = storage.createMessage(insertMessage);
      
      // Send to receiver
      io.to(`user:${payload.to}`).emit("message", {
        id: message.id,
        from: userId,
        ciphertext: payload.ciphertext,
        nonce: payload.nonce,
        timestamp: message.createdAt,
      });

      // Acknowledge to sender
      socket.emit("message_sent", {
        id: message.id,
        timestamp: message.createdAt,
      });
    });

    socket.on("fetch_messages", ({ withUser }: { withUser: number }) => {
      const messages = storage.getMessagesBetweenUsers(userId, withUser);
      socket.emit("messages", messages);
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.data.user.username} disconnected`);
      
      // Remove this socket from user's socket set
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        // Only mark user as offline if they have no more active sockets
        if (sockets.size === 0) {
          userSockets.delete(userId);
          io.emit("user_status", { userId, online: false });
        }
      }
    });
  });

  return httpServer;
}
