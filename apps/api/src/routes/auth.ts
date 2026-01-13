import { z } from "zod";
import { Router } from "express";
import type { Request } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { registerSchema, loginSchema, oauthLoginSchema, emailVerifySchema, emailVerifySendSchema } from "@withyou/shared";
import { prisma } from "../utils/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";
import { verifyGoogleToken, verifyAppleToken } from "../utils/oauth.js";
import { generateVerificationCode, sendVerificationEmail } from "../utils/ses.js";
import { jwtMiddleware, type AuthenticatedRequest } from "../middleware/jwt-middleware.js";

const router = Router();

router.post("/auth/register", async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (existingUser) {
      return next(
        new AppError(
          "Email already in use",
          400,
          "EMAIL_IN_USE",
          { email: "This email is already registered." }
        )
      );
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    const user = await prisma.user.create({
      data: {
        email: payload.email,
        passwordHash,
        oauthProvider: 'email',
      },
    });

    const token = jwt.sign({ sub: user.id }, env.jwtSecret, {
      expiresIn: "7d",
    });

    res.status(201).json({ 
      token,
      userId: user.id,
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(
        new AppError(
          "Validation error",
          400,
          "VALIDATION_ERROR",
          error.issues.map((issue: z.ZodIssue) => ({ path: issue.path.join("."), message: issue.message }))
        )
      );
    }
    next(error);
  }
});

router.post("/auth/login", async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user || !user.passwordHash) {
      return next(
        new AppError(
          "Email or password is incorrect",
          401,
          "INVALID_CREDENTIALS"
        )
      );
    }

    const passwordValid = await bcrypt.compare(payload.password, user.passwordHash);

    if (!passwordValid) {
      return next(
        new AppError(
          "Email or password is incorrect",
          401,
          "INVALID_CREDENTIALS"
        )
      );
    }

    const token = jwt.sign({ sub: user.id }, env.jwtSecret, {
      expiresIn: "7d",
    });

    res.status(200).json({ 
      token,
      userId: user.id,
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(
        new AppError(
          "Validation error",
          400,
          "VALIDATION_ERROR",
          error.issues.map((issue: z.ZodIssue) => ({ path: issue.path.join("."), message: issue.message }))
        )
      );
    }
    next(error);
  }
});

// OAuth endpoints
router.post("/auth/google", async (req, res, next) => {
  try {
    const payload = oauthLoginSchema.parse(req.body);

    const userInfo = await verifyGoogleToken(payload.idToken);

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userInfo.email, oauthProvider: 'google' },
          { oauthProvider: 'google', oauthId: userInfo.oauthId },
        ],
      },
    });

    let isNewUser = false;

    if (!user) {
      // Check if email exists with different provider
      const existingEmailUser = await prisma.user.findUnique({
        where: { email: userInfo.email },
      });

      if (existingEmailUser) {
        return next(
          new AppError(
            "Email already registered with different sign-in method",
            400,
            "EMAIL_CONFLICT",
            { email: "This email is already registered. Please use your original sign-in method." }
          )
        );
      }

      // Create new user
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          oauthProvider: 'google',
          oauthId: userInfo.oauthId,
          emailVerified: userInfo.emailVerified,
          avatarUrl: userInfo.avatarUrl || null,
        },
      });
      isNewUser = true;
    }

    const token = jwt.sign({ sub: user.id }, env.jwtSecret, {
      expiresIn: "7d",
    });

    res.status(200).json({
      token,
      userId: user.id,
      isNewUser,
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(
        new AppError(
          "Validation error",
          400,
          "VALIDATION_ERROR",
          error.issues.map((issue: z.ZodIssue) => ({ path: issue.path.join("."), message: issue.message }))
        )
      );
    }
    next(error);
  }
});

