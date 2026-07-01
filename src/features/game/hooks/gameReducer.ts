/**
 * Pure game logic: initial state, derived selectors, per-frame advancement and
 * the reducer. Everything here is deterministic, randomness and timing are
 * injected via actions (see useGameState), which keeps this module testable.
 */
import { GAME_CONFIG } from "@/features/game/constants/gameConfig";
import { GAME_STATUS } from "@/features/game/types/game.types";
import type {
  FallingObject,
  GameState,
} from "@/features/game/types/game.types";

/** Actions that drive the game state machine. */
export type GameAction =
  | { readonly type: "START" }
  | { readonly type: "BEGIN" }
  | { readonly type: "PAUSE" }
  | { readonly type: "RESUME" }
  | { readonly type: "RESTART" }
  | { readonly type: "RESET" }
  | { readonly type: "SET_CATCHER"; readonly position: number }
  | { readonly type: "SET_CATCHER_DIRECTION"; readonly direction: number }
  | { readonly type: "SET_VIEWPORT"; readonly isMobile: boolean }
  | {
      readonly type: "TICK";
      readonly dtMs: number;
      readonly spawn: FallingObject | null;
    };

/**
 * Build a fresh run for the given viewport profile (status: Start). The
 * highscore is carried in so it survives resets/restarts.
 */
export function createInitialState(
  isMobile: boolean,
  highscore = 0,
): GameState {
  return {
    status: GAME_STATUS.Start,
    score: 0,
    highscore,
    lastGain: 0,
    lastCatchId: 0,
    lives: GAME_CONFIG.livesStart,
    catcherPosition: GAME_CONFIG.catcher.startPosition,
    catcherDirection: 0,
    fallingObjects: [],
    isMobile,
  };
}

/** Difficulty level derived from the current score. */
export function selectDifficultyLevel(state: GameState): number {
  return Math.floor(state.score / GAME_CONFIG.difficulty.step);
}

/** Fall speed derived from score + viewport (never stored as state). */
export function selectGameSpeed(state: GameState): number {
  const { speed } = GAME_CONFIG;
  const level = selectDifficultyLevel(state);
  const base = state.isMobile ? speed.baseMobile : speed.baseDesktop;
  const max = state.isMobile ? speed.maxMobile : speed.maxDesktop;
  return Math.min(base + level * speed.increasePerLevel, max);
}

/** Spawn interval (ms) derived from score + viewport (never stored as state). */
export function selectSpawnInterval(state: GameState): number {
  const { spawnInterval } = GAME_CONFIG;
  const level = selectDifficultyLevel(state);
  const base = state.isMobile
    ? spawnInterval.baseMobile
    : spawnInterval.baseDesktop;
  return Math.max(
    base - level * spawnInterval.decreasePerLevel,
    spawnInterval.min,
  );
}

/** Catcher half-width (percent of field) for the current viewport profile. */
export function selectCatchHalfWidth(state: GameState): number {
  return state.isMobile
    ? GAME_CONFIG.catcher.catchHalfWidthMobile
    : GAME_CONFIG.catcher.catchHalfWidthDesktop;
}

/** Object width (percent of field) for the current viewport profile. */
export function selectObjectWidth(state: GameState): number {
  return state.isMobile
    ? GAME_CONFIG.object.widthPercentMobile
    : GAME_CONFIG.object.widthPercentDesktop;
}

/** Clamp a catcher center position to the configured bounds. */
export function clampCatcherPosition(position: number): number {
  const { minPosition, maxPosition } = GAME_CONFIG.catcher;
  return Math.max(minPosition, Math.min(maxPosition, position));
}

/**
 * Advance one frame: move objects, resolve catches/misses, append a spawn.
 * Frame-rate independent — movement scales by dt relative to the 60 fps frame.
 */
function advance(
  state: GameState,
  dtMs: number,
  spawn: FallingObject | null,
): GameState {
  const { catchLineY, missLineY } = GAME_CONFIG.field;
  const frames =
    Math.min(dtMs, GAME_CONFIG.maxFrameDeltaMs) / GAME_CONFIG.frameMs;
  const speed = selectGameSpeed(state);

  // Catch on real horizontal overlap: catcher half-width + object half-width.
  const catchReach = selectCatchHalfWidth(state) + selectObjectWidth(state) / 2;

  // Continuous catcher movement, integrated per frame for smooth motion.
  const catcherPosition = clampCatcherPosition(
    state.catcherPosition +
      state.catcherDirection * GAME_CONFIG.catcher.moveSpeed * frames,
  );

  let score = state.score;
  let lives = state.lives;
  let gained = 0;
  const remaining: FallingObject[] = [];

  for (const object of state.fallingObjects) {
    const y = object.y + speed * frames;

    // Caught: reached the catch line while its body overlaps the catcher.
    const isAligned = Math.abs(object.x - catcherPosition) <= catchReach;
    if (y >= catchLineY && isAligned) {
      score += object.points;
      gained += object.points;
      continue;
    }

    // Missed: fell past the bottom without being caught.
    if (y > missLineY) {
      lives -= 1;
      continue;
    }

    remaining.push({ ...object, y });
  }

  if (spawn) {
    remaining.push(spawn);
  }

  const clampedLives = Math.max(0, lives);
  const status = clampedLives <= 0 ? GAME_STATUS.GameOver : state.status;

  return {
    ...state,
    score,
    highscore: Math.max(state.highscore, score),
    lastGain: gained > 0 ? gained : state.lastGain,
    lastCatchId: gained > 0 ? state.lastCatchId + 1 : state.lastCatchId,
    lives: clampedLives,
    catcherPosition,
    fallingObjects: remaining,
    status,
  };
}

/** Reducer for the game state machine. */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START":
    case "RESTART":
      return {
        ...createInitialState(state.isMobile, state.highscore),
        status: GAME_STATUS.Countdown,
      };

    case "BEGIN":
      return state.status === GAME_STATUS.Countdown
        ? { ...state, status: GAME_STATUS.Playing }
        : state;

    case "RESET":
      return createInitialState(state.isMobile, state.highscore);

    case "PAUSE":
      return state.status === GAME_STATUS.Playing
        ? { ...state, status: GAME_STATUS.Paused }
        : state;

    case "RESUME":
      return state.status === GAME_STATUS.Paused
        ? { ...state, status: GAME_STATUS.Playing }
        : state;

    case "SET_CATCHER":
      return {
        ...state,
        catcherPosition: clampCatcherPosition(action.position),
        catcherDirection: 0,
      };

    case "SET_CATCHER_DIRECTION":
      return state.catcherDirection === action.direction
        ? state
        : { ...state, catcherDirection: action.direction };

    case "SET_VIEWPORT":
      return state.isMobile === action.isMobile
        ? state
        : { ...state, isMobile: action.isMobile };

    case "TICK":
      return state.status === GAME_STATUS.Playing
        ? advance(state, action.dtMs, action.spawn)
        : state;

    default:
      return state;
  }
}
