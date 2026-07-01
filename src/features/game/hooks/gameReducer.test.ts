import { describe, expect, it } from "vitest";
import {
  createInitialState,
  gameReducer,
  selectDifficultyLevel,
  selectGameSpeed,
  selectSpawnInterval,
} from "@/features/game/hooks/gameReducer";
import { GAME_CONFIG } from "@/features/game/constants/gameConfig";
import {
  FALLING_OBJECT_TYPE,
  GAME_STATUS,
} from "@/features/game/types/game.types";
import type {
  FallingObject,
  GameState,
} from "@/features/game/types/game.types";

const FRAME = GAME_CONFIG.frameMs;

function playing(overrides: Partial<GameState> = {}): GameState {
  return {
    ...createInitialState(false, 0),
    status: GAME_STATUS.Playing,
    ...overrides,
  };
}

function makeObject(overrides: Partial<FallingObject> = {}): FallingObject {
  return {
    id: "obj-1",
    type: FALLING_OBJECT_TYPE.Standard,
    points: GAME_CONFIG.points.standard,
    x: 50,
    y: GAME_CONFIG.field.catchLineY,
    ...overrides,
  };
}

function tick(state: GameState): GameState {
  return gameReducer(state, { type: "TICK", dtMs: FRAME, spawn: null });
}

describe("createInitialState", () => {
  it("starts a fresh run and carries the highscore", () => {
    const state = createInitialState(false, 42);
    expect(state.status).toBe(GAME_STATUS.Start);
    expect(state.score).toBe(0);
    expect(state.lives).toBe(GAME_CONFIG.livesStart);
    expect(state.catcherPosition).toBe(GAME_CONFIG.catcher.startPosition);
    expect(state.catcherDirection).toBe(0);
    expect(state.fallingObjects).toEqual([]);
    expect(state.highscore).toBe(42);
  });
});

describe("state machine", () => {
  it("START enters playing and preserves the highscore", () => {
    const state = createInitialState(false, 7);
    const next = gameReducer(state, { type: "START" });
    expect(next.status).toBe(GAME_STATUS.Playing);
    expect(next.score).toBe(0);
    expect(next.highscore).toBe(7);
  });

  it("RESET returns to start and preserves the highscore", () => {
    const next = gameReducer(playing({ score: 9, highscore: 9 }), {
      type: "RESET",
    });
    expect(next.status).toBe(GAME_STATUS.Start);
    expect(next.highscore).toBe(9);
  });

  it("PAUSE/RESUME only apply from the matching status", () => {
    const paused = gameReducer(playing(), { type: "PAUSE" });
    expect(paused.status).toBe(GAME_STATUS.Paused);
    expect(gameReducer(paused, { type: "RESUME" }).status).toBe(
      GAME_STATUS.Playing,
    );

    const start = createInitialState(false);
    expect(gameReducer(start, { type: "PAUSE" })).toBe(start);
  });

  it("SET_CATCHER clamps and stops any movement", () => {
    const next = gameReducer(playing({ catcherDirection: 1 }), {
      type: "SET_CATCHER",
      position: 999,
    });
    expect(next.catcherPosition).toBe(GAME_CONFIG.catcher.maxPosition);
    expect(next.catcherDirection).toBe(0);
  });

  it("ignores TICK while not playing", () => {
    const start = createInitialState(false);
    expect(tick(start)).toBe(start);
  });
});

describe("catcher movement", () => {
  it("glides by moveSpeed per reference frame in the pressed direction", () => {
    const right = tick(playing({ catcherDirection: 1 }));
    expect(right.catcherPosition).toBeCloseTo(
      50 + GAME_CONFIG.catcher.moveSpeed,
    );

    const left = tick(playing({ catcherDirection: -1 }));
    expect(left.catcherPosition).toBeCloseTo(
      50 - GAME_CONFIG.catcher.moveSpeed,
    );
  });

  it("clamps at the field bounds", () => {
    const next = tick(playing({ catcherPosition: 89.5, catcherDirection: 1 }));
    expect(next.catcherPosition).toBe(GAME_CONFIG.catcher.maxPosition);
  });
});

describe("catching and missing", () => {
  it("catches an aligned object and adds its points", () => {
    const next = tick(playing({ fallingObjects: [makeObject({ x: 50 })] }));
    expect(next.score).toBe(GAME_CONFIG.points.standard);
    expect(next.fallingObjects).toHaveLength(0);
  });

  it("awards bonus points for a bonus object", () => {
    const next = tick(
      playing({
        fallingObjects: [
          makeObject({ type: FALLING_OBJECT_TYPE.Bonus, points: 3 }),
        ],
      }),
    );
    expect(next.score).toBe(GAME_CONFIG.points.bonus);
  });

  it("catches on body overlap at the reach boundary", () => {
    const reach =
      GAME_CONFIG.catcher.catchHalfWidth + GAME_CONFIG.object.widthPercent / 2;
    const atEdge = tick(
      playing({ fallingObjects: [makeObject({ x: 50 + reach })] }),
    );
    expect(atEdge.score).toBe(GAME_CONFIG.points.standard);

    const beyond = tick(
      playing({ fallingObjects: [makeObject({ x: 50 + reach + 1 })] }),
    );
    expect(beyond.score).toBe(0);
    expect(beyond.fallingObjects).toHaveLength(1);
  });

  it("loses a life when an object falls past the bottom unaligned", () => {
    const next = tick(
      playing({
        lives: 3,
        fallingObjects: [makeObject({ x: 90, y: GAME_CONFIG.field.missLineY })],
      }),
    );
    expect(next.lives).toBe(2);
    expect(next.fallingObjects).toHaveLength(0);
  });

  it("ends the game when the last life is lost", () => {
    const next = tick(
      playing({
        lives: 1,
        fallingObjects: [makeObject({ x: 90, y: GAME_CONFIG.field.missLineY })],
      }),
    );
    expect(next.lives).toBe(0);
    expect(next.status).toBe(GAME_STATUS.GameOver);
  });
});

describe("highscore", () => {
  it("tracks the running maximum", () => {
    const next = tick(playing({ score: 0, highscore: 0 }));
    expect(next.highscore).toBe(0);

    const caught = tick(playing({ score: 4, highscore: 4 }));
    expect(caught.highscore).toBe(4);

    const beaten = tick(
      playing({ score: 4, highscore: 4, fallingObjects: [makeObject()] }),
    );
    expect(beaten.score).toBe(4 + GAME_CONFIG.points.standard);
    expect(beaten.highscore).toBe(4 + GAME_CONFIG.points.standard);
  });
});

describe("difficulty selectors", () => {
  it("derives level, speed and spawn interval from score", () => {
    expect(selectDifficultyLevel(playing({ score: 0 }))).toBe(0);
    expect(
      selectDifficultyLevel(playing({ score: GAME_CONFIG.difficulty.step })),
    ).toBe(1);

    expect(selectGameSpeed(playing({ score: 0 }))).toBe(
      GAME_CONFIG.speed.baseDesktop,
    );
    expect(
      selectGameSpeed(playing({ score: GAME_CONFIG.difficulty.step })),
    ).toBeCloseTo(
      GAME_CONFIG.speed.baseDesktop + GAME_CONFIG.speed.increasePerLevel,
    );

    expect(selectSpawnInterval(playing({ score: 0 }))).toBe(
      GAME_CONFIG.spawnInterval.baseDesktop,
    );
  });
});
