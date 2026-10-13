import { createHmac, timingSafeEqual } from "node:crypto";

// Signed shop cookie: base64url(JSON payload) + "." + HMAC-SHA256 signature.
export const COOKIE_NAME = "hc_shop";
export const COOKIE_MAX_AGE_S = 90 * 24 * 60 * 60; // 90 days (docs/SPEC.md §3)

type Payload = { shopId: number; exp: number };

const sign = (data: string, secret: string) =>
  createHmac("sha256", secret).update(data).digest("base64url");

export function createToken(shopId: number, secret: string, now = Date.now()): string {
  const payload: Payload = { shopId, exp: now + COOKIE_MAX_AGE_S * 1000 };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data, secret)}`;
}

/** Returns the shop id for a valid, unexpired token, otherwise null. */
export function verifyToken(token: string | undefined, secret: string, now = Date.now()): number | null {
  if (!token || !secret) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = Buffer.from(sign(data, secret));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as Payload;
    if (!Number.isInteger(payload.shopId) || typeof payload.exp !== "number") return null;
    return payload.exp > now ? payload.shopId : null;
  } catch {
    return null;
  }
}

/** Constant-time PIN comparison. */
export function pinMatches(given: string, expected: string | undefined): boolean {
  if (!expected) return false;
  const a = createHmac("sha256", "pin").update(given).digest();
  const b = createHmac("sha256", "pin").update(expected).digest();
  return timingSafeEqual(a, b);
}