router.post("/auth/apple", async (req, res, next) => {
  try {
    const payload = oauthLoginSchema.parse(req.body);

    const userInfo = await verifyAppleToken(payload.idToken);

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userInfo.email, oauthProvider: 'apple' },
          { oauthProvider: 'apple', oauthId: userInfo.oauthId },
        ],
      },
    });

    let isNewUser = false;

    if (!user) {
      // Check if email exists with different provider
      const existingEmailUser = await prisma.user.findUnique({
        where: { email: userInfo.email },
      });

      if (existingEmailUser) {
        return next(
          new AppError(
            "Email already registered with different sign-in method",
            400,
            "EMAIL_CONFLICT",
            { email: "This email is already registered. Please use your original sign-in method." }
          )
        );
      }

      // Create new user
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          oauthProvider: 'apple',
          oauthId: userInfo.oauthId,
          emailVerified: userInfo.emailVerified,
        },
      });
      isNewUser = true;
    }

    const token = jwt.sign({ sub: user.id }, env.jwtSecret, {
      expiresIn: "7d",
    });

    res.status(200).json({
      token,
      userId: user.id,
      isNewUser,
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(
        new AppError(
          "Validation error",
          400,
          "VALIDATION_ERROR",
          error.issues.map((issue: z.ZodIssue) => ({ path: issue.path.join("."), message: issue.message }))
        )
      );
    }
    next(error);
  }
});

// Email verification endpoints
router.post("/auth/verify/send", jwtMiddleware, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return next(new AppError("User not found", 404, "USER_NOT_FOUND"));
    }

    if (user.emailVerified) {
      return next(
        new AppError(
          "Email already verified",
          400,
          "EMAIL_ALREADY_VERIFIED"
        )
      );
    }

    // Check rate limiting: max 3 sends per 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentVerifications = await prisma.emailVerification.count({
      where: {
        userId,
        createdAt: { gte: fifteenMinutesAgo },
      },
    });

    if (recentVerifications >= 3) {
      return next(
        new AppError(
          "Too many verification requests. Please try again later.",
          429,
          "RATE_LIMIT_EXCEEDED"
        )
      );
    }

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.emailVerification.create({
      data: {
        userId,
        code,
        expiresAt,
      },
    });

    await sendVerificationEmail(user.email, code);

    res.status(200).json({
      message: "Verification code sent",
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/auth/verify/confirm", jwtMiddleware, async (req: AuthenticatedRequest, res, next) => {
  try {
    const payload = emailVerifySchema.parse(req.body);
    const userId = req.user?.userId;
    
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const verification = await prisma.emailVerification.findFirst({
      where: {
        userId,
        code: payload.code,
        verified: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      return next(
        new AppError(
          "Invalid or expired verification code",
          400,
          "INVALID_CODE"
        )
      );
    }

    // Mark verification as verified and update user
    await prisma.$transaction([
      prisma.emailVerification.update({
        where: { id: verification.id },
        data: { verified: true },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true },
      }),
    ]);

    res.status(200).json({
      message: "Email verified successfully",
      verified: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(
        new AppError(
          "Validation error",
          400,
          "VALIDATION_ERROR",
          error.issues.map((issue: z.ZodIssue) => ({ path: issue.path.join("."), message: issue.message }))
        )
      );
    }
    next(error);
  }
});

router.post("/auth/verify/resend", jwtMiddleware, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return next(new AppError("User not found", 404, "USER_NOT_FOUND"));
    }

    if (user.emailVerified) {
      return next(
        new AppError(
          "Email already verified",
          400,
          "EMAIL_ALREADY_VERIFIED"
        )
      );
    }

    // Check rate limiting
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentVerifications = await prisma.emailVerification.count({
      where: {
        userId,
        createdAt: { gte: fifteenMinutesAgo },
      },
    });

    if (recentVerifications >= 3) {
      return next(
        new AppError(
          "Too many verification requests. Please try again later.",
          429,
          "RATE_LIMIT_EXCEEDED"
        )
      );
    }

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.emailVerification.create({
      data: {
        userId,
        code,
        expiresAt,
      },
    });

    await sendVerificationEmail(user.email, code);

    res.status(200).json({
      message: "Verification code sent",
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
