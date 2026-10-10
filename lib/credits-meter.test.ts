import { describe, expect, it } from "vitest";
import { creditsLeftLabel, isLow, meterFill } from "./credits-meter";

describe("credit meter", () => {
  it("is full at 100 or more", () => {
    expect(meterFill(100)).toBe(100);
    expect(meterFill(173)).toBe(100);
  });

  it("scales below 100", () => {
    expect(meterFill(73)).toBe(73);
    expect(meterFill(6)).toBe(6);
    expect(meterFill(0)).toBe(0);
  });

  it("turns low at 10 or fewer", () => {
    expect(isLow(11)).toBe(false);
    expect(isLow(10)).toBe(true);
    expect(isLow(0)).toBe(true);
  });

  it("labels the remaining count", () => {
    expect(creditsLeftLabel(73)).toBe("73 credits left");
    expect(creditsLeftLabel(1)).toBe("1 credit left");
    expect(creditsLeftLabel(0)).toBe("0 credits left");
  });
});
