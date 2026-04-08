"use client";

import { hsbToRgb } from "@/lib/color";
import type { HSB } from "@/types/game";

interface ColorSwatchProps {
  targetColor: string;
  playerColor: string;
  score: number;
  playerHsb?: HSB;
  index?: number;
}

function parseRgb(color: string): { r: number; g: number; b: number } | null {
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return null;
  return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) };
}

function luminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function ColorSwatch({
  targetColor,
  playerColor,
  score,
  playerHsb,
  index = 0,
}: ColorSwatchProps) {
  let playerRgb: { r: number; g: number; b: number } | null = null;
  if (playerHsb) {
    playerRgb = hsbToRgb(playerHsb);
  } else {
    playerRgb = parseRgb(playerColor);
  }

  const scoreColor =
    playerRgb && luminance(playerRgb) > 0.45 ? "#000" : "#fff";

  return (
    <div
      className="relative aspect-square w-full overflow-hidden anim-cell"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* Target color — bottom-right triangle */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: targetColor,
          clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
        }}
      />
      {/* Player color — top-left triangle */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: playerColor,
          clipPath: "polygon(0 0, 100% 0, 0 100%)",
        }}
      />
      {/* Score label — inside the swatch */}
      <span
        className="swatch-score"
        style={{ color: scoreColor }}
      >
        {score.toFixed(2)}
      </span>
    </div>
  );
}
