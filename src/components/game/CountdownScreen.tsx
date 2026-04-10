"use client";

import { useMemo } from "react";
import type { HSB } from "@/types/game";
import { hsbToCss, randomHsb, textColorForBg } from "@/lib/color";

interface CountdownScreenProps {
  step: number;
  targetHsb: HSB;
  wordOpacity: number;
  onStepComplete: () => void;
}

const STEPS = ["Внимание", "На старт", "Марш"] as const;

export function CountdownScreen({
  step,
  targetHsb,
  wordOpacity,
}: CountdownScreenProps) {
  const bgHsbs = useMemo(() => {
    return [randomHsb(), randomHsb(), targetHsb];
  }, [targetHsb]);

  const bgColors = useMemo(() => {
    return bgHsbs.map(hsbToCss);
  }, [bgHsbs]);

  const word = STEPS[step] ?? "";
  const textColor = textColorForBg(bgHsbs[step] ?? { h: 0, s: 0, b: 0 });

  return (
    <div
      className="relative w-full h-full"
      style={{
        backgroundColor: bgColors[step] ?? "#000",
        transition: "background-color 0.45s ease",
      }}
    >
      <span
        className="countdown-word absolute font-medium"
        style={{
          right: "16px",
          top: "6px",
          textAlign: "right",
          fontFamily: "inherit",
          fontWeight: 500,
          fontSize: "min(92px, 18vw)",
          letterSpacing: "-2.76px",
          lineHeight: 1,
          opacity: wordOpacity,
          color: textColor,
        }}
      >
        {word}
      </span>
    </div>
  );
}
