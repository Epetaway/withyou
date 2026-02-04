import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma.js";
import { AppError } from "../errors/app-error.js";
import { env } from "../config/env.js";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const router = Router();

// QA Admin Token middleware
const qaAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["qa-admin-token"] || req.headers["qa_admin_token"];
  
  if (!env.qaAdminToken) {
    return next(new AppError("QA endpoints are not configured", 503, "QA_NOT_CONFIGURED"));
  }
  
  if (!token || token !== env.qaAdminToken) {
    return next(new AppError("Unauthorized: Invalid QA admin token", 401, "UNAUTHORIZED"));
  }
  
  next();
};

// POST /qa/reset - Wipe only test-tagged data
router.post("/qa/reset", qaAdminAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const QA_TAG = "e2e-test";
    
    // Delete in correct order to avoid foreign key constraints
    await prisma.savedIdea.deleteMany({
      where: {
        user: {
          isTestUser: true,
          testTag: QA_TAG,
        },
      },
    });

    await prisma.ideaRequest.deleteMany({
      where: {
        user: {
          isTestUser: true,
          testTag: QA_TAG,
        },
      },
    });

    await prisma.preference.deleteMany({
      where: {
        user: {
          isTestUser: true,
          testTag: QA_TAG,
        },
      },
    });

    await prisma.checkin.deleteMany({
      where: {
        user: {
          isTestUser: true,
          testTag: QA_TAG,
        },
      },
    });

    await prisma.note.deleteMany({
      where: {
        user: {
          isTestUser: true,
          testTag: QA_TAG,
        },
      },
    });

    await prisma.plan.deleteMany({
      where: {
        user: {
          isTestUser: true,
          testTag: QA_TAG,
        },
      },
    });

    await prisma.activityPreferences.deleteMany({
      where: {
        user: {
          isTestUser: true,
          testTag: QA_TAG,
        },
      },
    });

    await prisma.moodCheckin.deleteMany({
      where: {
        user: {
          isTestUser: true,
          testTag: QA_TAG,
        },
      },
    });

    await prisma.emailVerification.deleteMany({
      where: {
        user: {
          isTestUser: true,
          testTag: QA_TAG,
        },
      },
    });

    await prisma.relationshipInvite.deleteMany({
      where: {
        inviter: {
          isTestUser: true,
          testTag: QA_TAG,
        },
      },
    });

    await prisma.relationship.deleteMany({
      where: {
        isTest: true,
      },
    });

    await prisma.user.deleteMany({
      where: {
        isTestUser: true,
        testTag: QA_TAG,
      },
    });

    console.log("QA data reset completed");

    res.status(200).json({
      message: "Test data reset successfully",
      tag: QA_TAG,
    });
  } catch (error) {
    console.error("QA reset error:", error);
    next(error);
  }
});

// POST /qa/seed - Run E2E seed script
router.post("/qa/seed", qaAdminAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const seedScriptPath = path.join(__dirname, "../../prisma/seed-e2e.ts");
    
    console.log("Running E2E seed script...");
    const { stdout, stderr } = await execAsync(`npx tsx ${seedScriptPath}`, {
      cwd: path.join(__dirname, "../.."),
    });

    if (stderr && !stderr.includes("ExperimentalWarning")) {
      console.error("Seed stderr:", stderr);
    }
    
    console.log("E2E seed output:", stdout);

    res.status(200).json({
      message: "E2E seed completed successfully",
      output: stdout,
    });
  } catch (error) {
    console.error("QA seed error:", error);
    next(new AppError(
      "Failed to run E2E seed script",
      500,
      "SEED_FAILED",
      error instanceof Error ? error.message : String(error)
    ));
  }
});

export default router;