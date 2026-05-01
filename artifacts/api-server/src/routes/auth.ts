import { Router, type IRouter } from "express";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, createSession, clearSession } from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res) => {
  const body = RegisterBody.parse(req.body);
  const email = body.email.toLowerCase().trim();
  if (body.password.length < 6) {
    return res.status(400).json({ ok: false, message: "Password must be at least 6 characters" });
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    return res.status(409).json({ ok: false, message: "Email already registered" });
  }
  const { hash } = hashPassword(body.password);
  const [user] = await db.insert(usersTable).values({
    name: body.name,
    email,
    passwordHash: hash,
    plan: "free",
  }).returning({ id: usersTable.id, name: usersTable.name, email: usersTable.email, plan: usersTable.plan });
  await createSession(user.id, res);
  return res.json({ ok: true, user });
});

router.post("/auth/login", async (req, res) => {
  const body = LoginBody.parse(req.body);
  const email = body.email.toLowerCase().trim();
  const rows = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  const u = rows[0];
  if (!u || !verifyPassword(body.password, u.passwordHash)) {
    return res.status(401).json({ ok: false, message: "Invalid email or password" });
  }
  await createSession(u.id, res);
  return res.json({ ok: true, user: { id: u.id, name: u.name, email: u.email, plan: u.plan } });
});

router.post("/auth/logout", async (req, res) => {
  await clearSession(req, res);
  return res.json({ ok: true });
});

export default router;
