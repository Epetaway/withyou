import { z } from "zod";
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { registerSchema, loginSchema } from "@withyou/shared";
import { prisma } from "../utils/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";

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
      },
    });

    const token = jwt.sign({ sub: user.id }, env.jwtSecret, {
      expiresIn: "7d",
    });

    res.status(201).json({ 
      token,
      userId: user.id
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

    res.status(200).json({ 
      token,
      userId: user.id
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

export default router;
