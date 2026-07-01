import { useGameState } from "@/features/game/hooks/useGameState";
import { GAME_CONFIG } from "@/features/game/constants/gameConfig";
import { GAME_STATUS } from "@/features/game/types/game.types";
import { InstructionsSlider } from "@/features/game/components/InstructionsSlider";
import { GameScreen } from "@/features/game/components/GameScreen";
import { PauseOverlay } from "@/features/game/components/PauseOverlay";
import { GameOverScreen } from "@/features/game/components/GameOverScreen";

/**
 * Container for the Sky-Catcher game: owns game state and renders the screen
 * matching the current status. All child components are presentational.
 */
export function SkyCatcherGame(): React.JSX.Element {
  const {
    status,
    score,
    highscore,
    lives,
    catcherPosition,
    fallingObjects,
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    resetGame,
  } = useGameState();

  const isPaused = status === GAME_STATUS.Paused;
  const isPlaying = status === GAME_STATUS.Playing;
  const isGameOver = status === GAME_STATUS.GameOver;

  return (
    <div className="flex min-h-dvh items-stretch justify-center bg-paper sm:items-center sm:p-6">
      <main className="relative flex h-dvh w-full max-w-xl flex-col overflow-hidden bg-paper sm:h-[min(88dvh,780px)] sm:rounded-4xl sm:border sm:border-line sm:shadow-[0_50px_120px_-60px_rgba(10,10,10,0.5)]">
        <h1 className="sr-only">Sky-Catcher</h1>

        {status === GAME_STATUS.Start && (
          <InstructionsSlider onStart={startGame} />
        )}

        {(isPlaying || isPaused) && (
          <>
            <div className="h-full" inert={isPaused}>
              <GameScreen
                score={score}
                highscore={highscore}
                lives={lives}
                livesTotal={GAME_CONFIG.livesStart}
                catcherPosition={catcherPosition}
                fallingObjects={fallingObjects}
                onPause={pauseGame}
              />
            </div>

            {isPaused && (
              <PauseOverlay
                score={score}
                highscore={highscore}
                onResume={resumeGame}
                onRestart={restartGame}
                onExit={resetGame}
              />
            )}
          </>
        )}

        {isGameOver && (
          <GameOverScreen
            score={score}
            highscore={highscore}
            isNewHighscore={score > 0 && score === highscore}
            onPlayAgain={restartGame}
            onExit={resetGame}
          />
        )}
      </main>
    </div>
  );
}
