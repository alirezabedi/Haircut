"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label htmlFor="pin" className="type-label text-muted-foreground">
        PIN
      </label>
      <input
        id="pin"
        name="pin"
        type="password"
        inputMode="numeric"
        autoComplete="current-password"
        pattern="[0-9]*"
        required
        autoFocus
        aria-invalid={state ? true : undefined}
        aria-describedby={state ? "pin-error" : undefined}
        className="type-numeric h-13 rounded-md bg-card px-4 text-xl tracking-[0.3em] shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-ink"
      />
      {state && (
        <p id="pin-error" role="alert" className="type-body-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button size="cta" type="submit" disabled={pending}>
        {pending ? "Checking…" : "Log in"}
      </Button>
    </form>
  );
}
