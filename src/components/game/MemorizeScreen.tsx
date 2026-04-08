"use client";

import { useRef } from "react";
import { useMountEffect } from "@/lib/useMountEffect";
import { useTimer } from "@/hooks/useTimer";
import { hsbToCss, textColorForBg } from "@/lib/color";
import type { HSB } from "@/types/game";
import type { useSound } from "@/hooks/useSound";

interface MemorizeScreenProps {
  targetHsb: HSB;
  round: number;
  totalRounds: number;
  timeLimit: number;
  onTimeUp: () => void;
  sound: ReturnType<typeof useSound>;
}

function MemorizeTimer({ timeLimit, onTimeUp, sound, textColor }: { timeLimit: number; onTimeUp: () => void; sound: ReturnType<typeof useSound>; textColor: string }) {
  const { timeLeft, start } = useTimer(timeLimit, onTimeUp);
  const lastProgressRef = useRef(-1);

  // Update flutter based on timer progress — using callback pattern to avoid render-time side effects
  const prevTimeLeftRef = useRef(timeLeft);
  if (timeLeft !== prevTimeLeftRef.current) {
    prevTimeLeftRef.current = timeLeft;
    const progress = 1 - Math.max(0, timeLeft) / timeLimit;
    // Only update when progress crosses a meaningful threshold (avoid excessive updates)
    if (Math.abs(progress - lastProgressRef.current) > 0.01) {
      lastProgressRef.current = progress;
      sound.flutterUpdate(progress);
    }
  }

  // Rule 4: mount-only start
  useMountEffect(() => {
    start(timeLimit);
    sound.flutterStart();
    return () => sound.flutterStop();
  });

  const displayInteger = Math.ceil(timeLeft);
  const fixed = timeLeft.toFixed(2);
  const dotIndex = fixed.indexOf(".");
  const intPart = fixed.slice(0, dotIndex);
  const decPart = fixed.slice(dotIndex + 1);

  return (
    <>
      <div className="memo-timer" style={{ color: textColor }}>
        <span
          key={displayInteger}
          className="memo-timer-num animate-[numSlideIn_0.15s_ease-out_forwards]"
        >
          <span id="timer-int">{intPart}</span>
          <span id="timer-dec" className="memo-timer-dec">{decPart}</span>
        </span>
      </div>
      <div className="memo-timer-label" style={{ color: textColor }}>
        Seconds to remember
      </div>
    </>
  );
}

export function MemorizeScreen({
  targetHsb,
  round,
  totalRounds,
  timeLimit,
  onTimeUp,
  sound,
}: MemorizeScreenProps) {
  const textColor = textColorForBg(targetHsb);

  return (
    <div
      className="relative w-full h-full"
      style={{ backgroundColor: hsbToCss(targetHsb) }}
    >
      {/* Round indicator -- top left */}
      <div className="memo-round" style={{ color: textColor }}>
        {round}/{totalRounds}
      </div>

      {/* Timer -- top right */}
      <MemorizeTimer key={round} timeLimit={timeLimit} onTimeUp={onTimeUp} sound={sound} textColor={textColor} />

      {/* Watermark */}
      <div className="memo-watermark" style={{ color: textColor.replace("#fff", "rgba(255,255,255,0.5)").replace("#000", "rgba(0,0,0,0.5)") }}>
        Dialed.gg
      </div>
    </div>
  );
}
