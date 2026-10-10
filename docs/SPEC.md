# Haircut v1 — product and technical spec

## 1. Goal

Ship a working PWA that one barbershop in London uses daily with real customers. Success = the barber uses it for most customers for 2 weeks and keeps paying.

Out of scope for v1: multiple shops UI, barber dashboard, QR check-in, video input, native apps, analytics, admin panel, i18n.

## 2. Users and flow

One shared device (the barber's phone or a tablet) logged in as the shop. The customer uses it in the chair or while waiting.

1. **Start** (`/`) — intro, 3 steps, consent checkbox (required), Start button. Starting creates a `session`.
2. **Photos** (`/s/[id]/photos`) — 4 slots: front, left, right, back. Tapping a slot opens the camera via `<input type="file" accept="image/*" capture="user">`. Before upload, resize client-side to max 1536px on the long side, JPEG quality 0.85, strip EXIF. All 4 required to continue. Retake by tapping a filled slot.
3. **Voice note** (`/s/[id]/voice`) — record with `MediaRecorder` (support both `audio/webm` and `audio/mp4` for iOS Safari). Max 90 s, auto-stop. After stopping, upload and show the transcript in "What we heard". Buttons: Record again, Create preview. Fallback: a textarea "Or type it" if mic permission is denied.
4. **Processing** (`/s/[id]/processing`) — poll status every 2 s. Checklist: transcribed → spec ready → image generating. Typical 20–60 s.
5. **Result** (`/s/[id]/result`) — before/after slider (front photo vs preview), spec card, buttons "Try again" (shows tries left) and "Approve this cut". Try again lets the customer record or type an adjustment ("a bit shorter on top"), then regenerates. Approve marks the session approved and returns to Start.
6. **Credits sheet** — opened from the credit counter pill shown top-right on every screen. Shows remaining credits (`n of 100`), meter (turns `destructive` at ≤ 10), "Buy 100 more · £10", and the last 20 sessions (thumbnail, cut name, time, status). Tapping a session opens its result read-only.

Design for each screen: `docs/design/screens/` (match layout, spacing and copy).

## 3. Auth

- Shop logs in once with a PIN (env `SHOP_PIN`, 6+ digits) at `/login`. Sets an httpOnly, Secure, SameSite=Lax signed cookie (`SESSION_SECRET`), 90-day expiry.
- All pages and API routes except `/login` require the cookie.
- Rate-limit PIN attempts (5 per 15 min per IP).

## 4. Credits

- A shop has a credit balance. Seed the first shop with 100 credits.
- **1 credit per customer session**, deducted when the first preview image is successfully generated. Up to 3 generations per session (1 + 2 tries) at no extra credit. Failed generations do not consume credits or tries.
- With 0 credits, Start is disabled and the credits sheet opens with the buy button.
- All balance changes go through a `credit_ledger` table (never update the balance without a ledger row). Balance = sum of ledger.

## 5. Payments (mocked in v1)

- "Buy 100 more · £10" calls `POST /api/credits/purchase`, which goes through the billing interface in `lib/billing/`.
- v1 has only the `mock` implementation: it writes a `credit_ledger` row (+100, reason `purchase`) and returns; the sheet shows "100 credits added". No real money moves.
- Shape the interface so a Stripe Checkout + webhook implementation can be added later (`createPurchase(shopId) → {redirectUrl} | {completed: true}`). Keep `stripe_event_id` (unique, nullable) on the ledger for that.
- Do not add the `stripe` package or any Stripe code yet.

## 6. AI pipeline (server)

Runs as a background job started by the API route (in-process queue is fine for v1; one job at a time per session). Status stored on the `generation` row: `queued → transcribing → spec → imaging → done | failed`.

1. **Transcribe** the voice note with the OpenAI transcription model (`OPENAI_TRANSCRIBE_MODEL`). English. Store the text.
2. **Extract spec** with `OPENAI_TEXT_MODEL` using structured outputs (JSON schema):
   ```json
   {"name": "Skin fade, textured top",
    "sides": "Skin fade, #0.5 → #2", "top": "About 5 cm, textured",
    "back": "Tapered", "neckline": "Natural", "beard": "Leave as is",
    "notes": "", "feasibility_warning": ""}
   ```
   Input: transcript (+ any adjustment text from tries), plus the 4 photos so the model can judge current hair length and density. `feasibility_warning` is set when the request isn't achievable with the customer's current hair (e.g. wants more length than they have); show it on the Result screen above the spec card.
3. **Generate preview** with `OPENAI_IMAGE_MODEL` (image edit endpoint): input = front photo (primary) + side photos as references. Prompt must say: keep the same person, face, skin, expression, clothing, background and lighting exactly; change only the hair (and beard only if the spec says so); the result must be achievable by cutting the customer's existing hair — never add length, density or move the hairline; photorealistic, no retouching. Output 1024×1536 JPEG. Keep the prompt in `lib/ai/prompts.ts`.
4. On failure: mark failed, show "Something went wrong. Try again" with a retry button; no credit or try consumed.

Keep total cost visible: log token/usage per generation to the `generation` row.

## 7. Data model (Drizzle, SQLite)

- `shop` (id, name, created_at)
- `credit_ledger` (id, shop_id, delta, reason: seed|purchase|session, stripe_event_id unique null, session_id null, created_at)
- `session` (id uuid, shop_id, status: capturing|processing|ready|approved|abandoned, consent_at, created_at, approved_at, credit_charged bool)
- `photo` (id, session_id, angle: front|left|right|back, path, created_at)
- `voice_note` (id, session_id, path, mime, duration_s, transcript, created_at)
- `generation` (id, session_id, attempt 1–3, adjustment_text, status, spec_json, image_path, error, usage_json, created_at, finished_at)

## 8. Privacy and retention

- Consent checkbox is required to start; store `consent_at`.
- A job runs hourly: delete media files (photos, audio, generated images) for sessions older than **7 days**; keep the session row, spec and status for history (history thumbnail then shows a placeholder).
- Media is served only through an authenticated route, never from a public folder.
- Add a short `/privacy` page (plain text, British English): what is collected, why, 7-day deletion, contact `[CONTACT EMAIL]`.

## 9. PWA

- `manifest.webmanifest`: name "Haircut", short_name "Haircut", display standalone, theme/background colours from tokens, icons 192/512 + maskable (simple monogram placeholder).
- Service worker: cache the app shell only. No offline flows.
- Must work on iOS Safari 17+ and Chrome Android. Test camera and mic on both.

## 10. Env vars (`.env.example`)

```
OPENAI_API_KEY=
OPENAI_TRANSCRIBE_MODEL=
OPENAI_TEXT_MODEL=
OPENAI_IMAGE_MODEL=
SHOP_PIN=
SESSION_SECRET=
APP_URL=http://localhost:3000
```

## 11. Milestones (commit + push after each)

- **M0 Scaffold** — Next.js + TS + Tailwind v4 + shadcn/ui, theme from `docs/design/theme.css`, fonts, ESLint, Vitest, Drizzle + SQLite + migrations, `.env.example`, `.gitignore` (data/, .env*). PWA manifest + icons.
- **M1 Screens** — all 6 screens as static UI matching `docs/design/screens/`, with shared components: Button variants, CaptureSlot, RecordButton, BeforeAfter, CreditCounter, HistoryItem. Navigable with fake data.
- **M2 Capture** — PIN login, sessions, photo capture + resize + upload, voice recording + upload, authenticated media route.
- **M3 AI pipeline** — OpenAI wrapper, job runner, processing status polling, result screen with real data, tries. Set a monthly spend cap in the OpenAI dashboard before testing.
- **M4 Credits** — ledger, deduction rules, zero-credit state, history in the sheet.
- **M5 Payments (mock)** — billing interface + mock implementation, "Buy 100 more" flow end to end. Stripe comes in a later version.
- **M6 Polish** — retention job, privacy page, error states, empty states, iOS/Android testing notes, a `DEPLOY.md` for a single Linux VPS (Node 22, systemd or Docker, Caddy for HTTPS, nightly SQLite backup).

Tests: unit tests for credit rules, mock purchase, prompt building and spec schema parsing (OpenAI client stubbed). No end-to-end suite in v1.
