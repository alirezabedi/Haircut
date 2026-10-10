import { describe, expect, it } from "vitest";
import { triesLeft, triesLeftLabel } from "./tries";

describe("tries", () => {
  it("counts down from 2 after the first preview", () => {
    expect(triesLeft(1)).toBe(2);
    expect(triesLeft(2)).toBe(1);
    expect(triesLeft(3)).toBe(0);
  });

  it("treats a result with no recorded generation as the first preview", () => {
    expect(triesLeft(0)).toBe(2);
  });

  it("never goes below zero", () => {
    expect(triesLeft(5)).toBe(0);
  });

  it("labels tries", () => {
    expect(triesLeftLabel(2)).toBe("2 tries left");
    expect(triesLeftLabel(1)).toBe("1 try left");
    expect(triesLeftLabel(0)).toBe("No tries left");
  });
});
