import { useRef } from "react";
import { useGameState } from "@/features/game/hooks/useGameState";
import { useGameControls } from "@/features/game/hooks/useGameControls";
import { GAME_CONFIG } from "@/features/game/constants/gameConfig";
import { GAME_STATUS } from "@/features/game/types/game.types";
import { InstructionsSlider } from "@/features/game/components/InstructionsSlider";
import { GameScreen } from "@/features/game/components/GameScreen";
import { Countdown } from "@/features/game/components/Countdown";
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
    lastGain,
    lastCatchId,
    lives,
    catcherPosition,
    catcherWidth,
    objectWidth,
    fallingObjects,
    startGame,
    beginPlay,
    pauseGame,
    resumeGame,
    restartGame,
    resetGame,
    setCatcherPosition,
    setCatcherDirection,
    togglePause,
  } = useGameState();

  const fieldRef = useRef<HTMLDivElement>(null);

  useGameControls({
    status,
    fieldRef,
    setCatcherPosition,
    setCatcherDirection,
    startGame,
    togglePause,
  });

  const isCountdown = status === GAME_STATUS.Countdown;
  const isPaused = status === GAME_STATUS.Paused;
  const isPlaying = status === GAME_STATUS.Playing;
  const isGameOver = status === GAME_STATUS.GameOver;
  const isActive = isCountdown || isPlaying || isPaused;

  return (
    <div className="flex min-h-dvh items-stretch justify-center bg-canvas sm:items-center sm:p-6">
      <main className="relative flex h-dvh w-full max-w-4xl flex-col overflow-hidden bg-canvas sm:h-[min(88dvh,780px)] sm:rounded-4xl sm:border sm:border-line sm:shadow-[0_50px_120px_-60px_rgba(10,10,10,0.5)]">
        <h1 className="sr-only">Sky-Catcher</h1>

        {status === GAME_STATUS.Start && (
          <InstructionsSlider onStart={startGame} />
        )}

        {isActive && (
          <>
            <div className="h-full" inert={isPaused || isCountdown}>
              <GameScreen
                score={score}
                highscore={highscore}
                lastGain={lastGain}
                lastCatchId={lastCatchId}
                lives={lives}
                livesTotal={GAME_CONFIG.livesStart}
                catcherPosition={catcherPosition}
                catcherWidth={catcherWidth}
                objectWidth={objectWidth}
                fallingObjects={fallingObjects}
                fieldRef={fieldRef}
                onPause={pauseGame}
              />
            </div>

            {isCountdown && <Countdown onComplete={beginPlay} />}

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
