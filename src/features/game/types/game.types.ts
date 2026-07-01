/**
 * Domain types. Status and object kinds are modeled
 * as const maps + union types (no TS enums — the project builds with
 * `erasableSyntaxOnly`).
 *
 * Object kinds are role-based (standard / bonus) and design-agnostic.
 */

/** High-level phase the game is currently in. */
export const GAME_STATUS = {
  Start: "start",
  Playing: "playing",
  Paused: "paused",
  GameOver: "gameOver",
} as const;

export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];

/** Kind of object falling down the field, distinguished by point value. */
export const FALLING_OBJECT_TYPE = {
  Standard: "standard",
  Bonus: "bonus",
} as const;

export type FallingObjectType =
  (typeof FALLING_OBJECT_TYPE)[keyof typeof FALLING_OBJECT_TYPE];

/** A single falling object, positioned in the normalized percent space. */
export interface FallingObject {
  readonly id: string;
  readonly type: FallingObjectType;
  readonly points: number;
  /** Horizontal center in percent of play area width (0–100). */
  readonly x: number;
  /** Vertical position in percent of play area height; starts negative. */
  readonly y: number;
}

/** Authoritative game state — the single source of truth. */
export interface GameState {
  readonly status: GameStatus;
  readonly score: number;
  /** Best score across runs; persisted via the storage service. */
  readonly highscore: number;
  readonly lives: number;
  /** Catcher center in percent of play area width. */
  readonly catcherPosition: number;
  /** Current horizontal move direction: -1 (left), 0 (idle) or 1 (right). */
  readonly catcherDirection: number;
  readonly fallingObjects: readonly FallingObject[];
  /** Whether the current viewport uses the mobile tuning profile. */
  readonly isMobile: boolean;
}

/** Imperative controls exposed by the game hook. */
export interface GameControls {
  readonly startGame: () => void;
  readonly pauseGame: () => void;
  readonly resumeGame: () => void;
  readonly togglePause: () => void;
  readonly restartGame: () => void;
  readonly resetGame: () => void;
  /** Set the catcher center to an absolute percent (clamped to bounds). */
  readonly setCatcherPosition: (percent: number) => void;
  /** Set the continuous move direction: -1 (left), 0 (idle) or 1 (right). */
  readonly setCatcherDirection: (direction: number) => void;
}

/** Public shape returned by `useGameState`. */
export interface UseGameStateResult extends GameControls {
  readonly status: GameStatus;
  readonly score: number;
  /** Best score persisted across runs (via the storage service). */
  readonly highscore: number;
  readonly lives: number;
  readonly catcherPosition: number;
  readonly fallingObjects: readonly FallingObject[];
  /** Derived from score — fall speed in percent of height per reference frame. */
  readonly gameSpeed: number;
  /** Derived from score — milliseconds between spawns. */
  readonly spawnInterval: number;
}
