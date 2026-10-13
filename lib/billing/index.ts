import type { Db } from "@/lib/db/seed";
import { mockBilling } from "@/lib/billing/mock";

// Billing interface (docs/SPEC.md §5). v1 ships only the mock. A Stripe implementation
// will return { redirectUrl } to Checkout and add credits from its webhook, writing
// credit_ledger.stripe_event_id so each event counts once. The UI already handles both.

export const PACK_CREDITS = 100;
export const PACK_PRICE_GBP = 10;

export type PurchaseResult = { redirectUrl: string } | { completed: true };

export interface BillingProvider {
  createPurchase(shopId: number): Promise<PurchaseResult>;
}

export function getBilling(db: Db): BillingProvider {
  // Only "mock" exists in v1. Add "stripe" here later; nothing else needs to change.
  return mockBilling(db);
}
