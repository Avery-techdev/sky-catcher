import { useEffect, useState } from "react";

interface CountdownProps {
  /** Called once the countdown reaches zero. */
  onComplete: () => void;
}

const START_FROM = 3;
const STEP_MS = 800;

/** "3 · 2 · 1" overlay shown before play begins. */
export function Countdown({ onComplete }: CountdownProps): React.JSX.Element {
  const [count, setCount] = useState<number>(START_FROM);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (count <= 1) {
        onComplete();
      } else {
        setCount((value) => value - 1);
      }
    }, STEP_MS);
    return () => window.clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Game starts in ${count}`}
      className="animate-fade-in absolute inset-0 z-40 flex items-center justify-center bg-paper/70 backdrop-blur-sm"
    >
      <span
        key={count}
        aria-hidden="true"
        className="animate-count-pop text-7xl font-semibold tracking-tight tabular-nums sm:text-8xl"
      >
        {count}
      </span>
    </div>
  );
}
