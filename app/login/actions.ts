"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { RateLimiter } from "@/lib/auth/rate-limit";
import { COOKIE_MAX_AGE_S, COOKIE_NAME, createToken, pinMatches } from "@/lib/auth/token";
import { db } from "@/lib/db";
import { shop } from "@/lib/db/schema";

const limiter = new RateLimiter();

export type LoginState = { error: string } | null;

async function clientIp() {
  const h = await headers();
  return (
    h.get("cf-connecting-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const ip = await clientIp();
  if (!limiter.allowed(ip)) {
    return { error: "Too many tries. Wait 15 minutes and try again." };
  }

  const pin = String(formData.get("pin") ?? "").trim();
  if (!pinMatches(pin, process.env.SHOP_PIN)) {
    limiter.hit(ip);
    return { error: "That PIN didn’t work. Try again." };
  }
  limiter.reset(ip);

  // v1 has one shop (seeded by `npm run db:migrate`).
  const first = db.select({ id: shop.id }).from(shop).orderBy(shop.id).limit(1).get();
  if (!first) return { error: "The shop isn’t set up yet. Run npm run db:migrate." };

  const h = await headers();
  const https = h.get("x-forwarded-proto") === "https" || process.env.NODE_ENV === "production";
  (await cookies()).set(COOKIE_NAME, createToken(first.id, process.env.SESSION_SECRET ?? ""), {
    httpOnly: true,
    secure: https,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_S,
  });
  redirect("/");
}
