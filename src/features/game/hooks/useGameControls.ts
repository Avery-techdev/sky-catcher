/**
 * Binds keyboard and touch input to the game controls. All listeners live in a
 * single effect and are removed on cleanup.
 *
 * - Arrow keys set a move direction; the catcher then glides smoothly in the
 *   game loop (velocity-based, frame-rate independent).
 * - Space/Enter starts the game or toggles pause; Escape toggles pause.
 * - Touch drag moves the catcher to the finger's horizontal position.
 *
 * Activation keys are ignored while an interactive element (button/dialog) is
 * focused, so they never double-fire with the on-screen controls.
 */
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { GAME_STATUS } from "@/features/game/types/game.types";
import type { GameStatus } from "@/features/game/types/game.types";

interface UseGameControlsParams {
  status: GameStatus;
  fieldRef: RefObject<HTMLDivElement | null>;
  setCatcherPosition: (percent: number) => void;
  setCatcherDirection: (direction: number) => void;
  startGame: () => void;
  togglePause: () => void;
}

const ARROW_LEFT = "ArrowLeft";
const ARROW_RIGHT = "ArrowRight";

/** Whether the event target is an on-screen control that owns the key itself. */
function isInteractiveTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    target.closest('button, a, input, select, textarea, [role="dialog"]') !==
      null
  );
}

export function useGameControls({
  status,
  fieldRef,
  setCatcherPosition,
  setCatcherDirection,
  startGame,
  togglePause,
}: UseGameControlsParams): void {
  const pressedKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const pressedKeys = pressedKeysRef.current;

    const syncDirection = (): void => {
      const left = pressedKeys.has(ARROW_LEFT) ? 1 : 0;
      const right = pressedKeys.has(ARROW_RIGHT) ? 1 : 0;
      setCatcherDirection(right - left);
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === ARROW_LEFT || event.key === ARROW_RIGHT) {
        if (status !== GAME_STATUS.Playing) {
          return;
        }
        event.preventDefault();
        if (event.repeat) {
          return;
        }
        pressedKeys.add(event.key);
        syncDirection();
        return;
      }

      if (isInteractiveTarget(event.target)) {
        return;
      }

      if (event.key === " " || event.key === "Enter") {
        if (status === GAME_STATUS.Start) {
          event.preventDefault();
          startGame();
        } else if (
          status === GAME_STATUS.Playing ||
          status === GAME_STATUS.Paused
        ) {
          event.preventDefault();
          togglePause();
        }
        return;
      }

      if (
        event.key === "Escape" &&
        (status === GAME_STATUS.Playing || status === GAME_STATUS.Paused)
      ) {
        event.preventDefault();
        togglePause();
      }
    };

    const handleKeyUp = (event: KeyboardEvent): void => {
      if (event.key === ARROW_LEFT || event.key === ARROW_RIGHT) {
        pressedKeys.delete(event.key);
        syncDirection();
      }
    };

    const handleTouchMove = (event: TouchEvent): void => {
      if (status !== GAME_STATUS.Playing) {
        return;
      }
      const field = fieldRef.current;
      const touch = event.touches[0];
      if (!field || !touch) {
        return;
      }
      event.preventDefault();
      const rect = field.getBoundingClientRect();
      const percent = ((touch.clientX - rect.left) / rect.width) * 100;
      setCatcherPosition(percent);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("touchmove", handleTouchMove);
      pressedKeys.clear();
      setCatcherDirection(0);
    };
  }, [
    status,
    fieldRef,
    setCatcherPosition,
    setCatcherDirection,
    startGame,
    togglePause,
  ]);
}
