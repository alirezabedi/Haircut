import type OpenAI from "openai";
import { describe, expect, it, vi } from "vitest";
import { imageCost, sumCosts, textCost, transcribeCost } from "./pricing";
import { buildImagePrompt, buildSpecUserText, SPEC_INSTRUCTIONS } from "./prompts";
import { extractSpec, parseSpec, SPEC_SCHEMA } from "./spec";
import type { HaircutSpec } from "@/lib/types";

const SPEC: HaircutSpec = {
  name: "Skin fade, textured top",
  sides: "Skin fade, #0.5 → #2",
  top: "About 5 cm, textured",
  back: "Tapered",
  neckline: "Natural",
  beard: "Leave as is",
  notes: "",
  feasibility_warning: "",
};

describe("spec prompt", () => {
  it("includes the request, the previous spec and adjustments in order", () => {
    const text = buildSpecUserText({
      original: "Skin fade please",
      adjustments: ["Shorter on top", "Softer fade"],
      previous: SPEC,
    });
    expect(text).toContain('"""Skin fade please"""');
    expect(text).toContain('"name": "Skin fade, textured top"');
    expect(text.indexOf("Shorter on top")).toBeLessThan(text.indexOf("Softer fade"));
    expect(text).toContain("front, left side, right side, back");
  });

  it("asks for the feasibility warning", () => {
    expect(SPEC_INSTRUCTIONS).toContain("feasibility_warning");
    expect(SPEC_INSTRUCTIONS).toContain("British English");
  });
});

describe("image prompt", () => {
  it("states the identity and achievability rules from the spec", () => {
    const p = buildImagePrompt(SPEC);
    expect(p).toContain("same person, face, skin, expression");
    expect(p).toContain("clothing, background");
    expect(p).toContain("lighting");
    expect(p).toContain("never add length");
    expect(p).toContain("never move or lower the hairline");
    expect(p).toContain("Photorealistic");
    expect(p).toContain("no retouching");
    expect(p).toContain("Skin fade, #0.5 → #2");
  });

  it("keeps the beard unless the spec changes it", () => {
    expect(buildImagePrompt(SPEC)).toContain("Do not change the beard");
    const trimmed = buildImagePrompt({ ...SPEC, beard: "Trim to #3, sharp cheek line" });
    expect(trimmed).toContain("Beard: Trim to #3, sharp cheek line");
    expect(trimmed).not.toContain("Do not change the beard");
  });
});

describe("parseSpec", () => {
  it("parses and trims a valid spec", () => {
    expect(parseSpec(JSON.stringify({ ...SPEC, name: "  Buzz cut  " })).name).toBe("Buzz cut");
  });

  it("rejects missing fields, wrong types and empty names", () => {
    const missing: Partial<HaircutSpec> = { ...SPEC };
    delete missing.notes;
    expect(() => parseSpec(JSON.stringify(missing))).toThrow(/notes/);
    expect(() => parseSpec(JSON.stringify({ ...SPEC, top: 5 }))).toThrow(/top/);
    expect(() => parseSpec(JSON.stringify({ ...SPEC, name: " " }))).toThrow(/name/);
    expect(() => parseSpec("not json")).toThrow();
  });

  it("uses a strict schema with every field required", () => {
    expect(SPEC_SCHEMA.required).toHaveLength(8);
    expect(SPEC_SCHEMA.additionalProperties).toBe(false);
  });
});

describe("extractSpec (stubbed OpenAI)", () => {
  it("sends structured-output request with the four photos and returns the spec", async () => {
    const create = vi.fn().mockResolvedValue({
      output_text: JSON.stringify(SPEC),
      usage: { input_tokens: 3000, input_tokens_details: { cached_tokens: 1000 }, output_tokens: 120 },
    });
    const client = { responses: { create } } as unknown as OpenAI;
    const jpeg = Buffer.from([0xff, 0xd8, 0xff]);

    const result = await extractSpec(
      client,
      "test-model",
      { original: "Skin fade", adjustments: [], previous: null },
      { front: jpeg, left: jpeg, right: jpeg, back: jpeg },
    );

    expect(result.spec).toEqual(SPEC);
    expect(result.usage).toEqual({ input_tokens: 3000, cached_tokens: 1000, output_tokens: 120 });
    const req = create.mock.calls[0][0];
    expect(req.model).toBe("test-model");
    expect(req.text.format).toMatchObject({ type: "json_schema", strict: true });
    const images = req.input[0].content.filter((c: { type: string }) => c.type === "input_image");
    expect(images).toHaveLength(4);
    expect(images[0].image_url).toMatch(/^data:image\/jpeg;base64,/);
  });
});

describe("pricing", () => {
  it("costs text usage with cached tokens", () => {
    expect(textCost("gpt-6-luna", { input_tokens: 2_000_000, cached_tokens: 1_000_000, output_tokens: 1_000_000 })).toBeCloseTo(0.1 + 0.01 + 0.5);
  });

  it("costs image usage, ignoring a dated snapshot suffix", () => {
    const u = { text_input_tokens: 1_000_000, image_input_tokens: 1_000_000, output_tokens: 1_000_000 };
    expect(imageCost("gpt-image-2.5-sunburst", u)).toBeCloseTo(5 + 8 + 30);
    expect(imageCost("gpt-image-2.5-sunburst-2026-09-08", u)).toBeCloseTo(43);
  });

  it("costs transcription per minute", () => {
    expect(transcribeCost("gpt-transcribe", 90)).toBeCloseTo(0.00675);
  });

  it("returns null for unknown models so totals aren't misleading", () => {
    expect(textCost("mystery", { input_tokens: 1, cached_tokens: 0, output_tokens: 1 })).toBeNull();
    expect(sumCosts([0.01, null])).toBeNull();
    expect(sumCosts([0.01, 0.02])).toBeCloseTo(0.03);
  });
});
