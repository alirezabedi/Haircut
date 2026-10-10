import { describe, expect, it } from "vitest";
import { formatDuration, formatWhen } from "./format";

describe("formatWhen", () => {
  const now = new Date("2026-10-10T16:00:00Z"); // 17:00 in London (BST)

  it("says Today for the same London day", () => {
    expect(formatWhen(new Date("2026-10-10T13:20:00Z"), now)).toBe("Today, 14:20");
  });

  it("says Yesterday for the previous London day", () => {
    expect(formatWhen(new Date("2026-10-09T16:40:00Z"), now)).toBe("Yesterday, 17:40");
  });

  it("uses day and month for older dates", () => {
    expect(formatWhen(new Date("2026-10-03T08:15:00Z"), now)).toBe("3 Oct, 09:15");
  });

  it("uses day and month when now is unknown", () => {
    expect(formatWhen(new Date("2026-10-10T13:20:00Z"), null)).toBe("10 Oct, 14:20");
  });

  it("uses London time near midnight UTC", () => {
    // 23:30 UTC on the 9th is 00:30 on the 10th in London.
    expect(formatWhen(new Date("2026-10-09T23:30:00Z"), now)).toBe("Today, 00:30");
  });
});

describe("formatDuration", () => {
  it("formats m:ss", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(24)).toBe("0:24");
    expect(formatDuration(90)).toBe("1:30");
  });
});
