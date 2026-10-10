// M1 fake data. Everything the static screens show comes from here; delete this
// file (and public/demo/) once the real data lands in M2–M4.

export type Angle = "front" | "left" | "right" | "back";

export type SessionStatus = "capturing" | "processing" | "ready" | "approved" | "abandoned";

export type HistoryEntry = {
  id: string;
  name: string;
  thumbnail: string;
  createdAt: Date;
  status: SessionStatus;
};

export type HaircutSpec = {
  name: string;
  sides: string;
  top: string;
  back: string;
  neckline: string;
  beard: string;
  notes: string;
  feasibility_warning: string;
};

export const fakeShop = { name: "[Shop name]", city: "London" };

export const fakeCredits = { remaining: 73, total: 100 };

export const DEMO_SESSION_ID = "demo";

export const fakePhotos: Record<Angle, string> = {
  front: "/demo/front.svg",
  left: "/demo/left.svg",
  right: "/demo/right.svg",
  back: "/demo/back.svg",
};

export const fakePreview = "/demo/preview.svg";

// Fixed London clock times (today 14:20, etc.), independent of the device's time zone,
// so the server and the phone render the same text.
const londonHour = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  hour: "2-digit",
  hourCycle: "h23",
});
function daysAgoAt(days: number, hours: number, minutes: number) {
  const now = new Date();
  const utc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - days, hours, minutes),
  );
  const offset = (Number(londonHour.format(utc)) - utc.getUTCHours() + 24) % 24; // 0 (GMT) or 1 (BST)
  return new Date(utc.getTime() - offset * 60 * 60 * 1000);
}

export const fakeHistory: HistoryEntry[] = [
  {
    id: "h1",
    name: "Skin fade, textured top",
    thumbnail: "/demo/preview.svg",
    createdAt: daysAgoAt(0, 14, 20),
    status: "approved",
  },
  {
    id: "h2",
    name: "Scissor cut, side parting",
    thumbnail: "/demo/preview-2.svg",
    createdAt: daysAgoAt(0, 11, 5),
    status: "approved",
  },
  {
    id: "h3",
    name: "Buzz cut, beard shape-up",
    thumbnail: "/demo/preview-3.svg",
    createdAt: daysAgoAt(1, 17, 40),
    status: "abandoned",
  },
  {
    id: "h4",
    name: "Taper, longer on top",
    thumbnail: "/demo/preview-2.svg",
    createdAt: daysAgoAt(3, 9, 15),
    status: "approved",
  },
];

export const fakeTranscript =
  "Skin fade on the sides, about a number half going up to a two. Keep some length on top, maybe five centimetres, and texture it. Taper the back and leave the beard as it is.";

export const fakeSpec: HaircutSpec = {
  name: "Skin fade, textured top",
  sides: "Skin fade, #0.5 → #2",
  top: "About 5 cm, textured",
  back: "Tapered",
  neckline: "Natural",
  beard: "Leave as is",
  notes: "",
  feasibility_warning: "",
};

export const fakeFeasibilityWarning =
  "Your hair is about 3 cm on top now, so 5 cm isn't possible today. The preview keeps the length you have.";
