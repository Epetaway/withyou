import { Router } from "express";
import { prisma } from "../utils/prisma.js";
import { AppError } from "../errors/app-error.js";
import { jwtMiddleware } from "../middleware/jwt-middleware.js";
import { randomBytes } from "crypto";

const router = Router();

// Generate a random 6-character alphanumeric invite code
function generateInviteCode(): string {
  return randomBytes(3).toString("hex").toUpperCase();
}

router.post("/relationship/invite", jwtMiddleware, async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const existingRelationship = await prisma.relationship.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    if (existingRelationship) {
      return next(
        new AppError(
          "You are already paired",
          400,
          "ALREADY_PAIRED",
          { reason: "End your current pairing to create a new invite." }
        )
      );
    }

    const inviteCode = generateInviteCode();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invite = await prisma.relationshipInvite.create({
      data: {
        code: inviteCode,
        inviterId: userId,
        expiresAt,
        status: "pending",
      },
    });

    res.status(201).json({
      inviteCode: invite.code,
      expiresAt: invite.expiresAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/relationship/accept", jwtMiddleware, async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const { inviteCode } = req.body;

    if (!inviteCode || typeof inviteCode !== "string") {
      return next(
        new AppError("Invalid invite code", 400, "VALIDATION_ERROR")
      );
    }

    const invite = await prisma.relationshipInvite.findUnique({
      where: { code: inviteCode },
    });

    if (!invite) {
      return next(
        new AppError("Invite code is not valid", 400, "INVALID_INVITE")
      );
    }

    if (invite.status !== "pending") {
      return next(
        new AppError("This invite code has already been used", 400, "INVITE_USED")
      );
    }

    if (new Date() > invite.expiresAt) {
      return next(
        new AppError("This invite code has expired", 400, "INVITE_EXPIRED")
      );
    }

    if (invite.inviterId === userId) {
      return next(
        new AppError(
          "Cannot accept your own invite",
          400,
          "SELF_INVITE",
          { reason: "Ask your partner to generate and share an invite with you." }
        )
      );
    }

    const inviterHasActiveRelationship = await prisma.relationship.findFirst({
      where: {
        OR: [
          { userAId: invite.inviterId },
          { userBId: invite.inviterId },
        ],
        status: "active",
      },
    });

    if (inviterHasActiveRelationship) {
      return next(
        new AppError(
          "This person is already paired",
          400,
          "OTHER_ALREADY_PAIRED"
        )
      );
    }

    const accepterHasActiveRelationship = await prisma.relationship.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    if (accepterHasActiveRelationship) {
      return next(
        new AppError(
          "You must end your current pairing first",
          400,
          "SELF_ALREADY_PAIRED"
        )
      );
    }

    const relationship = await prisma.relationship.create({
      data: {
        userAId: invite.inviterId,
        userBId: userId,
        status: "active",
        stage: "dating",
      },
    });

    await prisma.relationshipInvite.update({
      where: { id: invite.id },
      data: { status: "accepted", acceptedAt: new Date(), relationshipId: relationship.id },
    });

    res.status(201).json({
      relationshipId: relationship.id,
      status: relationship.status,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/relationship/end", jwtMiddleware, async (req, res, next) => {
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
      return next(
        new AppError("No active pairing found", 400, "NO_PAIRING")
      );
    }

    await prisma.relationship.update({
      where: { id: relationship.id },
      data: { status: "ended", endedAt: new Date() },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
