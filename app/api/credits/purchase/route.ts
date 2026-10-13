import { jsonError } from "@/lib/api";
import { getShopId } from "@/lib/auth/session";
import { getBilling } from "@/lib/billing";
import { db } from "@/lib/db";

// "Buy 100 more · £10" (docs/SPEC.md §5). Goes through the billing interface; v1 is mocked.
export async function POST() {
  const shopId = await getShopId();
  if (shopId === null) return jsonError("Not logged in", 401);
  try {
    return Response.json(await getBilling(db).createPurchase(shopId));
  } catch (e) {
    console.error("purchase failed", e);
    return jsonError("That didn’t go through. Try again.", 500);
  }
}
