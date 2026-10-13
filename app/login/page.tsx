import { Screen } from "@/components/screen";
import { Wordmark } from "@/components/top-bar";
import { LoginForm } from "./login-form";

export const metadata = { title: "Log in · Haircut" };

export default function LoginPage() {
  return (
    <Screen>
      <header className="flex h-11 items-center">
        <Wordmark />
      </header>
      <div className="flex grow flex-col justify-center gap-8 py-8">
        <div className="flex flex-col gap-3">
          <h1 className="type-display">Shop login</h1>
          <p className="type-body text-muted-foreground">
            Enter the shop PIN once. This phone stays logged in for 90 days.
          </p>
        </div>
        <LoginForm />
      </div>
    </Screen>
  );
}
