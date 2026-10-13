import { Screen } from "@/components/screen";
import { StartActions } from "@/components/start-actions";
import { TopBar, Wordmark } from "@/components/top-bar";
import { requireShopId } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { shop } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const STEPS = [
  { title: "Photos", detail: "front, sides and back" },
  { title: "Voice note", detail: "in your own words" },
  { title: "Approve", detail: "then the clippers come out" },
];

export default async function StartPage() {
  const shopId = await requireShopId();
  const current = db.select().from(shop).where(eq(shop.id, shopId)).get();
  return (
    <Screen>
      <TopBar left={<Wordmark />} />

      <div className="flex grow flex-col justify-center gap-8 py-8">
        <div className="flex flex-col gap-4">
          <span className="type-label text-muted-foreground">
            {current?.name ?? "[Shop name]"} · London
          </span>
          <h1 className="type-display">See your cut before the first snip.</h1>
          <p className="type-body text-muted-foreground">
            Take four quick photos, tell us what you want, and approve the preview with your barber.
          </p>
        </div>

        <ol className="flex flex-col border-t border-border">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4 border-b border-border py-4">
              <span className="font-mono text-sm leading-6 text-primary-ink">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="type-body">
                <strong className="font-semibold">{step.title}</strong>{" "}
                <span className="text-muted-foreground">{step.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <StartActions />
    </Screen>
  );
}
