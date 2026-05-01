import type { Request, Response } from "express";
import crypto from "node:crypto";
import { db, usersTable, sessionsTable } from "@workspace/db";
import { eq, and, gt, sql } from "drizzle-orm";

const SESSION_COOKIE = "lv_session";
const SESSION_DAYS = 30;
const isProd = process.env.NODE_ENV === "production";

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const useSalt = salt ?? crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, useSalt, 64).toString("hex");
  return { hash: `${useSalt}:${hash}`, salt: useSalt };
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const check = crypto.scryptSync(password, salt, 64).toString("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(check, "hex"));
  } catch {
    return false;
  }
}

function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number, res: Response) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessionsTable).values({ token: hashSessionToken(token), userId, expiresAt });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export async function clearSession(req: Request, res: Response) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    await db.delete(sessionsTable).where(eq(sessionsTable.token, hashSessionToken(token)));
  }
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

const ACTIVE_SUB_STATUSES = new Set(["active", "trialing", "past_due"]);

async function syncUserPlanFromStripe(
  userId: number,
  stripeCustomerId: string | null,
): Promise<{ plan: string; status: string | null; subscriptionId: string | null }> {
  if (!stripeCustomerId) {
    return { plan: "free", status: null, subscriptionId: null };
  }
  let latest: { id: string; status: string } | null = null;
  try {
    const result = await db.execute<{ id: string; status: string }>(sql`
      SELECT id, status
      FROM stripe.subscriptions
      WHERE customer = ${stripeCustomerId}
      ORDER BY created DESC NULLS LAST
      LIMIT 1
    `);
    latest = result.rows[0] ?? null;
  } catch {
    // stripe schema may not exist yet on first boot; fall through
    return { plan: "free", status: null, subscriptionId: null };
  }

  const desiredPlan =
    latest && ACTIVE_SUB_STATUSES.has(latest.status) ? "pro" : "free";
  const desiredStatus = latest?.status ?? null;
  const desiredSubId = latest?.id ?? null;

  await db
    .update(usersTable)
    .set({
      plan: desiredPlan,
      subscriptionStatus: desiredStatus,
      stripeSubscriptionId: desiredSubId,
    })
    .where(eq(usersTable.id, userId));

  return { plan: desiredPlan, status: desiredStatus, subscriptionId: desiredSubId };
}

export async function getUserFromRequest(req: Request) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return null;
  const rows = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    plan: usersTable.plan,
    avatarUrl: usersTable.avatarUrl,
    stripeCustomerId: usersTable.stripeCustomerId,
    subscriptionStatus: usersTable.subscriptionStatus,
    passwordHash: usersTable.passwordHash,
    googleId: usersTable.googleId,
  })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .where(and(eq(sessionsTable.token, hashSessionToken(token)), gt(sessionsTable.expiresAt, new Date())))
    .limit(1);
  const row = rows[0];
  if (!row) return null;

  const { plan, status } = await syncUserPlanFromStripe(
    row.id,
    row.stripeCustomerId,
  );

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatarUrl: row.avatarUrl,
    plan,
    subscriptionStatus: status,
    hasBilling: Boolean(row.stripeCustomerId),
    hasPassword: Boolean(row.passwordHash),
    hasGoogle: Boolean(row.googleId),
  };
}

const OAUTH_STATE_COOKIE = "lv_oauth_state";

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function getGoogleRedirectUri(req: Request): string {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  const proto = (req.headers["x-forwarded-proto"] as string) ?? req.protocol;
  const host = req.headers["x-forwarded-host"] ?? req.headers.host;
  return `${proto}://${host}/api/auth/google/callback`;
}

export function startGoogleOAuth(req: Request, res: Response) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    res.status(503).json({ ok: false, message: "Google sign-in is not configured." });
    return;
  }
  const state = crypto.randomBytes(24).toString("hex");
  res.cookie(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 10 * 60 * 1000,
    path: "/",
  });
  const redirectUri = getGoogleRedirectUri(req);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

export interface GoogleProfile {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

export async function exchangeGoogleCodeForProfile(
  code: string,
  redirectUri: string,
): Promise<GoogleProfile> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth is not configured");
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    throw new Error(`Google token exchange failed: ${tokenRes.status} ${text}`);
  }

  const tokenJson = (await tokenRes.json()) as { access_token?: string; id_token?: string };
  if (!tokenJson.access_token) {
    throw new Error("Google token response missing access_token");
  }

  const userRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });
  if (!userRes.ok) {
    const text = await userRes.text();
    throw new Error(`Google userinfo failed: ${userRes.status} ${text}`);
  }

  const profile = (await userRes.json()) as GoogleProfile;
  if (!profile.sub || !profile.email) {
    throw new Error("Google profile missing required fields");
  }
  return profile;
}

export function consumeOAuthState(req: Request, res: Response): string | null {
  const cookieState = req.cookies?.[OAUTH_STATE_COOKIE] ?? null;
  res.clearCookie(OAUTH_STATE_COOKIE, { path: "/" });
  return cookieState;
}
