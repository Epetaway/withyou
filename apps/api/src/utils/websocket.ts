import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "./prisma.js";

export interface AuthenticatedSocket extends SocketIOServer {
  userId?: string;
  relationshipId?: string;
}

export let io: SocketIOServer;

export function initializeWebSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.allowedOrigins.length > 0 ? env.allowedOrigins : "*",
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace("Bearer ", "");
      
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, env.jwtSecret) as { userId: string };
      
      if (!decoded.userId) {
        return next(new Error("Invalid token"));
      }

      // Attach user info to socket
      (socket as any).userId = decoded.userId;

      // Find the user's active relationship
      const relationship = await prisma.relationship.findFirst({
        where: {
          OR: [{ userAId: decoded.userId }, { userBId: decoded.userId }],
          status: "active",
        },
      });

      if (relationship) {
        (socket as any).relationshipId = relationship.id;
      }

      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = (socket as any).userId;
    const relationshipId = (socket as any).relationshipId;

    console.log(`User ${userId} connected via WebSocket`);

    // Join user-specific room
    socket.join(`user:${userId}`);

    // Join relationship rooms if user is paired
    if (relationshipId) {
      socket.join(`relationship:${relationshipId}`);
      socket.join(`workout:${relationshipId}`);
      socket.join(`grocery:${relationshipId}`);
      socket.join(`chat:${relationshipId}`);
      
      console.log(`User ${userId} joined relationship rooms for ${relationshipId}`);
    }

    // Handle typing indicator for chat
    socket.on("typing:start", () => {
      if (relationshipId) {
        socket.to(`chat:${relationshipId}`).emit("partner:typing", { userId, typing: true });
      }
    });

    socket.on("typing:stop", () => {
      if (relationshipId) {
        socket.to(`chat:${relationshipId}`).emit("partner:typing", { userId, typing: false });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected`);
    });
  });

  console.log("WebSocket server initialized");
  return io;
}

// Helper function to emit events to a specific relationship
export function emitToRelationship(relationshipId: string, event: string, data: any) {
  if (io) {
    io.to(`relationship:${relationshipId}`).emit(event, data);
  }
}

// Helper function to emit workout events
export function emitWorkoutEvent(relationshipId: string, event: string, data: any) {
  if (io) {
    io.to(`workout:${relationshipId}`).emit(event, data);
  }
}

// Helper function to emit grocery events
export function emitGroceryEvent(relationshipId: string, event: string, data: any) {
  if (io) {
    io.to(`grocery:${relationshipId}`).emit(event, data);
  }
}

// Helper function to emit chat events
export function emitChatEvent(relationshipId: string, event: string, data: any) {
  if (io) {
    io.to(`chat:${relationshipId}`).emit(event, data);
  }
}
