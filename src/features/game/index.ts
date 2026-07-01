/**
 * Public API of the `game` feature.
 *
 * External code must import exclusively from this barrel — internal files
 * (components, hooks, services, constants, types) are private.
 */
export { SkyCatcherGame } from "@/features/game/components/SkyCatcherGame";
export { useGameState } from "@/features/game/hooks/useGameState";
export { GAME_CONFIG } from "@/features/game/constants/gameConfig";
export {
  GAME_STATUS,
  FALLING_OBJECT_TYPE,
} from "@/features/game/types/game.types";
export type {
  GameStatus,
  FallingObject,
  FallingObjectType,
  GameState,
  GameControls,
  UseGameStateResult,
} from "@/features/game/types/game.types";
