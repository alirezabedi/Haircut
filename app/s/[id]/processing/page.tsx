import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Fresh } from "@/components/fresh";
import { ProcessingScreen } from "@/components/screens/processing-screen";
import { DEMO_SESSION_ID } from "@/lib/fake-data";

export default function ProcessingPage({ params }: PageProps<"/s/[id]/processing">) {
  return (
    <Suspense>
      <ProcessingBody params={params} />
    </Suspense>
  );
}

async function ProcessingBody({ params }: Pick<PageProps<"/s/[id]/processing">, "params">) {
  const { id } = await params;
  if (id !== DEMO_SESSION_ID) notFound();
  return (
    <Fresh>
      <ProcessingScreen sessionId={id} />
    </Fresh>
  );
}
