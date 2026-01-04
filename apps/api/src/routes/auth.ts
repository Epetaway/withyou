import { z } from "zod";
import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";

// Define schemas locally to avoid import issues
const emailSchema = z.string().trim().email();
const passwordSchema = z.string().min(8);

const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

const router = Router();

router.post("/auth/register", async (req: Request, res: Response, next: NextFunction) => {
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
      },
    });

    const token = jwt.sign({ sub: user.id }, env.jwtSecret, {
      expiresIn: "7d",
    });

    res.status(201).json({ userId: user.id, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      return next(
        new AppError(
          "Validation error",
          400,
          "VALIDATION_ERROR",
          Object.entries(fieldErrors).map(([field, messages]) => ({ field, messages: messages || [] }))
        )
      );
    }
    next(error);
  }
});

router.post("/auth/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
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

    res.status(200).json({ userId: user.id, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      return next(
        new AppError(
          "Validation error",
          400,
          "VALIDATION_ERROR",
          Object.entries(fieldErrors).map(([field, messages]) => ({ field, messages: messages || [] }))
        )
      );
    }
    next(error);
  }
});

export default router;
