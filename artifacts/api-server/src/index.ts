import { runMigrations } from "stripe-replit-sync";
import app from "./app";
import { logger } from "./lib/logger";
import { getStripeSync, isStripeConfigured } from "./lib/stripeClient";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function initStripe(): Promise<void> {
  if (!isStripeConfigured()) {
    logger.warn(
      "Stripe integration is not connected; billing endpoints will be unavailable.",
    );
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for Stripe sync.");
  }

  try {
    logger.info("Running Stripe schema migrations…");
    await runMigrations({ databaseUrl });
    logger.info("Stripe schema ready.");

    const stripeSync = await getStripeSync();

    const replitDomain = process.env.REPLIT_DOMAINS?.split(",")[0];
    if (replitDomain) {
      const webhookUrl = `https://${replitDomain}/api/stripe/webhook`;
      logger.info({ webhookUrl }, "Configuring managed Stripe webhook…");
      const webhook = await stripeSync.findOrCreateManagedWebhook(webhookUrl);
      logger.info({ id: webhook.id, url: webhook.url }, "Stripe webhook configured.");
    } else {
      logger.warn("REPLIT_DOMAINS is not set; skipping managed webhook setup.");
    }

    logger.info("Backfilling Stripe data…");
    stripeSync
      .syncBackfill()
      .then(() => logger.info("Stripe data backfill complete."))
      .catch((err) => logger.error({ err }, "Stripe backfill failed."));
  } catch (err) {
    logger.error({ err }, "Failed to initialize Stripe; continuing without billing.");
  }
}

await initStripe();

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
