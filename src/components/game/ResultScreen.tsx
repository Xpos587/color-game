"use client"

import { useCallback, useState } from "react"
import { AnimatedScore } from "@/components/ui/AnimatedScore"
import type { useSound } from "@/hooks/useSound"
import { getScoreFeedback, hsbToCss, textColorForBg } from "@/lib/color"
import type { HSB } from "@/types/game"

interface ResultScreenProps {
  targetHsb: HSB
  playerHsb: HSB
  score: number
  round: number
  totalRounds: number
  onNext: () => void
  sound: ReturnType<typeof useSound>
}

export function ResultScreen({
  targetHsb,
  playerHsb,
  score,
  round,
  totalRounds,
  onNext,
  sound,
}: ResultScreenProps) {
  const [showFeedback, setShowFeedback] = useState(false)

  const targetColor = hsbToCss(targetHsb)
  const playerColor = hsbToCss(playerHsb)

  const handleAnimationComplete = useCallback(() => {
    setTimeout(() => setShowFeedback(true), 200)
  }, [])

  return (
    <div className="relative h-full w-full">
      {/* Color comparison -- top/bottom split (player top, target bottom) with labels */}
      <div className="absolute inset-0 flex flex-col">
        <div className="result-half" style={{ backgroundColor: playerColor }}>
          <span className="result-label">Your selection</span>
          <span className="result-hsb">
            H{playerHsb.h} S{playerHsb.s} B{playerHsb.b}
          </span>
        </div>
        <div className="result-half" style={{ backgroundColor: targetColor }}>
          <span className="result-label">Original</span>
          <span className="result-hsb">
            H{targetHsb.h} S{targetHsb.s} B{targetHsb.b}
          </span>
        </div>
      </div>

      {/* Round indicator -- top-left */}
      <div className="result-round">
        {round}/{totalRounds}
      </div>

      {/* Score -- top-right */}
      <div className="result-score" style={{ color: textColorForBg(playerHsb) }}>
        <AnimatedScore
          key={score}
          value={score}
          onAnimationComplete={handleAnimationComplete}
          className=""
          sound={sound}
        />
      </div>

      {/* Feedback text -- below score, right-aligned */}
      {showFeedback && (
        <div
          className="result-feedback"
          style={{ color: textColorForBg(playerHsb), animation: "descFadeIn 0.4s ease forwards" }}
        >
          {getScoreFeedback(score)}
        </div>
      )}

      {/* Continue button — always arrow icon */}
      <button onClick={onNext} className="result-continue">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
          <path
            d="M14 5.75L20.25 12L14 18.25"
            stroke="#000"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19.5 12H3.75"
            stroke="#000"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}
