import type { ImageUsage } from "@/lib/ai/image";
import type { TextUsage } from "@/lib/ai/spec";

// Estimated cost in US dollars from logged usage. Prices from developers.openai.com model
// pages (checked 2026-10-13). Update here if OpenAI changes them; unknown models cost null.
const PER_M = 1_000_000;

const TEXT: Record<string, { input: number; cached: number; output: number }> = {
  "gpt-6-luna": { input: 0.1, cached: 0.01, output: 0.5 },
};

const IMAGE: Record<string, { textInput: number; imageInput: number; output: number }> = {
  "gpt-image-2.5-sunburst": { textInput: 5, imageInput: 8, output: 30 },
  "gpt-image-2.5-flare": { textInput: 5, imageInput: 8, output: 30 },
};

const TRANSCRIBE_PER_MINUTE: Record<string, number> = {
  "gpt-transcribe": 0.0045,
};

const round = (n: number) => Math.round(n * 1e6) / 1e6;

export function textCost(model: string, u: TextUsage): number | null {
  const p = TEXT[model];
  if (!p) return null;
  const uncached = Math.max(0, u.input_tokens - u.cached_tokens);
  return round((uncached * p.input + u.cached_tokens * p.cached + u.output_tokens * p.output) / PER_M);
}

export function imageCost(model: string, u: ImageUsage): number | null {
  const p = IMAGE[model.replace(/-\d{4}-\d{2}-\d{2}$/, "")];
  if (!p) return null;
  return round(
    (u.text_input_tokens * p.textInput + u.image_input_tokens * p.imageInput + u.output_tokens * p.output) / PER_M,
  );
}

export function transcribeCost(model: string, seconds: number): number | null {
  const perMin = TRANSCRIBE_PER_MINUTE[model];
  return perMin === undefined ? null : round((seconds / 60) * perMin);
}

export function sumCosts(costs: (number | null)[]): number | null {
  return costs.some((c) => c === null) ? null : round(costs.reduce<number>((a, c) => a + (c ?? 0), 0));
}
