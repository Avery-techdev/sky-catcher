import { ModalDialog } from "@/features/game/components/ModalDialog";
import { Button } from "@/features/game/components/Button";

interface PauseOverlayProps {
  score: number;
  highscore: number;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

/** Modal shown while the game is paused. */
export function PauseOverlay({
  score,
  highscore,
  onResume,
  onRestart,
  onExit,
}: PauseOverlayProps): React.JSX.Element {
  return (
    <ModalDialog title="Pausiert" onClose={onResume}>
      <dl className="mt-6 flex justify-center gap-8 text-sm">
        <div className="flex flex-col gap-1">
          <dt className="text-ink-muted">Dein Score</dt>
          <dd className="text-2xl font-semibold tabular-nums">{score}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-ink-muted">Highscore</dt>
          <dd className="text-2xl font-semibold tabular-nums">{highscore}</dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-col gap-3">
        <Button variant="primary" onClick={onResume}>
          Fortsetzen
        </Button>
        <Button variant="secondary" onClick={onRestart}>
          Nochmal spielen
        </Button>
        <Button variant="ghost" onClick={onExit}>
          Zur Startseite
        </Button>
      </div>
    </ModalDialog>
  );
}
