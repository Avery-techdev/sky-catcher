import { useEffect, useId, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

type ModalVariant = "default" | "sunset";

interface ModalDialogProps {
  title: string;
  children: ReactNode;
  /** Called on Escape (and used as the "dismiss" affordance). */
  onClose?: () => void;
  /** Visual theme of the dialog surface. */
  variant?: ModalVariant;
}

const FOCUSABLE_SELECTOR =
  "button:not([disabled]), [href], input:not([disabled]), " +
  'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * modal dialog: labelled by its title, traps focus while open,
 * restores focus to the trigger on close and dismisses on Escape.
 */
export function ModalDialog({
  title,
  children,
  onClose,
  variant = "default",
}: ModalDialogProps): React.JSX.Element {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const isSunset = variant === "sunset";

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) {
      return;
    }

    const triggerElement = document.activeElement as HTMLElement | null;
    const getFocusable = (): HTMLElement[] =>
      Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

    (getFocusable()[0] ?? panel).focus();

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && onClose) {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    panel.addEventListener("keydown", handleKeyDown);
    return () => {
      panel.removeEventListener("keydown", handleKeyDown);
      triggerElement?.focus?.();
    };
  }, [onClose]);

  const backdropClass = isSunset
    ? "absolute inset-0 bg-ui-text/30 backdrop-blur-sm"
    : "absolute inset-0 bg-ink/40 backdrop-blur-sm";
  const panelClass = isSunset
    ? "animate-dialog-in relative w-full max-w-sm rounded-[1.75rem] border border-sky-mid/30 p-8 text-center shadow-[0_40px_100px_-40px_rgba(61,13,0,0.5)] focus:outline-none"
    : "animate-dialog-in relative w-full max-w-sm rounded-[1.75rem] border border-line p-8 text-center shadow-[0_40px_100px_-40px_rgba(10,10,10,0.6)] focus:outline-none";
  const panelStyle: CSSProperties = isSunset
    ? {
        // Same faint warm wash as the start screen.
        background: "var(--gradient-sky-wash)",
      }
    : {
        background: "radial-gradient(ellipse at top, #ffffff 0%, #f4f4f4 100%)",
      };
  const titleClass = isSunset
    ? "text-2xl font-semibold tracking-tight text-balance text-ui-text"
    : "text-2xl font-semibold tracking-tight text-balance";

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className={backdropClass} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={panelClass}
        style={panelStyle}
      >
        <h2 id={titleId} className={titleClass}>
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
