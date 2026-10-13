import { redirect } from "next/navigation";
import { ProcessingScreen } from "@/components/screens/processing-screen";
import { db } from "@/lib/db";
import { loadSessionPage } from "@/lib/session-page";
import { getGenerations } from "@/lib/sessions";

export default async function ProcessingPage({ params }: PageProps<"/s/[id]/processing">) {
  const { id } = await params;
  // "capturing"/"ready" too, so a failed generation can be shown with its retry button.
  await loadSessionPage(id, ["processing", "capturing", "ready"]);
  const gens = getGenerations(db, id);
  const latest = gens[0];
  if (!latest) redirect(`/s/${id}/voice`);
  if (latest.status === "done") redirect(`/s/${id}/result`);

  return (
    <ProcessingScreen
      sessionId={id}
      initialStatus={latest.status}
      adjusting={gens.some((g) => g.status === "done")}
    />
  );
}
