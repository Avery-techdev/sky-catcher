/**
 * App shell. Mounts the Sky-Catcher game feature.
 * The game itself is implemented in src/features/game (added in later steps).
 */
export function App(): React.JSX.Element {
  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Sky-Catcher</h1>
      <p className="max-w-md text-sm text-[var(--color-ink-muted)]">
        Project scaffold is ready. The game feature will be mounted here.
      </p>
    </main>
  );
}
