/**
 * React orchestration around the pure game reducer: owns the state machine,
 * runs the requestAnimationFrame game loop, tracks the viewport profile and
 * exposes state plus imperative controls.
 *
 * Input event binding (keyboard/touch) lives in a dedicated controls hook.
 */
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { GAME_CONFIG } from "@/features/game/constants/gameConfig";
import { gameStorageService } from "@/features/game/services/gameStorageService";
import {
  FALLING_OBJECT_TYPE,
  GAME_STATUS,
} from "@/features/game/types/game.types";
import type {
  FallingObject,
  GameState,
  UseGameStateResult,
} from "@/features/game/types/game.types";
import {
  createInitialState,
  gameReducer,
  selectGameSpeed,
  selectSpawnInterval,
} from "@/features/game/hooks/gameReducer";

/** Whether the current viewport should use the mobile tuning profile. */
function getIsMobile(): boolean {
  return window.innerWidth < GAME_CONFIG.mobileBreakpoint;
}

/** Pick a horizontal spawn position spaced out from existing objects. */
function generateSpawnX(state: GameState): number {
  const {
    xMin,
    xMax,
    minDistanceDesktop,
    minDistanceMobile,
    maxPlacementAttempts,
  } = GAME_CONFIG.spawn;
  const minDistance = state.isMobile ? minDistanceMobile : minDistanceDesktop;
  const range = xMax - xMin;

  for (let attempt = 0; attempt < maxPlacementAttempts; attempt += 1) {
    const candidate = xMin + Math.random() * range;
    const tooClose = state.fallingObjects.some(
      (object) => Math.abs(candidate - object.x) < minDistance,
    );
    if (!tooClose) {
      return candidate;
    }
  }

  return xMin + Math.random() * range;
}

/** Create a new falling object (impure: uses randomness + an id counter). */
function createSpawn(state: GameState, nextId: number): FallingObject {
  const isBonus = Math.random() < GAME_CONFIG.spawn.bonusChance;
  const type = isBonus
    ? FALLING_OBJECT_TYPE.Bonus
    : FALLING_OBJECT_TYPE.Standard;
  const points = isBonus
    ? GAME_CONFIG.points.bonus
    : GAME_CONFIG.points.standard;

  return {
    id: `object-${nextId}`,
    type,
    points,
    x: generateSpawnX(state),
    y: GAME_CONFIG.field.spawnY,
  };
}

export function useGameState(): UseGameStateResult {
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    createInitialState(getIsMobile(), gameStorageService.getHighscore()),
  );

  // Latest-state ref so the animation loop reads current values without
  // re-subscribing on every state change.
  const stateRef = useRef<GameState>(state);
  useEffect(() => {
    stateRef.current = state;
  });

  const spawnIdRef = useRef<number>(0);

  // Game loop: runs only while playing; cancels on pause/game over/unmount.
  useEffect(() => {
    if (state.status !== GAME_STATUS.Playing) {
      return;
    }

    let frameId = 0;
    let lastTime = performance.now();
    let spawnTimer = 0;

    const step = (now: number): void => {
      const dtMs = now - lastTime;
      lastTime = now;

      const current = stateRef.current;
      spawnTimer += dtMs;

      let spawn: FallingObject | null = null;
      if (spawnTimer >= selectSpawnInterval(current)) {
        spawnTimer = 0;
        spawnIdRef.current += 1;
        spawn = createSpawn(current, spawnIdRef.current);
      }

      dispatch({ type: "TICK", dtMs, spawn });
      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [state.status]);

  // Keep the tuning profile in sync with the viewport.
  useEffect(() => {
    const handleResize = (): void => {
      dispatch({ type: "SET_VIEWPORT", isMobile: getIsMobile() });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync the highscore to storage whenever it changes (external system sync).
  useEffect(() => {
    if (state.highscore > 0) {
      gameStorageService.saveHighscore(state.highscore);
    }
  }, [state.highscore]);

  const startGame = useCallback((): void => dispatch({ type: "START" }), []);
  const beginPlay = useCallback((): void => dispatch({ type: "BEGIN" }), []);
  const pauseGame = useCallback((): void => dispatch({ type: "PAUSE" }), []);
  const resumeGame = useCallback((): void => dispatch({ type: "RESUME" }), []);
  const restartGame = useCallback(
    (): void => dispatch({ type: "RESTART" }),
    [],
  );
  const resetGame = useCallback((): void => dispatch({ type: "RESET" }), []);

  const togglePause = useCallback((): void => {
    const status = stateRef.current.status;
    if (status === GAME_STATUS.Playing) {
      dispatch({ type: "PAUSE" });
    } else if (status === GAME_STATUS.Paused) {
      dispatch({ type: "RESUME" });
    }
  }, []);

  const setCatcherPosition = useCallback(
    (percent: number): void =>
      dispatch({ type: "SET_CATCHER", position: percent }),
    [],
  );

  const setCatcherDirection = useCallback(
    (direction: number): void =>
      dispatch({ type: "SET_CATCHER_DIRECTION", direction }),
    [],
  );

  // Derived values — computed from score + viewport, never stored as state.
  const gameSpeed = useMemo(() => selectGameSpeed(state), [state]);
  const spawnInterval = useMemo(() => selectSpawnInterval(state), [state]);

  return {
    status: state.status,
    score: state.score,
    highscore: state.highscore,
    lastGain: state.lastGain,
    lastCatchId: state.lastCatchId,
    lives: state.lives,
    catcherPosition: state.catcherPosition,
    fallingObjects: state.fallingObjects,
    gameSpeed,
    spawnInterval,
    startGame,
    beginPlay,
    pauseGame,
    resumeGame,
    togglePause,
    restartGame,
    resetGame,
    setCatcherPosition,
    setCatcherDirection,
  };
}
