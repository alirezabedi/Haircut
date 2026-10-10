import { DEMO_SESSION_ID, fakeHistory } from "@/lib/fake-data";

// M1: only the fake "demo" session and the fake history entries exist.
export function generateStaticParams() {
  return [{ id: DEMO_SESSION_ID }, ...fakeHistory.map((h) => ({ id: h.id }))];
}

export default function SessionLayout({ children }: LayoutProps<"/s/[id]">) {
  return children;
}
