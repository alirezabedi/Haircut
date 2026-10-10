# Haircut — project guide for Claude Code

Haircut is a mobile-first PWA for barbershops. A customer takes 4 photos (front, left, right, back) and records a voice note describing the cut they want. The backend transcribes the note, turns it into a structured haircut spec, and generates an AI preview of the customer with that cut. The customer and barber approve, then the cut starts. Shops buy credits: 100 previews for £10.

This is **v1**: one shop, built fast and cheap for our first paying barber in London. Prefer the simplest thing that works. No features beyond `docs/SPEC.md`.

Read `docs/SPEC.md` before starting any task. Design reference is in `docs/design/`.

## Stack (do not change without asking)

- Next.js (App Router) + TypeScript, single app for frontend and API routes
- Tailwind CSS v4 + shadcn/ui; theme = `docs/design/theme.css` (copy into `app/globals.css`)
- SQLite with Drizzle ORM (`better-sqlite3`), DB file at `./data/haircut.db`
- Uploaded media on disk at `./data/media/<sessionId>/`
- OpenAI API (official `openai` npm package) for transcription, spec extraction and image editing
- Payments: mocked in v1 (Stripe later)
- PWA: web app manifest + a minimal service worker (installable; no offline mode needed)
- Node 22 LTS, npm

## Hard rules

- **AI calls are real, in dev and prod.** Use the OpenAI API directly through a small wrapper in `lib/ai/` (no AI mock provider). Unit tests stub the OpenAI client; they never hit the network.
- **Payments are mocked for now.** All billing goes through `lib/billing/` with one interface and, for v1, only a `mock` implementation: "Buy 100 more" adds 100 credits immediately via the ledger. Do not install or call Stripe yet; keep the interface so a Stripe implementation can be added later without touching the UI.
- Never commit secrets, `.env*` (except `.env.example`), or anything under `data/`.
- All OpenAI calls happen server-side only. API keys never reach the client.
- Model IDs come from env vars (`OPENAI_TRANSCRIBE_MODEL`, `OPENAI_TEXT_MODEL`, `OPENAI_IMAGE_MODEL`). Check the current OpenAI docs for exact model IDs; do not hard-code them.
- UI copy in British English. Follow the tone rules in `docs/design/README.md`.
- Use the design tokens. Text on brass (`primary`) uses `on-primary`, never white. Brass text, links and focus rings use `primary-ink`.
- Touch targets ≥ 44px; inputs ≥ 16px font.

## Git workflow

- Remote: `https://github.com/alirezabedi/Haircut`, branch `main`.
- Before the first commit, run `git config user.email` and `git config user.name` and show me the values. Do not change them yourself.
- Work milestone by milestone (see SPEC). Commit after each meaningful, working step with a clear message (`feat: capture screen with 4 photo slots`). After each milestone: run lint, typecheck and tests, then `git push origin main`.
- Never force-push. Never rewrite history.

## Commands (create these scripts)

- `npm run dev` — dev server (real OpenAI, mock payments)
- `npm run lint`, `npm run typecheck`, `npm test` (Vitest)
- `npm run db:migrate` — apply Drizzle migrations

## How to work with me

- I'm the founder, not a full-time developer. At the end of each milestone, tell me in 3–5 lines what was built, how to try it on my phone, and what's next.
- If something in the spec is unclear or seems wrong, ask before building around it.
