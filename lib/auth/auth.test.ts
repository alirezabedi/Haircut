import { describe, expect, it } from "vitest";
import { RateLimiter } from "./rate-limit";
import { createToken, pinMatches, verifyToken } from "./token";

const SECRET = "test-secret";

describe("shop token", () => {
  it("round-trips the shop id", () => {
    expect(verifyToken(createToken(1, SECRET), SECRET)).toBe(1);
  });

  it("rejects a token signed with another secret", () => {
    expect(verifyToken(createToken(1, "other"), SECRET)).toBeNull();
  });

  it("rejects a tampered payload", () => {
    const [, sig] = createToken(1, SECRET).split(".");
    const forged = Buffer.from(JSON.stringify({ shopId: 2, exp: Date.now() + 1e9 })).toString("base64url");
    expect(verifyToken(`${forged}.${sig}`, SECRET)).toBeNull();
  });

  it("rejects an expired token", () => {
    const issued = Date.UTC(2026, 0, 1);
    const token = createToken(1, SECRET, issued);
    expect(verifyToken(token, SECRET, issued + 89 * 864e5)).toBe(1);
    expect(verifyToken(token, SECRET, issued + 91 * 864e5)).toBeNull();
  });

  it("rejects junk and empty input", () => {
    expect(verifyToken(undefined, SECRET)).toBeNull();
    expect(verifyToken("nope", SECRET)).toBeNull();
    expect(verifyToken(createToken(1, SECRET), "")).toBeNull();
  });
});

describe("pinMatches", () => {
  it("compares PINs", () => {
    expect(pinMatches("123456", "123456")).toBe(true);
    expect(pinMatches("123457", "123456")).toBe(false);
    expect(pinMatches("123456", undefined)).toBe(false);
  });
});

describe("RateLimiter", () => {
  it("allows 5 failed attempts per 15 minutes", () => {
    const rl = new RateLimiter();
    const t = 1_000_000;
    for (let i = 0; i < 5; i++) {
      expect(rl.allowed("ip", t)).toBe(true);
      rl.hit("ip", t);
    }
    expect(rl.allowed("ip", t)).toBe(false);
    expect(rl.allowed("other-ip", t)).toBe(true);
    expect(rl.allowed("ip", t + 15 * 60 * 1000)).toBe(true);
  });

  it("resets after a successful login", () => {
    const rl = new RateLimiter();
    for (let i = 0; i < 5; i++) rl.hit("ip");
    rl.reset("ip");
    expect(rl.allowed("ip")).toBe(true);
  });
});
