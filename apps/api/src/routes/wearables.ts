import { Router } from "express";
import type { Request } from "express";
import { deviceConnectionSchema, healthMetricsQuerySchema } from "@withyou/shared";
import { prisma } from "../utils/prisma.js";
import { AppError } from "../errors/app-error.js";
import { jwtMiddleware } from "../middleware/jwt-middleware.js";

const router = Router();
type AuthedRequest = Request & { user?: { userId?: string } };

// POST /wearables/devices/connect - Connect a wearable device
router.post("/devices/connect", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const parsed = deviceConnectionSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(
        new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.issues)
      );
    }

    // In a real implementation, exchange authCode with the device provider
    // For now, we'll store the token securely (should be encrypted in production)
    const device = await prisma.wearableDevice.upsert({
      where: {
        userId_deviceType: {
          userId,
          deviceType: parsed.data.deviceType,
        },
      },
      create: {
        userId,
        deviceType: parsed.data.deviceType,
        deviceName: parsed.data.deviceName,
        accessToken: parsed.data.authCode, // In production, exchange this with OAuth provider
        isActive: true,
      },
      update: {
        deviceName: parsed.data.deviceName,
        accessToken: parsed.data.authCode,
        isActive: true,
        updatedAt: new Date(),
      },
    });

    res.json({
      device: {
        id: device.id,
        userId: device.userId,
        deviceType: device.deviceType,
        deviceName: device.deviceName,
        isActive: device.isActive,
        lastSyncedAt: device.lastSyncedAt?.toISOString(),
        createdAt: device.createdAt.toISOString(),
        updatedAt: device.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /wearables/devices - List connected devices
router.get("/devices", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const devices = await prisma.wearableDevice.findMany({
      where: { userId },
    });

    res.json({
      devices: devices.map((d) => ({
        id: d.id,
        userId: d.userId,
        deviceType: d.deviceType,
        deviceName: d.deviceName,
        isActive: d.isActive,
        lastSyncedAt: d.lastSyncedAt?.toISOString(),
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      })),
      count: devices.length,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /wearables/devices/:id - Disconnect a device
router.delete("/devices/:id", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const { id } = req.params;
    if (!id) {
      return next(new AppError("Invalid device ID", 400, "INVALID_INPUT"));
    }

    const device = await prisma.wearableDevice.findUnique({
      where: { id },
    });

    if (!device) {
      return next(new AppError("Device not found", 404, "NOT_FOUND"));
    }

    if (device.userId !== userId) {
      return next(
        new AppError("You can only disconnect your own devices", 403, "FORBIDDEN")
      );
    }

    await prisma.wearableDevice.delete({
      where: { id },
    });

    res.json({ message: "Device disconnected successfully" });
  } catch (error) {
    next(error);
  }
});

// POST /wearables/metrics/sync - Sync health metrics from device
router.post(
  "/metrics/sync",
  jwtMiddleware,
  async (req: AuthedRequest, res, next) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
      }

      const { date, steps, heartRate, activeMinutes, calories, sleepDuration, syncedFrom } = req.body;

      if (!date) {
        return next(new AppError("Missing date field", 400, "VALIDATION_ERROR"));
      }

      const metricDate = new Date(date);
      metricDate.setHours(0, 0, 0, 0);

      // Create or update health metric
      const metric = await prisma.healthMetric.upsert({
        where: {
          userId_date: {
            userId,
            date: metricDate,
          },
        },
        create: {
          userId,
          date: metricDate,
          steps: steps ?? null,
          heartRate: heartRate ?? null,
          activeMinutes: activeMinutes ?? null,
          calories: calories ?? null,
          sleepDuration: sleepDuration ?? null,
          syncedFrom: syncedFrom || null,
        },
        update: {
          steps: steps ?? undefined,
          heartRate: heartRate ?? undefined,
          activeMinutes: activeMinutes ?? undefined,
          calories: calories ?? undefined,
          sleepDuration: sleepDuration ?? undefined,
          syncedFrom: syncedFrom || undefined,
          updatedAt: new Date(),
        },
      });

      // Update device last synced timestamp
      if (syncedFrom) {
        await prisma.wearableDevice.updateMany({
          where: {
            userId,
            deviceType: syncedFrom,
          },
          data: {
            lastSyncedAt: new Date(),
          },
        });
      }

      // Update challenge progress if there are active challenges
      const activeChallenges = await prisma.activityChallenge.findMany({
        where: {
          OR: [
            { initiatorId: userId },
            { participantId: userId },
          ],
          status: "active",
          endDate: {
            gt: new Date(),
          },
        },
      });

      // Update progress for each active challenge
      for (const challenge of activeChallenges) {
        const progress = await prisma.challengeProgress.findUnique({
          where: {
            challengeId_userId: {
              challengeId: challenge.id,
              userId,
            },
          },
        });

        if (progress && steps) {
          // Calculate daily steps for progress
          // This is a simplified version - in production, you'd sum daily metrics
          const _dailyIncrease = steps - (progress.totalSteps || 0);

          await prisma.challengeProgress.update({
            where: {
              challengeId_userId: {
                challengeId: challenge.id,
                userId,
              },
            },
            data: {
              totalSteps: steps,
              avgHeartRate: heartRate || progress.avgHeartRate,
              daysCompleted: steps > 0 ? (progress.daysCompleted || 0) + 1 : progress.daysCompleted,
              maxMetricValue: Math.max(progress.maxMetricValue || 0, steps || 0),
              lastUpdatedAt: new Date(),
            },
          });
        }
      }

      res.json({
        metrics: {
          id: metric.id,
          userId: metric.userId,
          date: metric.date.toISOString(),
          steps: metric.steps,
          heartRate: metric.heartRate,
          activeMinutes: metric.activeMinutes,
          calories: metric.calories,
          sleepDuration: metric.sleepDuration,
          syncedFrom: metric.syncedFrom,
          createdAt: metric.createdAt.toISOString(),
          updatedAt: metric.updatedAt.toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /wearables/metrics - Get health metrics
router.get("/metrics", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const parsed = healthMetricsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return next(
        new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.issues)
      );
    }

    const startDate = parsed.data.startDate
      ? new Date(parsed.data.startDate as string)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default: last 7 days
    const endDate = parsed.data.endDate
      ? new Date(parsed.data.endDate as string)
      : new Date();

    const metrics = await prisma.healthMetric.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        ...(parsed.data.deviceType && {
          syncedFrom: parsed.data.deviceType,
        }),
      },
      orderBy: {
        date: "desc",
      },
    });

    res.json({
      metrics: metrics.map((m) => ({
        id: m.id,
        userId: m.userId,
        date: m.date.toISOString(),
        steps: m.steps,
        heartRate: m.heartRate,
        activeMinutes: m.activeMinutes,
        calories: m.calories,
        sleepDuration: m.sleepDuration,
        syncedFrom: m.syncedFrom,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      })),
      dateRange: {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /wearables/metrics/:date - Get metrics for a specific date
router.get(
  "/metrics/:date",
  jwtMiddleware,
  async (req: AuthedRequest, res, next) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
      }

      const { date } = req.params;
      if (!date) {
        return next(new AppError("Invalid date parameter", 400, "INVALID_INPUT"));
      }

      const metricDate = new Date(date as string);
      metricDate.setHours(0, 0, 0, 0);

      const metric = await prisma.healthMetric.findUnique({
        where: {
          userId_date: {
            userId,
            date: metricDate,
          },
        },
      });

      if (!metric) {
        return next(new AppError("Metrics not found for this date", 404, "NOT_FOUND"));
      }

      res.json({
        metrics: {
          id: metric.id,
          userId: metric.userId,
          date: metric.date.toISOString(),
          steps: metric.steps,
          heartRate: metric.heartRate,
          activeMinutes: metric.activeMinutes,
          calories: metric.calories,
          sleepDuration: metric.sleepDuration,
          syncedFrom: metric.syncedFrom,
          createdAt: metric.createdAt.toISOString(),
          updatedAt: metric.updatedAt.toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
