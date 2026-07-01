import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  type?: "button" | "submit";
  disabled?: boolean;
}

const BASE_CLASSES =
  "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm " +
  "font-medium tracking-wide transition-all duration-200 focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-paper active:translate-y-0 " +
  "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-paper shadow-[0_10px_24px_-10px_rgba(10,10,10,0.55)] hover:-translate-y-0.5 hover:bg-ink/90",
  secondary:
    "border border-ink text-ink hover:-translate-y-0.5 hover:bg-ink hover:text-paper",
  ghost: "text-ink-muted hover:text-ink",
};

/** Text button with an explicit type and visible focus ring. */
export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled = false,
}: ButtonProps): React.JSX.Element {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]}`}
    >
      {children}
    </button>
  );
}
