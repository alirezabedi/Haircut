import { PhotosScreen } from "@/components/screens/photos-screen";
import { db } from "@/lib/db";
import { mediaUrl } from "@/lib/media";
import { loadSessionPage } from "@/lib/session-page";
import { getPhotos } from "@/lib/sessions";
import type { Angle } from "@/lib/types";

export default async function PhotosPage({ params }: PageProps<"/s/[id]/photos">) {
  const { id } = await params;
  await loadSessionPage(id, ["capturing"]);
  const photos: Partial<Record<Angle, string>> = {};
  for (const p of getPhotos(db, id)) photos[p.angle] = mediaUrl(id, p.path);
  return <PhotosScreen sessionId={id} initialPhotos={photos} />;
}
