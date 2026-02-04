import { Router } from "express";
import type { Request } from "express";
import { planPayloadSchema, calendarEventPayloadSchema } from "@withyou/shared";
import { prisma } from "../utils/prisma.js";
import { AppError } from "../errors/app-error.js";
import { jwtMiddleware } from "../middleware/jwt-middleware.js";

const router = Router();
type AuthedRequest = Request & { user?: { userId?: string } };

// POST /plans - Create a new plan
router.post("/", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const parsed = planPayloadSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.issues));
    }

    const relationship = await prisma.relationship.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    const plan = await prisma.plan.create({
      data: {
        userId,
        relationshipId: relationship?.id ?? null,
        ideaId: parsed.data.ideaId ?? null,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        placeId: parsed.data.placeId ?? null,
        address: parsed.data.address ?? null,
        lat: parsed.data.lat ?? null,
        lng: parsed.data.lng ?? null,
        websiteUrl: parsed.data.websiteUrl ?? null,
        phoneNumber: parsed.data.phoneNumber ?? null,
        priceLevel: parsed.data.priceLevel ?? null,
        scheduledDate: parsed.data.scheduledDate ? new Date(parsed.data.scheduledDate) : null,
        notes: parsed.data.notes ?? null,
      },
    });

    res.json({
      plan: {
        id: plan.id,
        userId: plan.userId,
        relationshipId: plan.relationshipId,
        ideaId: plan.ideaId,
        title: plan.title,
        description: plan.description,
        placeId: plan.placeId,
        address: plan.address,
        lat: plan.lat,
        lng: plan.lng,
        websiteUrl: plan.websiteUrl,
        phoneNumber: plan.phoneNumber,
        priceLevel: plan.priceLevel,
        scheduledDate: plan.scheduledDate?.toISOString(),
        notes: plan.notes,
        createdAt: plan.createdAt.toISOString(),
        updatedAt: plan.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /plans - Get all plans for user
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

    const plans = await prisma.plan.findMany({
      where: relationship
        ? { relationshipId: relationship.id }
        : { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json({
      plans: plans.map((plan: {
        id: string;
        userId: string;
        relationshipId: string | null;
        ideaId: string | null;
        title: string;
        description: string | null;
        placeId: string | null;
        address: string | null;
        lat: number | null;
        lng: number | null;
        websiteUrl: string | null;
        phoneNumber: string | null;
        priceLevel: number | null;
        scheduledDate: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
      }) => ({
        id: plan.id,
        userId: plan.userId,
        relationshipId: plan.relationshipId,
        ideaId: plan.ideaId,
        title: plan.title,
        description: plan.description,
        placeId: plan.placeId,
        address: plan.address,
        lat: plan.lat,
        lng: plan.lng,
        websiteUrl: plan.websiteUrl,
        phoneNumber: plan.phoneNumber,
        priceLevel: plan.priceLevel,
        scheduledDate: plan.scheduledDate?.toISOString(),
        notes: plan.notes,
        createdAt: plan.createdAt.toISOString(),
        updatedAt: plan.updatedAt.toISOString(),
      })),
      count: plans.length,
    });
  } catch (error) {
    next(error);
  }
});

// POST /calendar/event - Create calendar event (returns ICS format)
router.post("/calendar/event", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const parsed = calendarEventPayloadSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.issues));
    }

    const { title, description, location, startDate, endDate, allDay } = parsed.data;

    // Generate ICS format calendar event
    const eventData: {
      title: string;
      description?: string;
      location?: string;
      startDate: Date;
      endDate: Date;
      allDay: boolean;
    } = {
      title,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : new Date(new Date(startDate).getTime() + 60 * 60 * 1000),
      allDay: allDay || false,
    };
    
    if (description) eventData.description = description;
    if (location) eventData.location = location;
    
    const icsContent = generateICS(eventData);

    // Return ICS content as downloadable
    res.setHeader("Content-Type", "text/calendar");
    res.setHeader("Content-Disposition", `attachment; filename="${title.replace(/[^a-z0-9]/gi, '_')}.ics"`);
    res.send(icsContent);
  } catch (error) {
    next(error);
  }
});

// Helper function to generate ICS format
function generateICS(event: {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
}): string {
  const formatDate = (date: Date, allDay: boolean) => {
    if (allDay) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}${month}${day}`;
    } else {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    }
  };

  const start = formatDate(event.startDate, event.allDay);
  const end = formatDate(event.endDate, event.allDay);
  const dateType = event.allDay ? "VALUE=DATE:" : "";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//WithYou//Date Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART;${dateType}${start}`,
    `DTEND;${dateType}${end}`,
    `SUMMARY:${event.title}`,
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}` : "",
    event.location ? `LOCATION:${event.location}` : "",
    `DTSTAMP:${formatDate(new Date(), false)}`,
    `UID:${Date.now()}@withyou.app`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter((line) => line)
    .join("\r\n");
}

export default router;
