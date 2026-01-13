import { Router } from "express";
import { z } from "zod";
import { avatarUploadSchema, profileSetupSchema } from "@withyou/shared";
import { jwtMiddleware, type AuthenticatedRequest } from "../middleware/jwt-middleware.js";
import { AppError } from "../errors/app-error.js";
import { prisma } from "../utils/prisma.js";
import { generateAvatarUploadUrl } from "../utils/s3.js";

const router = Router();

// Get pre-signed URL for avatar upload
router.get("/user/avatar/upload-url", jwtMiddleware, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }
    
    const fileType = req.query.fileType as string;
    const fileSize = req.query.fileSize ? parseInt(req.query.fileSize as string) : 0;

    const validation = avatarUploadSchema.safeParse({ fileType, fileSize });
    
    if (!validation.success) {
      return next(
        new AppError(
          "Invalid file type or size",
          400,
          "VALIDATION_ERROR",
          validation.error.issues
        )
      );
    }

    const { uploadUrl, fields, avatarUrl } = await generateAvatarUploadUrl(
      userId,
      fileType
    );

    res.status(200).json({
      uploadUrl,
      fields,
      avatarUrl,
    });
  } catch (error) {
    next(error);
  }
});

// Confirm avatar upload and update user
router.post("/user/avatar", jwtMiddleware, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }
    
    const { avatarUrl } = req.body;

    if (!avatarUrl || typeof avatarUrl !== 'string') {
      return next(
        new AppError(
          "Avatar URL is required",
          400,
          "VALIDATION_ERROR"
        )
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    res.status(200).json({ avatarUrl });
  } catch (error) {
    next(error);
  }
});

// Profile setup
router.post("/user/setup", jwtMiddleware, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }
    
    const payload = profileSetupSchema.parse(req.body);

    // Update user setup completion
    await prisma.user.update({
      where: { id: userId },
      data: {
        setupCompleted: true,
      },
    });

    // Note: The actual setup data (nickname, anniversary, goals, etc.) 
    // would be stored in additional models or user fields
    // For now, we just mark setup as completed

    res.status(200).json({
      message: "Profile setup completed",
      setupCompleted: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(
        new AppError(
          "Validation error",
          400,
          "VALIDATION_ERROR",
          error.issues.map((issue: z.ZodIssue) => ({ 
            path: issue.path.join("."), 
            message: issue.message 
          }))
        )
      );
    }
    next(error);
  }
});

export default router;
