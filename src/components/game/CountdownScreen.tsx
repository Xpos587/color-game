"use client";

import { useMemo } from "react";
import type { GameMode, HSB } from "@/types/game";
import { hsbToCss, randomHsb } from "@/lib/color";

interface CountdownScreenProps {
  step: number;
  mode: GameMode;
  targetHsb: HSB;
  wordOpacity: number;
  onStepComplete: () => void;
}

const STEPS = ["Внимание", "На старт", "Марш"] as const;

export function CountdownScreen({
  step,
  mode,
  targetHsb,
  wordOpacity,
}: CountdownScreenProps) {
  const bgColors = useMemo(() => {
    if (mode === "hard") {
      return [
        hsbToCss(randomHsb()),
        hsbToCss(randomHsb()),
        hsbToCss(targetHsb),
      ];
    }
    return ["#000", "#000", "#000"];
  }, [mode, targetHsb]);

  const word = STEPS[step] ?? "";

  return (
    <div
      className="relative w-full h-full"
      style={{
        backgroundColor: bgColors[step] ?? "#000",
        transition: "background-color 0.45s ease",
      }}
    >
      <span
        className="countdown-word absolute text-white font-medium"
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
        }}
      >
        {word}
      </span>
    </div>
  );
}
