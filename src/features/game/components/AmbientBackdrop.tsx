import type { CSSProperties } from "react";

interface Shape {
  readonly left: string;
  readonly size: number;
  readonly duration: number;
  readonly delay: number;
  readonly rounded: string;
  readonly accent: boolean;
}

// Hand-tuned so shapes are spread out and drift at different speeds.
const SHAPES: readonly Shape[] = [
  {
    left: "8%",
    size: 26,
    duration: 22,
    delay: -4,
    rounded: "rounded-xl",
    accent: false,
  },
  {
    left: "22%",
    size: 14,
    duration: 17,
    delay: -11,
    rounded: "rounded-full",
    accent: true,
  },
  {
    left: "37%",
    size: 34,
    duration: 27,
    delay: -2,
    rounded: "rounded-2xl",
    accent: false,
  },
  {
    left: "52%",
    size: 18,
    duration: 19,
    delay: -14,
    rounded: "rounded-full",
    accent: false,
  },
  {
    left: "68%",
    size: 24,
    duration: 24,
    delay: -8,
    rounded: "rounded-lg",
    accent: false,
  },
  {
    left: "81%",
    size: 12,
    duration: 16,
    delay: -6,
    rounded: "rounded-full",
    accent: true,
  },
  {
    left: "92%",
    size: 30,
    duration: 29,
    delay: -17,
    rounded: "rounded-xl",
    accent: false,
  },
];

/** Decorative, barely-visible shapes drifting down behind the start screen. */
export function AmbientBackdrop(): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {SHAPES.map((shape, index) => {
        const style: CSSProperties = {
          left: shape.left,
          top: 0,
          width: shape.size,
          height: shape.size,
          animation: `drift-fall ${shape.duration}s linear ${shape.delay}s infinite`,
        };
        return (
          <span
            key={`shape-${index}`}
            style={style}
            className={`absolute ${shape.rounded} ${
              shape.accent ? "bg-accent/[0.07]" : "bg-ink/[0.045]"
            }`}
          />
        );
      })}
    </div>
  );
}
