// Confirms OPENAI_API_KEY works and the three configured models are available to it.
// Model lookups are free (no generation). Never prints the key.
// Run: npm run check:openai
import OpenAI from "openai";

const vars = ["OPENAI_API_KEY", "OPENAI_TRANSCRIBE_MODEL", "OPENAI_TEXT_MODEL", "OPENAI_IMAGE_MODEL"];
const missing = vars.filter((v) => !process.env[v]);
if (missing.length) {
  console.error(`Missing in .env.local: ${missing.join(", ")}`);
  process.exit(1);
}

async function main() {
  const client = new OpenAI();
  let ok = true;
  for (const v of vars.slice(1)) {
    const id = process.env[v]!;
    try {
      await client.models.retrieve(id);
      console.log(`ok   ${v}=${id}`);
    } catch (e) {
      ok = false;
      const status = e instanceof OpenAI.APIError ? e.status : undefined;
      const hint = status === 401 ? "key rejected" : status === 404 ? "model not available to this key" : String(e);
      console.log(`FAIL ${v}=${id} (${hint})`);
    }
  }
  process.exit(ok ? 0 : 1);
}

main();
