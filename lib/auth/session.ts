import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, verifyToken } from "./token";

export async function getShopId(): Promise<number | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return verifyToken(token, process.env.SESSION_SECRET ?? "");
}

/** For pages and server actions: the logged-in shop, or a redirect to /login. */
export async function requireShopId(): Promise<number> {
  const shopId = await getShopId();
  if (shopId === null) redirect("/login");
  return shopId;
}
