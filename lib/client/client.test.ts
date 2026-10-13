import { describe, expect, it } from "vitest";
import { audioExtension } from "@/lib/ai/transcribe";
import { fitWithin } from "./resize-photo";
import { pickMimeType } from "./use-recorder";

describe("fitWithin", () => {
  it("scales the long side down to 1536", () => {
    expect(fitWithin(3024, 4032)).toEqual({ width: 1152, height: 1536 });
    expect(fitWithin(4032, 3024)).toEqual({ width: 1536, height: 1152 });
  });

  it("never upscales", () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });
});

describe("recording formats", () => {
  it("prefers webm/opus where supported (Chrome)", () => {
    expect(pickMimeType((t) => t.startsWith("audio/webm"))).toBe("audio/webm;codecs=opus");
  });

  it("falls back to mp4 (iOS Safari)", () => {
    expect(pickMimeType((t) => t.startsWith("audio/mp4"))).toBe("audio/mp4;codecs=mp4a.40.2");
  });

  it("maps recorder MIME types to file extensions for upload", () => {
    expect(audioExtension("audio/webm;codecs=opus")).toBe("webm");
    expect(audioExtension("audio/mp4")).toBe("mp4");
    expect(audioExtension("video/mp4")).toBeNull();
  });
});
