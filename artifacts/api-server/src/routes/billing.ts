import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getUserFromRequest } from "../lib/auth";
import {
  getUncachableStripeClient,
  isStripeConfigured,
} from "../lib/stripeClient";

const router: IRouter = Router();

const checkoutBodySchema = z.object({
  priceId: z.string().min(1).optional(),
});

type ProductRow = {
  id: string;
  name: string | null;
  description: string | null;
  metadata: Record<string, string> | null;
  price_id: string | null;
  unit_amount: number | null;
  currency: string | null;
  recurring: { interval?: string; interval_count?: number } | null;
} & Record<string, unknown>;

router.get("/billing/plans", async (_req, res) => {
  if (!isStripeConfigured()) {
    return res.json({ plans: [], configured: false });
  }
  try {
    const result = await db.execute<ProductRow>(sql`
      SELECT
        p.id,
        p.name,
        p.description,
        p.metadata,
        pr.id as price_id,
        pr.unit_amount,
        pr.currency,
        pr.recurring
      FROM stripe.products p
      LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
      WHERE p.active = true
      ORDER BY p.name, pr.unit_amount
    `);

    const plansMap = new Map<
      string,
      {
        id: string;
        name: string;
        description: string | null;
        prices: Array<{
          id: string;
          unitAmount: number;
          currency: string;
          interval: string | null;
        }>;
      }
    >();

    for (const row of result.rows) {
      if (!plansMap.has(row.id)) {
        plansMap.set(row.id, {
          id: row.id,
          name: row.name ?? "",
          description: row.description,
          prices: [],
        });
      }
      if (row.price_id && row.unit_amount != null && row.currency) {
        plansMap.get(row.id)!.prices.push({
          id: row.price_id,
          unitAmount: row.unit_amount,
          currency: row.currency,
          interval: row.recurring?.interval ?? null,
        });
      }
    }

    return res.json({ plans: Array.from(plansMap.values()), configured: true });
  } catch (err) {
    // Stripe schema may not exist yet (first boot before runMigrations)
    return res.json({ plans: [], configured: false });
  }
});

router.post("/billing/checkout", async (req, res) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ ok: false, error: "Sign in to upgrade." });
  }
  if (!isStripeConfigured()) {
    return res
      .status(503)
      .json({ ok: false, error: "Billing is not configured." });
  }

  const parsed = checkoutBodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: "Invalid request" });
  }

  const stripe = await getUncachableStripeClient();

  let priceId = parsed.data.priceId;
  if (!priceId) {
    const lookup = await db.execute<{ id: string }>(sql`
      SELECT pr.id
      FROM stripe.prices pr
      JOIN stripe.products p ON p.id = pr.product
      WHERE pr.active = true
        AND p.active = true
        AND pr.recurring->>'interval' = 'month'
      ORDER BY pr.unit_amount ASC
      LIMIT 1
    `);
    priceId = lookup.rows[0]?.id;
  }
  if (!priceId) {
    return res.status(400).json({
      ok: false,
      error: "No Pro plan price found. Run the seed-products script.",
    });
  }

  const [dbUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, user.id))
    .limit(1);
  if (!dbUser) {
    return res.status(401).json({ ok: false, error: "User not found." });
  }

  let customerId = dbUser.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: dbUser.email,
      name: dbUser.name,
      metadata: { userId: String(dbUser.id) },
    });
    customerId = customer.id;
    await db
      .update(usersTable)
      .set({ stripeCustomerId: customerId })
      .where(eq(usersTable.id, dbUser.id));
  }

  const proto =
    (req.headers["x-forwarded-proto"] as string | undefined) ?? req.protocol;
  const host = req.headers["x-forwarded-host"] ?? req.headers.host;
  const baseUrl = `${proto}://${host}`;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    allow_promotion_codes: true,
    success_url: `${baseUrl}/dashboard?checkout=success`,
    cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
    client_reference_id: String(dbUser.id),
    subscription_data: {
      metadata: { userId: String(dbUser.id) },
    },
  });

  if (!session.url) {
    return res
      .status(500)
      .json({ ok: false, error: "Stripe did not return a checkout URL." });
  }

  return res.json({ url: session.url });
});

router.post("/billing/portal", async (req, res) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ ok: false, error: "Sign in first." });
  }
  if (!isStripeConfigured()) {
    return res
      .status(503)
      .json({ ok: false, error: "Billing is not configured." });
  }

  const [dbUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, user.id))
    .limit(1);

  if (!dbUser?.stripeCustomerId) {
    return res
      .status(400)
      .json({ ok: false, error: "No billing account found." });
  }

  const stripe = await getUncachableStripeClient();
  const proto =
    (req.headers["x-forwarded-proto"] as string | undefined) ?? req.protocol;
  const host = req.headers["x-forwarded-host"] ?? req.headers.host;
  const returnUrl = `${proto}://${host}/dashboard`;

  const portal = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: returnUrl,
  });

  return res.json({ url: portal.url });
});

export default router;
