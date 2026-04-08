"use client"

import { useMemo } from "react"
import { hsbToCss, randomHsb } from "@/lib/color"
import type { GameMode, HSB } from "@/types/game"

interface CountdownScreenProps {
  step: number
  mode: GameMode
  targetHsb: HSB
  wordOpacity: number
  onStepComplete: () => void
}

const STEPS = ["Ready", "Set", "Go"] as const

export function CountdownScreen({ step, mode, targetHsb, wordOpacity }: CountdownScreenProps) {
  const bgColors = useMemo(() => {
    if (mode === "hard") {
      return [hsbToCss(randomHsb()), hsbToCss(randomHsb()), hsbToCss(targetHsb)]
    }
    return ["#000", "#000", "#000"]
  }, [mode, targetHsb])

  const word = STEPS[step] ?? ""

  return (
    <div
      className="relative h-full w-full"
      style={{
        backgroundColor: bgColors[step] ?? "#000",
        transition: "background-color 0.45s ease",
      }}
    >
      <span
        className="countdown-word absolute font-medium text-white"
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
  )
}
