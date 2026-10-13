import "server-only";
import OpenAI from "openai";

// One OpenAI client for the server. API keys never reach the browser.
let client: OpenAI | null = null;

export function openai(): OpenAI {
  client ??= new OpenAI({ maxRetries: 2, timeout: 180_000 });
  return client;
}

export function model(kind: "transcribe" | "text" | "image"): string {
  const name = {
    transcribe: "OPENAI_TRANSCRIBE_MODEL",
    text: "OPENAI_TEXT_MODEL",
    image: "OPENAI_IMAGE_MODEL",
  }[kind];
  const id = process.env[name];
  if (!id) throw new Error(`${name} is not set`);
  return id;
}
