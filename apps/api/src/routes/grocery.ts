import { Router } from "express";
import type { Request } from "express";
import {
  groceryListCreateSchema,
  groceryItemCreateSchema,
  groceryItemUpdateSchema,
  groceryItemVetoSchema,
} from "@withyou/shared";
import { prisma } from "../utils/prisma.js";
import { AppError } from "../errors/app-error.js";
import { jwtMiddleware } from "../middleware/jwt-middleware.js";
import { emitGroceryEvent } from "../utils/websocket.js";

const router = Router();
type AuthedRequest = Request & { user?: { userId?: string } };

// POST /grocery/lists - Create a new grocery list
router.post("/lists", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const parsed = groceryListCreateSchema.safeParse(req.body);
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

    const list = await prisma.groceryList.create({
      data: {
        relationshipId: relationship.id,
        name: parsed.data.name,
      },
    });

    res.json({
      list: {
        id: list.id,
        relationshipId: list.relationshipId,
        name: list.name,
        createdAt: list.createdAt.toISOString(),
        updatedAt: list.updatedAt.toISOString(),
        items: [],
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /grocery/lists - Get all grocery lists for relationship
router.get("/lists", jwtMiddleware, async (req: AuthedRequest, res, next) => {
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

    const lists = await prisma.groceryList.findMany({
      where: {
        relationshipId: relationship.id,
      },
      include: {
        items: {
          include: {
            addedByUser: {
              select: {
                id: true,
                email: true,
              },
            },
            vetoByUser: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      lists: lists.map(list => ({
        id: list.id,
        relationshipId: list.relationshipId,
        name: list.name,
        createdAt: list.createdAt.toISOString(),
        updatedAt: list.updatedAt.toISOString(),
        items: list.items.map(item => ({
          id: item.id,
          listId: item.listId,
          addedBy: item.addedBy,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          vetoed: item.vetoed,
          vetoedBy: item.vetoedBy,
          vetoReason: item.vetoReason,
          completedAt: item.completedAt?.toISOString(),
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
          addedByUser: item.addedByUser,
          vetoByUser: item.vetoByUser,
        })),
      })),
      count: lists.length,
    });
  } catch (error) {
    next(error);
  }
});

// GET /grocery/lists/:id - Get a specific grocery list
router.get("/lists/:id", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const { id } = req.params;
    if (!id) {
      return next(new AppError("List ID required", 400, "INVALID_INPUT"));
    }

    const list = await prisma.groceryList.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            addedByUser: {
              select: {
                id: true,
                email: true,
              },
            },
            vetoByUser: {
              select: {
                id: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!list) {
      return next(new AppError("List not found", 404, "NOT_FOUND"));
    }

    // Check access
    const relationship = await prisma.relationship.findFirst({
      where: {
        id: list.relationshipId,
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    if (!relationship) {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }

    res.json({
      list: {
        id: list.id,
        relationshipId: list.relationshipId,
        name: list.name,
        createdAt: list.createdAt.toISOString(),
        updatedAt: list.updatedAt.toISOString(),
        items: list.items.map(item => ({
          id: item.id,
          listId: item.listId,
          addedBy: item.addedBy,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          vetoed: item.vetoed,
          vetoedBy: item.vetoedBy,
          vetoReason: item.vetoReason,
          completedAt: item.completedAt?.toISOString(),
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
          addedByUser: item.addedByUser,
          vetoByUser: item.vetoByUser,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /grocery/lists/:id/items - Add item to grocery list
router.post("/lists/:id/items", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const { id } = req.params;
    if (!id) {
      return next(new AppError("List ID required", 400, "INVALID_INPUT"));
    }

    const parsed = groceryItemCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.issues));
    }

    const list = await prisma.groceryList.findUnique({
      where: { id },
    });

    if (!list) {
      return next(new AppError("List not found", 404, "NOT_FOUND"));
    }

    // Check access
    const relationship = await prisma.relationship.findFirst({
      where: {
        id: list.relationshipId,
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    if (!relationship) {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }

    const item = await prisma.groceryItem.create({
      data: {
        listId: id,
        addedBy: userId,
        name: parsed.data.name,
        quantity: parsed.data.quantity ?? 1,
        unit: parsed.data.unit ?? null,
      },
      include: {
        addedByUser: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    const itemResponse = {
      id: item.id,
      listId: item.listId,
      addedBy: item.addedBy,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      vetoed: item.vetoed,
      vetoedBy: item.vetoedBy,
      vetoReason: item.vetoReason,
      completedAt: item.completedAt?.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      addedByUser: item.addedByUser,
    };

    // Emit real-time event
    emitGroceryEvent(list.relationshipId, "item:added", itemResponse);

    res.json({ item: itemResponse });
  } catch (error) {
    next(error);
  }
});

// PUT /grocery/lists/:listId/items/:itemId - Update grocery item
router.put("/lists/:listId/items/:itemId", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const { listId, itemId } = req.params;
    if (!listId || !itemId) {
      return next(new AppError("List ID and Item ID required", 400, "INVALID_INPUT"));
    }

    const parsed = groceryItemUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.issues));
    }

    const item = await prisma.groceryItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.listId !== listId) {
      return next(new AppError("Item not found", 404, "NOT_FOUND"));
    }

    const list = await prisma.groceryList.findUnique({
      where: { id: listId },
    });

    if (!list) {
      return next(new AppError("List not found", 404, "NOT_FOUND"));
    }

    // Check access
    const relationship = await prisma.relationship.findFirst({
      where: {
        id: list.relationshipId,
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    if (!relationship) {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }

    const updateData: {
      name?: string;
      quantity?: number;
      unit?: string | null;
      completedAt?: Date | null;
    } = {};

    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.quantity !== undefined) updateData.quantity = parsed.data.quantity;
    if (parsed.data.unit !== undefined) updateData.unit = parsed.data.unit;
    if (parsed.data.completed !== undefined) {
      updateData.completedAt = parsed.data.completed ? new Date() : null;
    }

    const updated = await prisma.groceryItem.update({
      where: { id: itemId },
      data: updateData,
      include: {
        addedByUser: {
          select: {
            id: true,
            email: true,
          },
        },
        vetoByUser: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    const itemResponse = {
      id: updated.id,
      listId: updated.listId,
      addedBy: updated.addedBy,
      name: updated.name,
      quantity: updated.quantity,
      unit: updated.unit,
      vetoed: updated.vetoed,
      vetoedBy: updated.vetoedBy,
      vetoReason: updated.vetoReason,
      completedAt: updated.completedAt?.toISOString(),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      addedByUser: updated.addedByUser,
      vetoByUser: updated.vetoByUser,
    };

    // Emit real-time event
    emitGroceryEvent(list.relationshipId, "item:updated", itemResponse);

    res.json({ item: itemResponse });
  } catch (error) {
    next(error);
  }
});

// POST /grocery/lists/:listId/items/:itemId/veto - Veto a grocery item
router.post("/lists/:listId/items/:itemId/veto", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const { listId, itemId } = req.params;
    if (!listId || !itemId) {
      return next(new AppError("List ID and Item ID required", 400, "INVALID_INPUT"));
    }

    const parsed = groceryItemVetoSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.issues));
    }

    const item = await prisma.groceryItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.listId !== listId) {
      return next(new AppError("Item not found", 404, "NOT_FOUND"));
    }

    // Can't veto your own items
    if (item.addedBy === userId) {
      return next(new AppError("Cannot veto your own items", 400, "INVALID_VETO"));
    }

    const list = await prisma.groceryList.findUnique({
      where: { id: listId },
    });

    if (!list) {
      return next(new AppError("List not found", 404, "NOT_FOUND"));
    }

    // Check access
    const relationship = await prisma.relationship.findFirst({
      where: {
        id: list.relationshipId,
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    if (!relationship) {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }

    const updated = await prisma.groceryItem.update({
      where: { id: itemId },
      data: {
        vetoed: true,
        vetoedBy: userId,
        vetoReason: parsed.data.vetoReason ?? null,
      },
      include: {
        addedByUser: {
          select: {
            id: true,
            email: true,
          },
        },
        vetoByUser: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    const itemResponse = {
      id: updated.id,
      listId: updated.listId,
      addedBy: updated.addedBy,
      name: updated.name,
      quantity: updated.quantity,
      unit: updated.unit,
      vetoed: updated.vetoed,
      vetoedBy: updated.vetoedBy,
      vetoReason: updated.vetoReason,
      completedAt: updated.completedAt?.toISOString(),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      addedByUser: updated.addedByUser,
      vetoByUser: updated.vetoByUser,
    };

    // Emit real-time event
    emitGroceryEvent(list.relationshipId, "item:vetoed", itemResponse);

    res.json({ item: itemResponse });
  } catch (error) {
    next(error);
  }
});

// DELETE /grocery/lists/:listId/items/:itemId - Delete grocery item
router.delete("/lists/:listId/items/:itemId", jwtMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const { listId, itemId } = req.params;
    if (!listId || !itemId) {
      return next(new AppError("List ID and Item ID required", 400, "INVALID_INPUT"));
    }

    const item = await prisma.groceryItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.listId !== listId) {
      return next(new AppError("Item not found", 404, "NOT_FOUND"));
    }

    const list = await prisma.groceryList.findUnique({
      where: { id: listId },
    });

    if (!list) {
      return next(new AppError("List not found", 404, "NOT_FOUND"));
    }

    // Check access
    const relationship = await prisma.relationship.findFirst({
      where: {
        id: list.relationshipId,
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "active",
      },
    });

    if (!relationship) {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }

    await prisma.groceryItem.delete({
      where: { id: itemId },
    });

    // Emit real-time event
    emitGroceryEvent(list.relationshipId, "item:deleted", { itemId });

    res.json({
      message: "Item deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
