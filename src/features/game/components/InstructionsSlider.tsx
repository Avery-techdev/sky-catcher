import { useState } from "react";
import type { ReactNode } from "react";
import { GAME_CONFIG } from "@/features/game/constants/gameConfig";
import { Button } from "@/features/game/components/Button";

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
      className="animate-fade-in flex h-full flex-col items-center justify-center gap-8 overflow-y-auto px-6 py-8 text-center sm:gap-10"
    >
      <div className="flex flex-col items-center gap-3">
        <span
          aria-hidden="true"
          className="text-4xl font-semibold tracking-tight sm:text-5xl"
        >
          Sky
          <span className="text-accent">·</span>
          Catcher
        </span>
        <span className="text-xs font-medium tracking-[0.3em] text-ink-muted uppercase">
          Catch what falls
        </span>
      </div>

      <div className="w-full max-w-md rounded-3xl border border-line bg-paper p-8 shadow-[0_30px_70px_-50px_rgba(10,10,10,0.5)]">
        <div key={index} className="animate-rise-in">
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

      <Button variant="primary" onClick={onStart}>
        Start game
      </Button>
    </section>
  );
}
