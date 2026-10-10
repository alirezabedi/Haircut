import type { MetadataRoute } from "next";

// Served at /manifest.webmanifest. Colours are the hex equivalents of the
// light-theme `background` and `primary` tokens in docs/design/theme.css.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Haircut",
    short_name: "Haircut",
    description: "See your cut before the clippers come out.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8f7f2",
    theme_color: "#f8f7f2",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
