import { Router, type IRouter } from "express";
import { db, usageHistoryTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { getUserFromRequest } from "../lib/auth";

const router: IRouter = Router();

router.get("/user/me", async (req, res) => {
  const user = await getUserFromRequest(req);
  return res.json({ user });
});

router.get("/user/history", async (req, res) => {
  const user = await getUserFromRequest(req);
  if (!user) return res.json({ items: [] });
  const rows = await db.select()
    .from(usageHistoryTable)
    .where(eq(usageHistoryTable.userId, user.id))
    .orderBy(desc(usageHistoryTable.createdAt))
    .limit(20);
  return res.json({
    items: rows.map(r => ({
      id: r.id,
      tool: r.tool,
      summary: r.summary,
      createdAt: r.createdAt.toISOString(),
    })),
  });
});

export default router;
