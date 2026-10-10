import { describe, expect, it } from "vitest";
import { splitGuardNumbers } from "./guard-numbers";

describe("splitGuardNumbers", () => {
  it("marks a guard range", () => {
    expect(splitGuardNumbers("Skin fade, #0.5 → #2")).toEqual([
      { text: "Skin fade, ", guard: false },
      { text: "#0.5 → #2", guard: true },
    ]);
  });

  it("marks single guards in the middle of text", () => {
    expect(splitGuardNumbers("Number #1 all over, blended")).toEqual([
      { text: "Number ", guard: false },
      { text: "#1", guard: true },
      { text: " all over, blended", guard: false },
    ]);
  });

  it("leaves text without guards alone", () => {
    expect(splitGuardNumbers("About 5 cm, textured")).toEqual([
      { text: "About 5 cm, textured", guard: false },
    ]);
  });
});
