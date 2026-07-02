import { ModalDialog } from "@/features/game/components/ModalDialog";
import { Button } from "@/features/game/components/Button";

interface PauseOverlayProps {
  score: number;
  highscore: number;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

/** Modal shown while the game is paused, on the warm start-screen surface. */
export function PauseOverlay({
  score,
  highscore,
  onResume,
  onRestart,
  onExit,
}: PauseOverlayProps): React.JSX.Element {
  return (
    <ModalDialog title="Paused" onClose={onResume} variant="sunset">
      <dl className="mt-6 flex justify-center gap-8 text-sm">
        <div className="flex flex-col gap-1">
          <dt className="text-ui-text/60">Score</dt>
          <dd className="text-2xl font-semibold tabular-nums text-ui-text">
            {score}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-ui-text/60">Best</dt>
          <dd className="text-2xl font-semibold tabular-nums text-ui-text">
            {highscore}
          </dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-col gap-3">
        <Button variant="primary" onClick={onResume}>
          Resume
        </Button>
        <Button variant="secondary" onClick={onRestart}>
          Play again
        </Button>
        <Button variant="ghost" onClick={onExit}>
          Back to start
        </Button>
      </div>
    </ModalDialog>
  );
}
