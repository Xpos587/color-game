"use client";

import { useMountEffect } from "@/lib/useMountEffect";
import { useState } from "react";
import type { RoundResult } from "@/types/game";
import { hsbToCss, getTotalFeedback } from "@/lib/color";
import { ColorSwatch } from "@/components/ui/ColorSwatch";
import type { useSound } from "@/hooks/useSound";

interface TotalScreenProps {
  totalScore: number;
  roundScores: RoundResult[];
  onPlayAgain: () => void;
  sound: ReturnType<typeof useSound>;
}

export function TotalScreen({
  totalScore,
  roundScores,
  onPlayAgain,
  sound,
}: TotalScreenProps) {
  const [revealed, setRevealed] = useState(false);
  const maxScore = roundScores.length * 10;

  // Rule 4: mount-only one-time external sync
  useMountEffect(() => {
    const timer = setTimeout(() => {
      setRevealed(true);
      sound.tileFlip(0);
    }, 200);
    return () => clearTimeout(timer);
  });

  return (
    <div className={`total-screen${revealed ? " revealed" : ""}`}>
      {/* Top gradient fade */}
      <div className="total-fade-top" />

      {/* Score display — compact inline */}
      <div
        id="total-rank-row"
        style={{ margin: '20px 30px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}
      >
        <span
          id="total-score"
          style={{
            fontFamily: 'inherit',
            fontSize: '19px',
            fontWeight: 500,
            letterSpacing: '-0.38px',
            lineHeight: 1.2,
            color: '#fff',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {totalScore.toFixed(2)}
          <span style={{ display: 'inline-block', opacity: 0.5 }}> / </span>
          <span style={{ display: 'inline-block', opacity: 0.5 }}>{maxScore}</span>
        </span>
      </div>

      {/* Description */}
      <div id="total-description">
        <p
          style={{
            margin: '48px 0 0 30px',
            fontSize: '19px',
            fontWeight: 500,
            lineHeight: 1.2,
            letterSpacing: '-0.38px',
            color: '#fff',
            maxWidth: '338px',
            paddingRight: '80px',
          }}
        >
          {getTotalFeedback(totalScore)}
        </p>
      </div>

      {/* Color swatch grid */}
      <div
        id="total-swatches"
        style={{
          margin: '14px 30px 0 30px',
        }}
      >
        {roundScores.map((result, i) => (
          <ColorSwatch
            key={i}
            targetColor={hsbToCss(result.targetHsb)}
            playerColor={hsbToCss(result.playerHsb)}
            playerHsb={result.playerHsb}
            score={result.score}
            index={i}
          />
        ))}
      </div>

      {/* Play again button */}
      <div id="total-actions" style={{ margin: '19px 30px 0', display: 'flex', flexDirection: 'column' }}>
        <button
          onClick={onPlayAgain}
          onMouseEnter={() => sound.hover()}
          className="go-btn go-text"
        >
          Play again
        </button>
      </div>
    </div>
  );
}
