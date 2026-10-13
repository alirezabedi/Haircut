import { CreditsProvider, type HistoryEntry } from "@/components/credits/credits-provider";
import { requireShopId } from "@/lib/auth/session";
import { getBalance, recentHistory } from "@/lib/credits";
import { db } from "@/lib/db";
import { mediaUrl } from "@/lib/media";

// Everything a logged-in shop sees. Loads the credit balance and history for the
// counter and sheet on every request; router.refresh() reloads them after changes.
export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const shopId = await requireShopId();
  const history: HistoryEntry[] = recentHistory(db, shopId).map((h) => ({
    sessionId: h.sessionId,
    name: h.name,
    thumbnail: h.imagePath ? mediaUrl(h.sessionId, h.imagePath) : null,
    createdAt: h.createdAt.getTime(),
    status: h.status,
  }));

  return (
    <CreditsProvider remaining={getBalance(db, shopId)} history={history}>
      {children}
    </CreditsProvider>
  );
}
