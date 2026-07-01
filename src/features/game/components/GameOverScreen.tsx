import { ModalDialog } from "@/features/game/components/ModalDialog";
import { Button } from "@/features/game/components/Button";

interface GameOverScreenProps {
  score: number;
  highscore: number;
  isNewHighscore: boolean;
  onPlayAgain: () => void;
  onExit: () => void;
}

/** Modal shown when all lives are lost. */
export function GameOverScreen({
  score,
  highscore,
  isNewHighscore,
  onPlayAgain,
  onExit,
}: GameOverScreenProps): React.JSX.Element {
  return (
    <ModalDialog title="Game over" onClose={onExit}>
      <dl className="mt-6 flex justify-center gap-8 text-sm">
        <div className="flex flex-col gap-1">
          <dt className="text-ink-muted">Score</dt>
          <dd className="text-2xl font-semibold tabular-nums">{score}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-ink-muted">Best</dt>
          <dd className="text-2xl font-semibold tabular-nums">{highscore}</dd>
        </div>
      </dl>

      {isNewHighscore && (
        <p className="mt-4 text-sm font-medium text-accent">New high score!</p>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <Button variant="primary" onClick={onPlayAgain}>
          Play again
        </Button>
        <Button variant="secondary" onClick={onExit}>
          Back to start
        </Button>
      </div>
    </ModalDialog>
  );
}
