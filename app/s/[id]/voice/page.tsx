import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Fresh } from "@/components/fresh";
import { VoiceScreen } from "@/components/screens/voice-screen";
import { DEMO_SESSION_ID } from "@/lib/fake-data";

export default function VoicePage({ params }: PageProps<"/s/[id]/voice">) {
  return (
    <Suspense>
      <VoiceBody params={params} />
    </Suspense>
  );
}

async function VoiceBody({ params }: Pick<PageProps<"/s/[id]/voice">, "params">) {
  const { id } = await params;
  if (id !== DEMO_SESSION_ID) notFound();
  return (
    <Fresh>
      <VoiceScreen sessionId={id} />
    </Fresh>
  );
}
