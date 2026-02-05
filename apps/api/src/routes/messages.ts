import { Router } from "express";
import type { Request } from "express";
import { chatMessageCreateSchema, chatMessageReadSchema } from "@withyou/shared";
import { prisma } from "../utils/prisma.js";
import { AppError } from "../errors/app-error.js";
import { jwtMiddleware } from "../middleware/jwt-middleware.js";

const router = Router();
type AuthedRequest = Request & { user?: { userId?: string } };

// POST /messages/send - Send a message
router.post("/send", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const parsed = chatMessageCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.issues));
    }

    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    if (!relationship) {
      return next(new AppError("No active relationship", 404, "NO_RELATIONSHIP"));
    }

    const message = await prisma.chatMessage.create({
      data: {
        relationshipId: relationship.id,
        senderId: userId,
        content: parsed.data.content,
        type: parsed.data.type ?? "text",
        mediaUrl: parsed.data.mediaUrl ?? null,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    res.json({
      message: {
        id: message.id,
        relationshipId: message.relationshipId,
        senderId: message.senderId,
        content: message.content,
        type: message.type,
        mediaUrl: message.mediaUrl,
        readAt: message.readAt?.toISOString(),
        createdAt: message.createdAt.toISOString(),
        sender: message.sender,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /messages - Get conversation messages
router.get("/", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    if (!relationship) {
      return next(new AppError("No active relationship", 404, "NO_RELATIONSHIP"));
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const messages = await prisma.chatMessage.findMany({
      where: {
        relationshipId: relationship.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    const unreadCount = await prisma.chatMessage.count({
      where: {
        relationshipId: relationship.id,
        senderId: { not: userId },
        readAt: null,
      },
    });

    res.json({
      messages: messages.map(message => ({
        id: message.id,
        relationshipId: message.relationshipId,
        senderId: message.senderId,
        content: message.content,
        type: message.type,
        mediaUrl: message.mediaUrl,
        readAt: message.readAt?.toISOString(),
        createdAt: message.createdAt.toISOString(),
        sender: message.sender,
      })).reverse(), // Reverse to show oldest first
      count: messages.length,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
});

// GET /messages/unread - Get unread message count
router.get("/unread", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    if (!relationship) {
      return next(new AppError("No active relationship", 404, "NO_RELATIONSHIP"));
    }

    const unreadCount = await prisma.chatMessage.count({
      where: {
        relationshipId: relationship.id,
        senderId: { not: userId },
        readAt: null,
      },
    });

    res.json({
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /messages/read - Mark messages as read
router.put("/read", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const parsed = chatMessageReadSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.issues));
    }

    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    if (!relationship) {
      return next(new AppError("No active relationship", 404, "NO_RELATIONSHIP"));
    }

    // Mark messages as read (only messages sent by partner)
    await prisma.chatMessage.updateMany({
      where: {
        id: { in: parsed.data.messageIds },
        relationshipId: relationship.id,
        senderId: { not: userId },
      },
      data: {
        readAt: new Date(),
      },
    });

    res.json({
      message: "Messages marked as read",
    });
  } catch (error) {
    next(error);
  }
});

// POST /messages/assistance - Request conversation assistance
router.post("/assistance", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    if (!relationship) {
      return next(new AppError("No active relationship", 404, "NO_RELATIONSHIP"));
    }

    // Get recent messages to provide context
    const recentMessages = await prisma.chatMessage.findMany({
      where: {
        relationshipId: relationship.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    // In a real implementation, this would use an AI service to provide
    // conversation starters, tips for handling arguments, etc.
    // For now, we'll return some static helpful suggestions

    const suggestions = [];

    // Analyze recent message patterns
    const hasRecentActivity = recentMessages.length > 0;
    const lastMessageTime = recentMessages[0]?.createdAt;
    const timeSinceLastMessage = lastMessageTime 
      ? Date.now() - lastMessageTime.getTime() 
      : Infinity;

    if (!hasRecentActivity || timeSinceLastMessage > 24 * 60 * 60 * 1000) {
      // No recent messages or more than 24 hours
      suggestions.push({
        type: "conversation_starter",
        title: "Check In",
        content: "How was your day today? Anything interesting happen?",
      });
      suggestions.push({
        type: "conversation_starter",
        title: "Share Appreciation",
        content: "I really appreciate when you...",
      });
      suggestions.push({
        type: "conversation_starter",
        title: "Plan Together",
        content: "What's something you'd like to do together this week?",
      });
    } else {
      // Recent conversation exists
      suggestions.push({
        type: "communication_tip",
        title: "Active Listening",
        content: "Try reflecting back what your partner said: 'What I hear you saying is...'",
      });
      suggestions.push({
        type: "communication_tip",
        title: "Use 'I' Statements",
        content: "Express your feelings with 'I feel...' instead of 'You always...'",
      });
      suggestions.push({
        type: "communication_tip",
        title: "Take a Break",
        content: "If things are getting heated, it's okay to say 'I need a moment' and come back to this.",
      });
    }

    res.json({
      suggestions,
      context: {
        recentMessageCount: recentMessages.length,
        timeSinceLastMessage: hasRecentActivity ? timeSinceLastMessage : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
