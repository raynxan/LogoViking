import { Router, type IRouter } from "express";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  verifyPassword,
  createSession,
  clearSession,
  isGoogleOAuthConfigured,
  startGoogleOAuth,
  exchangeGoogleCodeForProfile,
  getGoogleRedirectUri,
  consumeOAuthState,
} from "../lib/auth";

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
  }).returning({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    plan: usersTable.plan,
    avatarUrl: usersTable.avatarUrl,
  });
  await createSession(user.id, res);
  return res.json({ ok: true, user });
});

router.post("/auth/login", async (req, res) => {
  const body = LoginBody.parse(req.body);
  const email = body.email.toLowerCase().trim();
  const rows = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  const u = rows[0];
  if (!u || !u.passwordHash || !verifyPassword(body.password, u.passwordHash)) {
    return res.status(401).json({ ok: false, message: "Invalid email or password" });
  }
  await createSession(u.id, res);
  return res.json({
    ok: true,
    user: { id: u.id, name: u.name, email: u.email, plan: u.plan, avatarUrl: u.avatarUrl },
  });
});

router.post("/auth/logout", async (req, res) => {
  await clearSession(req, res);
  return res.json({ ok: true });
});

router.get("/auth/google", (req, res) => {
  if (!isGoogleOAuthConfigured()) {
    return res.redirect("/login?error=google_not_configured");
  }
  return startGoogleOAuth(req, res);
});

router.get("/auth/google/callback", async (req, res) => {
  const expectedState = consumeOAuthState(req, res);
  const { code, state, error } = req.query as Record<string, string | undefined>;

  if (error) {
    return res.redirect(`/login?error=${encodeURIComponent(error)}`);
  }
  if (!code || !state || !expectedState || state !== expectedState) {
    return res.redirect("/login?error=invalid_state");
  }
  if (!isGoogleOAuthConfigured()) {
    return res.redirect("/login?error=google_not_configured");
  }

  try {
    const redirectUri = getGoogleRedirectUri(req);
    const profile = await exchangeGoogleCodeForProfile(code, redirectUri);
    const email = profile.email.toLowerCase().trim();
    const name = profile.name?.trim() || email.split("@")[0];
    const avatarUrl = profile.picture ?? null;

    const byGoogleId = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.googleId, profile.sub))
      .limit(1);

    let userId: number;

    if (byGoogleId.length > 0) {
      const u = byGoogleId[0];
      userId = u.id;
      if (u.avatarUrl !== avatarUrl) {
        await db.update(usersTable).set({ avatarUrl }).where(eq(usersTable.id, userId));
      }
    } else {
      const byEmail = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

      if (byEmail.length > 0) {
        // Account-linking by email is only safe when Google has verified
        // ownership of the email. Otherwise an attacker could create a Google
        // account with a victim's email and hijack the existing account.
        if (profile.email_verified !== true) {
          return res.redirect("/login?error=email_not_verified");
        }
        const u = byEmail[0];
        userId = u.id;
        await db
          .update(usersTable)
          .set({
            googleId: profile.sub,
            avatarUrl: u.avatarUrl ?? avatarUrl,
          })
          .where(eq(usersTable.id, userId));
      } else {
        if (profile.email_verified !== true) {
          return res.redirect("/login?error=email_not_verified");
        }
        const [created] = await db
          .insert(usersTable)
          .values({
            name,
            email,
            googleId: profile.sub,
            avatarUrl,
            plan: "free",
          })
          .returning({ id: usersTable.id });
        userId = created.id;
      }
    }

    await createSession(userId, res);
    return res.redirect("/dashboard");
  } catch (err) {
    req.log?.error({ err }, "Google OAuth callback failed");
    return res.redirect("/login?error=google_failed");
  }
});

export default router;
