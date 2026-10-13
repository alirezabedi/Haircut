import { redirect } from "next/navigation";
import { ResultScreen } from "@/components/screens/result-screen";
import { db } from "@/lib/db";
import { mediaUrl } from "@/lib/media";
import { loadSessionPage } from "@/lib/session-page";
import { getGenerations, getPhotos } from "@/lib/sessions";
import { triesLeft } from "@/lib/tries";
import type { HaircutSpec } from "@/lib/types";

export default async function ResultPage({ params, searchParams }: PageProps<"/s/[id]/result">) {
  const { id } = await params;
  const { session } = await loadSessionPage(id, ["ready", "approved", "abandoned"]);
  const fromHistory = (await searchParams).from === "history";

  const gens = getGenerations(db, id);
  const done = gens.filter((g) => g.status === "done");
  const latest = done[0];
  if (!latest) redirect(`/s/${id}/voice`);

  const front = getPhotos(db, id).find((p) => p.angle === "front");
  // Read-only when opened from the credits sheet, or once the cut is approved.
  const readOnly = fromHistory || session.status !== "ready";

  return (
    <ResultScreen
      sessionId={id}
      beforeUrl={front ? mediaUrl(id, front.path) : null}
      afterUrl={latest.imagePath ? mediaUrl(id, latest.imagePath) : null}
      spec={latest.specJson as HaircutSpec}
      triesLeft={triesLeft(done.length)}
      readOnly={readOnly}
      meta={readOnly ? { createdAt: session.createdAt.getTime(), status: session.status } : null}
    />
  );
}
