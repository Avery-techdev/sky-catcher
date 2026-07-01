/**
 * Central, typed game configuration. Single source of truth for all tunable
 * gameplay parameters
 *
 * Coordinate space is normalized: positions are percentages of the play area
 * (x: 0–100 across width, y: 0–100 down the height). This keeps the game logic
 * deterministic and free of DOM measurements.
 *
 * Names are role-based (catcher, standard, bonus) and design-agnostic.
 * The visual theme is decided later without touching this file.
 */
export const GAME_CONFIG = {
  /** Number of lives a fresh run starts with. */
  livesStart: 3,

  catcher: {
    /** Initial catcher center, in percent of play area width. */
    startPosition: 50,
    /** Left/right bounds for the catcher center, in percent. */
    minPosition: 10,
    maxPosition: 90,
    /** Continuous move speed in percent of width per reference frame (60 fps). */
    moveSpeed: 1.4,
    /**
     * Catcher half-width in percent of field width. Wider on mobile for a
     * comfortable touch target (the faster mobile pace keeps it challenging).
     */
    catchHalfWidthDesktop: 7,
    catchHalfWidthMobile: 10,
  },

  spawn: {
    /** Horizontal spawn range, in percent of width. */
    xMin: 5,
    xMax: 95,
    /** Probability that a spawned object is a bonus object. */
    bonusChance: 0.3,
    /** Delay before the very first object appears (countdown already warms up). */
    firstDelayMs: 500,
    /** Minimum horizontal gap between concurrent objects, in percent. */
    minDistanceDesktop: 12,
    minDistanceMobile: 20,
    /** Attempts to find a spaced-out x before falling back to a random one. */
    maxPlacementAttempts: 10,
  },

  points: {
    standard: 1,
    bonus: 3,
  },

  difficulty: {
    /** Points required to advance one difficulty level. */
    step: 5,
  },

  /** Fall speed in percent of play area height per reference frame (60 fps). */
  speed: {
    baseDesktop: 0.5,
    baseMobile: 0.8,
    increasePerLevel: 0.15,
    maxDesktop: 2.5,
    maxMobile: 3.0,
  },

  /** Milliseconds between spawns; shrinks with difficulty. */
  spawnInterval: {
    baseDesktop: 1800,
    baseMobile: 1400,
    decreasePerLevel: 100,
    min: 400,
  },

  field: {
    /** Vertical position of the catcher / catch line, in percent of height. */
    catchLineY: 82,
    /** Objects falling past this line (in percent) are counted as missed. */
    missLineY: 100,
    /** Vertical start position for spawned objects, in percent (above field). */
    spawnY: -10,
  },

  object: {
    /**
     * Visual + collision width of a falling object, in percent of field width.
     * Scaled up on mobile to match the larger catcher.
     */
    widthPercentDesktop: 6,
    widthPercentMobile: 8,
  },

  controls: {
    /** Repeat interval (ms) for moving the catcher while an arrow is held. */
    keyboardMoveIntervalMs: 50,
  },

  /** Viewport width (px) below which the mobile tuning profile applies. */
  mobileBreakpoint: 768,

  /** Reference frame duration for frame-rate independent motion. */
  frameMs: 1000 / 60,

  /** Upper bound for a single frame's delta (ms), avoids jumps after blur. */
  maxFrameDeltaMs: 100,
} as const;

export type GameConfig = typeof GAME_CONFIG;
