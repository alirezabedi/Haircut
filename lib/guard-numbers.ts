// Splits spec text so clipper guard numbers ("#0.5 → #2") can be set in the numeric style.
const GUARD = /#\d+(?:\.\d+)?(?:\s*(?:→|->|to)\s*#\d+(?:\.\d+)?)?/g;

export type TextPart = { text: string; guard: boolean };

export function splitGuardNumbers(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (const m of text.matchAll(GUARD)) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index), guard: false });
    parts.push({ text: m[0], guard: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), guard: false });
  return parts;
}
