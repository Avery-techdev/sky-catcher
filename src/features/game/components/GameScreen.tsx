import { GAME_CONFIG } from "@/features/game/constants/gameConfig";
import { FALLING_OBJECT_TYPE } from "@/features/game/types/game.types";
import type { FallingObject } from "@/features/game/types/game.types";

interface GameScreenProps {
  score: number;
  highscore: number;
  lives: number;
  livesTotal: number;
  catcherPosition: number;
  fallingObjects: readonly FallingObject[];
  onPause: () => void;
}

const SHAPE_CLASSES: Record<FallingObject["type"], string> = {
  [FALLING_OBJECT_TYPE.Standard]:
    "h-7 w-7 rounded-lg bg-ink shadow-[0_6px_14px_-6px_rgba(10,10,10,0.6)]",
  [FALLING_OBJECT_TYPE.Bonus]:
    "h-6 w-6 rotate-45 rounded-md bg-accent animate-bonus-pulse " +
    "shadow-[0_0_18px_-2px_var(--color-accent)]",
};

/** Play screen: score/lives HUD, pause control and the animated play field. */
export function GameScreen({
  score,
  highscore,
  lives,
  livesTotal,
  catcherPosition,
  fallingObjects,
  onPause,
}: GameScreenProps): React.JSX.Element {
  return (
    <section
      aria-label="Spiel"
      className="animate-fade-in flex h-full flex-col"
    >
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <dl className="flex gap-7">
          <div className="flex flex-col">
            <dt className="text-[0.65rem] font-medium tracking-[0.2em] text-ink-muted uppercase">
              Punkte
            </dt>
            <dd className="text-2xl font-semibold tabular-nums">{score}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-[0.65rem] font-medium tracking-[0.2em] text-ink-muted uppercase">
              Best
            </dt>
            <dd className="text-2xl font-semibold tabular-nums text-ink-muted">
              {highscore}
            </dd>
          </div>
        </dl>

        <div className="flex items-center gap-4">
          <ul
            className="flex gap-1.5"
            aria-label={`${lives} von ${livesTotal} Leben`}
          >
            {Array.from({ length: livesTotal }, (_, index) => (
              <li
                key={`life-${index}`}
                aria-hidden="true"
                className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
                  index < lives ? "bg-ink" : "bg-line"
                }`}
              />
            ))}
          </ul>

          <button
            type="button"
            onClick={onPause}
            aria-label="Pause"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition-all hover:-translate-y-0.5 hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Decorative animated field — status is conveyed via HUD text below. */}
      <div className="relative flex-1 overflow-hidden" aria-hidden="true">
        <div
          className="pointer-events-none absolute inset-x-0 bg-gradient-to-b from-transparent to-line/40"
          style={{ top: `${GAME_CONFIG.field.catchLineY}%` }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 border-t border-dashed border-line"
          style={{ top: `${GAME_CONFIG.field.catchLineY}%` }}
        />

        {fallingObjects.map((object) => (
          <div
            key={object.id}
            className="animate-pop-in absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${object.x}%`, top: `${object.y}%` }}
          >
            <div className={SHAPE_CLASSES[object.type]} />
          </div>
        ))}

        <div
          className="absolute h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink shadow-[0_10px_22px_-8px_rgba(10,10,10,0.55)]"
          style={{
            left: `${catcherPosition}%`,
            top: `${GAME_CONFIG.field.catchLineY}%`,
            width: `${GAME_CONFIG.catcher.catchHalfWidth * 2}%`,
          }}
        />
      </div>

      <p className="sr-only" aria-live="polite">
        Noch {lives} von {livesTotal} Leben
      </p>
    </section>
  );
}
