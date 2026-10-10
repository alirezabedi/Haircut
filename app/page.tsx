// M0 placeholder. The real Start screen arrives in M1 (docs/design/screens/1-start.html).
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-4 py-8">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Haircut
      </p>
      <h1 className="font-serif text-4xl leading-tight">
        See your cut before it starts.
      </h1>
      <p className="text-muted-foreground">
        The app is being set up. Check back soon.
      </p>
    </main>
  );
}
