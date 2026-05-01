import { Router, type IRouter } from "express";
import { db, usersTable, usageHistoryTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { SetUserPasswordBody } from "@workspace/api-zod";
import { getUserFromRequest, hashPassword, verifyPassword } from "../lib/auth";

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

router.post("/user/set-password", async (req, res) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ ok: false, message: "You must be signed in." });
  }

  const body = SetUserPasswordBody.parse(req.body);
  if (body.newPassword.length < 6) {
    return res.status(400).json({ ok: false, message: "Password must be at least 6 characters" });
  }

  const rows = await db
    .select({ passwordHash: usersTable.passwordHash })
    .from(usersTable)
    .where(eq(usersTable.id, user.id))
    .limit(1);
  const existing = rows[0];
  if (!existing) {
    return res.status(401).json({ ok: false, message: "Account not found." });
  }

  if (existing.passwordHash) {
    if (!body.currentPassword) {
      return res.status(400).json({ ok: false, message: "Enter your current password to change it." });
    }
    if (!verifyPassword(body.currentPassword, existing.passwordHash)) {
      return res.status(401).json({ ok: false, message: "Current password is incorrect." });
    }
  }

  const { hash } = hashPassword(body.newPassword);
  await db.update(usersTable).set({ passwordHash: hash }).where(eq(usersTable.id, user.id));

  return res.json({
    ok: true,
    message: existing.passwordHash ? "Password updated." : "Password set. You can now sign in with email and password.",
  });
});

router.post("/user/disconnect-google", async (req, res) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ ok: false, message: "You must be signed in." });
  }

  const rows = await db
    .select({ passwordHash: usersTable.passwordHash, googleId: usersTable.googleId })
    .from(usersTable)
    .where(eq(usersTable.id, user.id))
    .limit(1);
  const existing = rows[0];
  if (!existing) {
    return res.status(401).json({ ok: false, message: "Account not found." });
  }

  if (!existing.googleId) {
    return res.status(400).json({ ok: false, message: "No Google account is linked." });
  }
  if (!existing.passwordHash) {
    return res.status(400).json({
      ok: false,
      message: "Set a password first so you don't lose access to your account.",
    });
  }

  await db.update(usersTable).set({ googleId: null }).where(eq(usersTable.id, user.id));
  return res.json({ ok: true, message: "Google account disconnected." });
});

export default router;
