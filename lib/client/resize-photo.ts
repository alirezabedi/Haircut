// Browser-only: resize a camera photo to ≤1536px on the long side and re-encode as JPEG 0.85.
// Drawing to a canvas and re-encoding drops all EXIF (location, device) by construction.
// Loading through <img> applies the EXIF orientation first, so portrait photos stay upright.
export const MAX_SIDE = 1536;
export const JPEG_QUALITY = 0.85;

export function fitWithin(width: number, height: number, max = MAX_SIDE) {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export async function resizePhoto(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();

    const { width, height } = fitWithin(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not available");
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (!blob) throw new Error("Could not encode the photo");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}
