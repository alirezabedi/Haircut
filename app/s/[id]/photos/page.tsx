import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Fresh } from "@/components/fresh";
import { PhotosScreen } from "@/components/screens/photos-screen";
import { DEMO_SESSION_ID } from "@/lib/fake-data";

export default function PhotosPage({ params }: PageProps<"/s/[id]/photos">) {
  return (
    <Suspense>
      <PhotosBody params={params} />
    </Suspense>
  );
}

async function PhotosBody({ params }: Pick<PageProps<"/s/[id]/photos">, "params">) {
  const { id } = await params;
  if (id !== DEMO_SESSION_ID) notFound();
  return (
    <Fresh>
      <PhotosScreen sessionId={id} />
    </Fresh>
  );
}
