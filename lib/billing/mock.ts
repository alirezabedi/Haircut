import { type BillingProvider, PACK_CREDITS } from "@/lib/billing";
import { creditLedger } from "@/lib/db/schema";
import type { Db } from "@/lib/db/seed";

/** Mock billing: "Buy 100 more" adds 100 credits straight away. No money moves. */
export function mockBilling(db: Db): BillingProvider {
  return {
    async createPurchase(shopId) {
      db.insert(creditLedger).values({ shopId, delta: PACK_CREDITS, reason: "purchase" }).run();
      return { completed: true };
    },
  };
}
