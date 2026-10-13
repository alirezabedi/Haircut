import { redirect } from "next/navigation";
import { VoiceScreen } from "@/components/screens/voice-screen";
import { db } from "@/lib/db";
import { loadSessionPage } from "@/lib/session-page";
import { getGenerations, getPhotos } from "@/lib/sessions";
import { triesLeft } from "@/lib/tries";

export default async function VoicePage({ params }: PageProps<"/s/[id]/voice">) {
  const { id } = await params;
  // "capturing" for the first request; "ready" when the customer tries again from Result.
  await loadSessionPage(id, ["capturing", "ready"]);
  if (getPhotos(db, id).length < 4) redirect(`/s/${id}/photos`);

  const done = getGenerations(db, id).filter((g) => g.status === "done").length;
  if (done > 0 && triesLeft(done) === 0) redirect(`/s/${id}/result`);

  return <VoiceScreen sessionId={id} adjusting={done > 0} triesLeft={triesLeft(done)} />;
}
