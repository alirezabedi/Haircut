import { notFound } from "next/navigation";
import { ComponentGallery } from "./gallery";

// Dev-only gallery of the shared components. 404 in production builds.
export default function DevComponentsPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <ComponentGallery />;
}
