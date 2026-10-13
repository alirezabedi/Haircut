import OpenAI, { toFile } from "openai";

export type ImageUsage = {
  text_input_tokens: number;
  image_input_tokens: number;
  output_tokens: number;
};

export type ImageQuality = "low" | "medium" | "high";

export function imageQuality(): ImageQuality {
  const q = process.env.OPENAI_IMAGE_QUALITY;
  return q === "low" || q === "high" ? q : "medium";
}

/**
 * Generates the preview with the image edit endpoint: front photo first (the one edited),
 * side photos as references. Output 1024×1536 JPEG (docs/SPEC.md §6).
 */
export async function generatePreview(
  client: OpenAI,
  modelId: string,
  input: { front: Buffer; left: Buffer; right: Buffer; prompt: string; quality: ImageQuality },
): Promise<{ image: Buffer; usage: ImageUsage }> {
  const files = await Promise.all(
    (["front", "left", "right"] as const).map((angle) =>
      toFile(input[angle], `${angle}.jpg`, { type: "image/jpeg" }),
    ),
  );
  const result = await client.images.edit({
    model: modelId,
    image: files,
    prompt: input.prompt,
    size: "1024x1536",
    output_format: "jpeg",
    output_compression: 90,
    quality: input.quality,
    n: 1,
  });

  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error("The image model returned no image");
  return {
    image: Buffer.from(b64, "base64"),
    usage: {
      text_input_tokens: result.usage?.input_tokens_details?.text_tokens ?? 0,
      image_input_tokens: result.usage?.input_tokens_details?.image_tokens ?? 0,
      output_tokens: result.usage?.output_tokens ?? 0,
    },
  };
}
