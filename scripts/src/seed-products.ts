import { getUncachableStripeClient } from "./stripeClient";

/**
 * Idempotent script to ensure a Pro Plan product + monthly price exist in Stripe.
 * Run with: pnpm --filter @workspace/scripts exec tsx src/seed-products.ts
 */
async function main(): Promise<void> {
  const stripe = await getUncachableStripeClient();

  console.log("Seeding Logoviking Pro plan in Stripe…");

  const existing = await stripe.products.search({
    query: "name:'Pro Plan' AND active:'true'",
  });

  let product = existing.data[0];
  if (product) {
    console.log(`Pro Plan already exists (${product.id}); checking prices…`);
  } else {
    product = await stripe.products.create({
      name: "Pro Plan",
      description:
        "Logoviking Pro: higher rate limits, ad-free, priority support, permanent history.",
      metadata: { tier: "pro" },
    });
    console.log(`Created product ${product.id}`);
  }

  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
  const hasMonthly = prices.data.some(
    (p) =>
      p.recurring?.interval === "month" &&
      p.unit_amount === 900 &&
      p.currency === "usd",
  );
  if (hasMonthly) {
    console.log("Monthly $9 USD price already exists.");
  } else {
    const monthly = await stripe.prices.create({
      product: product.id,
      unit_amount: 900,
      currency: "usd",
      recurring: { interval: "month" },
    });
    console.log(`Created monthly price ${monthly.id}`);
  }

  console.log("Done. Webhooks will sync this to your local Stripe schema.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
