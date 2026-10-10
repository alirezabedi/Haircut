const time = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/London",
});
const day = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "Europe/London",
});
const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" });

/**
 * "Today, 14:20", "Yesterday, 17:40" or "3 Oct, 09:15" (London time).
 * Pass `now` as null (e.g. during server render) to always use the day-and-month form.
 */
export function formatWhen(date: Date, now: Date | null): string {
  const d = ymd.format(date);
  let prefix = day.format(date);
  if (now) {
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    if (d === ymd.format(now)) prefix = "Today";
    else if (d === ymd.format(yesterday)) prefix = "Yesterday";
  }
  return `${prefix}, ${time.format(date)}`;
}

/** Seconds as m:ss, e.g. 84 → "1:24". */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
