import type { RefObject } from "react";
import { GAME_CONFIG } from "@/features/game/constants/gameConfig";
import { FALLING_OBJECT_TYPE } from "@/features/game/types/game.types";
import type { FallingObject } from "@/features/game/types/game.types";

interface GameScreenProps {
  score: number;
  highscore: number;
  lastGain: number;
  lastCatchId: number;
  lives: number;
  livesTotal: number;
  catcherPosition: number;
  catcherWidth: number;
  objectWidth: number;
  fallingObjects: readonly FallingObject[];
  fieldRef: RefObject<HTMLDivElement | null>;
  onPause: () => void;
}

// Falling embers against the evening sky. The bonus circle carries a soft gold
// glow that is purely decorative — collision uses the object body only, so the
// glow never widens the hitbox.
const SHAPE_CLASSES: Record<FallingObject["type"], string> = {
  [FALLING_OBJECT_TYPE.Standard]: "h-full w-full rounded-xl bg-object-standard",
  [FALLING_OBJECT_TYPE.Bonus]:
    "h-full w-full rounded-full bg-object-bonus shadow-[0_0_10px_rgba(255,249,230,0.6)]",
};

/** Play screen: score/lives HUD, pause control and the animated play field. */
export function GameScreen({
  score,
  highscore,
  lastGain,
  lastCatchId,
  lives,
  livesTotal,
  catcherPosition,
  catcherWidth,
  objectWidth,
  fallingObjects,
  fieldRef,
  onPause,
}: GameScreenProps): React.JSX.Element {
  // A larger, brighter flash for a bonus catch.
  const strongFlash = lastGain >= GAME_CONFIG.points.bonus;

  return (
    <section
      aria-label="Game"
      className="animate-fade-in relative flex h-full flex-col"
      style={{
        // Evening sky: warm horizon fading through cream into a faint blue up high.
        background:
          "linear-gradient(to top, #ffa552 0%, #ffc584 30%, #ffddba 56%, #fbe6d8 78%, #e3edf7 100%)",
      }}
    >
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <dl className="flex gap-7">
          <div className="flex flex-col">
            <dt className="text-[0.65rem] font-medium tracking-[0.2em] text-ui-text/70 uppercase">
              Score
            </dt>
            <dd className="relative w-fit text-2xl font-semibold tabular-nums text-ui-text">
              <span
                key={`score-${score}`}
                className="animate-score-fade inline-block"
              >
                {score}
              </span>
              {lastCatchId > 0 && (
                <span
                  key={`gain-${lastCatchId}`}
                  aria-hidden="true"
                  className="animate-score-gain pointer-events-none absolute top-0 left-full ml-1.5 text-base font-semibold text-accent"
                >
                  +{lastGain}
                </span>
              )}
            </dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-[0.65rem] font-medium tracking-[0.2em] text-ui-text/70 uppercase">
              Best
            </dt>
            <dd className="text-2xl font-semibold tabular-nums text-ui-text/70">
              {highscore}
            </dd>
          </div>
        </dl>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span
              aria-hidden="true"
              className="text-[0.65rem] font-medium tracking-[0.2em] text-ui-text/70 uppercase"
            >
              Lives
            </span>
            <ul
              className="mt-1 flex gap-1.5"
              aria-label={`${lives} of ${livesTotal} lives`}
            >
              {Array.from({ length: livesTotal }, (_, index) => (
                <li
                  key={`life-${index}`}
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                    index < lives
                      ? "scale-100 bg-accent"
                      : "scale-50 bg-ui-text/25"
                  }`}
                />
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={onPause}
            aria-label="Pause"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ui-text/25 text-ui-text transition-all hover:-translate-y-0.5 hover:border-ui-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-sky-bottom"
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
      <div
        ref={fieldRef}
        className="relative flex-1 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-b from-transparent to-ui-text/15"
          style={{ top: `${GAME_CONFIG.field.catchLineY}%` }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 h-px bg-linear-to-r from-transparent via-ui-text/30 to-transparent"
          style={{ top: `${GAME_CONFIG.field.catchLineY}%` }}
        />

        {fallingObjects.map((object) => (
          <div
            key={object.id}
            className="animate-pop-in absolute aspect-square -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${object.x}%`,
              top: `${object.y}%`,
              width: `${objectWidth}%`,
            }}
          >
            <div className={SHAPE_CLASSES[object.type]} />
          </div>
        ))}

        <div
          className="bg-catcher absolute flex h-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
          style={{
            left: `${catcherPosition}%`,
            top: `${GAME_CONFIG.field.catchLineY}%`,
            width: `${catcherWidth}%`,
          }}
        >
          <span className="h-2.5 w-0.5 rounded-full bg-white/80" />
        </div>

        {lastCatchId > 0 && (
          <span
            key={`catch-${lastCatchId}`}
            aria-hidden="true"
            className="animate-catch-flash pointer-events-none absolute rounded-full"
            style={{
              left: `${catcherPosition}%`,
              top: `${GAME_CONFIG.field.catchLineY}%`,
              width: strongFlash ? 56 : 32,
              height: strongFlash ? 56 : 32,
              background:
                "radial-gradient(circle, rgba(255, 215, 0, 0.9) 0%, rgba(255, 107, 53, 0.55) 55%, transparent 75%)",
            }}
          />
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {lives} of {livesTotal} lives left
      </p>
    </section>
  );
}
