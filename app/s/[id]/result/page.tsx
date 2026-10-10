import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Fresh } from "@/components/fresh";
import { ResultScreen } from "@/components/screens/result-screen";
import { DEMO_SESSION_ID, fakeHistory } from "@/lib/fake-data";

export default function ResultPage({ params }: PageProps<"/s/[id]/result">) {
  return (
    <Suspense>
      <ResultBody params={params} />
    </Suspense>
  );
}

async function ResultBody({ params }: Pick<PageProps<"/s/[id]/result">, "params">) {
  const { id } = await params;
  // A past session opened from the credits sheet is read-only.
  const past = id === DEMO_SESSION_ID ? undefined : fakeHistory.find((h) => h.id === id);
  if (id !== DEMO_SESSION_ID && !past) notFound();
  return (
    <Fresh>
      <ResultScreen sessionId={id} past={past} />
    </Fresh>
  );
}
