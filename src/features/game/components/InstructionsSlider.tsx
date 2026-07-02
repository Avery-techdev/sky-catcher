import { useState } from "react";
import type { ReactNode } from "react";
import { GAME_CONFIG } from "@/features/game/constants/gameConfig";
import { Button } from "@/features/game/components/Button";
import { AmbientBackdrop } from "@/features/game/components/AmbientBackdrop";

const REPO_URL = "https://github.com/Avery-techdev/sky-catcher";

interface Slide {
  readonly title: string;
  readonly content: ReactNode;
}

const SLIDES: readonly Slide[] = [
  {
    title: "How to play",
    content: (
      <ul className="flex flex-col gap-3 text-left text-ink-muted">
        <li>
          Move the catcher with the arrow keys{" "}
          <kbd className="rounded bg-line px-1.5 py-0.5 text-xs text-ink">
            ←
          </kbd>{" "}
          <kbd className="rounded bg-line px-1.5 py-0.5 text-xs text-ink">
            →
          </kbd>{" "}
          or by swiping on a touchscreen.
        </li>
        <li>Catch the falling objects before they reach the ground.</li>
        <li>The higher your score, the faster it gets.</li>
      </ul>
    ),
  },
  {
    title: "The rules",
    content: (
      <ul className="flex flex-col gap-3 text-left text-ink-muted">
        <li>
          <span className="font-semibold text-ink">
            {GAME_CONFIG.points.standard} point
          </span>{" "}
          for a standard object.
        </li>
        <li>
          <span className="font-semibold text-accent">
            {GAME_CONFIG.points.bonus} points
          </span>{" "}
          for a bonus object.
        </li>
        <li>
          Every missed object costs a life — you start with{" "}
          {GAME_CONFIG.livesStart} lives.
        </li>
      </ul>
    ),
  },
];

interface InstructionsSliderProps {
  onStart: () => void;
}

/** Start screen: a small slider explaining gameplay and rules. */
export function InstructionsSlider({
  onStart,
}: InstructionsSliderProps): React.JSX.Element {
  const [index, setIndex] = useState<number>(0);
  const slide = SLIDES[index];
  const isFirst = index === 0;
  const isLast = index === SLIDES.length - 1;

  return (
    <section
      aria-label="Instructions"
      className="animate-fade-in relative flex h-full flex-col items-center justify-center gap-8 overflow-y-auto px-6 py-8 text-center sm:gap-10"
      style={{
        // A faint warm wash hinting at the sunset play world, kept subtle.
        background:
          "linear-gradient(to top, #fff1e6 0%, #fff9f4 45%, #ffffff 100%)",
      }}
    >
      <AmbientBackdrop />

      <div className="relative z-10 flex flex-col items-center gap-4">
        <span
          aria-hidden="true"
          className="flex items-center text-4xl tracking-tight sm:text-5xl"
        >
          <span className="font-normal">Sky</span>
          <span className="animate-title-dot mx-2 inline-block h-2.5 w-2.5 rounded-full bg-accent sm:h-3 sm:w-3" />
          <span className="font-bold">Catcher</span>
        </span>
        <span className="text-sm font-semibold tracking-[0.4em] text-ink-muted uppercase sm:text-base">
          Catch what falls
        </span>
      </div>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-line bg-paper p-8 shadow-[0_30px_70px_-50px_rgba(10,10,10,0.35)]">
        <div key={index} className="animate-rise-in min-h-68 sm:min-h-54">
          <h2 className="text-xl font-semibold tracking-tight">
            {slide.title}
          </h2>
          <div className="mt-5">{slide.content}</div>
        </div>

        <p className="sr-only" aria-live="polite">
          Step {index + 1} of {SLIDES.length}
        </p>

        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setIndex((value) => value - 1)}
            disabled={isFirst}
          >
            Back
          </Button>
          <ul className="flex gap-2" aria-hidden="true">
            {SLIDES.map((item, dot) => (
              <li
                key={item.title}
                className={`h-2 rounded-full transition-all duration-300 ${
                  dot === index ? "w-6 bg-ink" : "w-2 bg-line"
                }`}
              />
            ))}
          </ul>
          <Button
            variant="ghost"
            onClick={() => setIndex((value) => value + 1)}
            disabled={isLast}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="relative z-10">
        <Button variant="primary" onClick={onStart}>
          Start game
        </Button>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-1">
        <span className="text-sm text-ink-muted">by Avery Hauschild</span>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View source on GitHub (opens in a new tab)"
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm text-ink-muted transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none"
        >
          <svg
            viewBox="0 0 16 16"
            className="h-4 w-4"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 012-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          View source on GitHub
        </a>
      </div>
    </section>
  );
}
