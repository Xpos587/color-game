"use client";

import { useCallback } from "react";
import { useMountEffect } from "@/lib/useMountEffect";
import { Logo } from "@/components/ui/Logo";
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

  // Derive progress from timeLeft — no ref needed, just compute inline
  const progress = 1 - Math.max(0, timeLeft) / timeLimit;

  // Rule 4: mount-only start
  useMountEffect(() => {
    start(timeLimit);
    sound.flutterStart();
    return () => sound.flutterStop();
  });

  // Update flutter sound on each timeLeft change
  const updateFlutter = useCallback((p: number) => { sound.flutterUpdate(p); }, [sound]);
  updateFlutter(progress);

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
        Секунды на запоминание
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

      {/* Watermark — aligned with round indicator */}
      <div
        className="absolute z-10 pointer-events-none"
        style={{
          top: "30px",
          right: "30px",
          opacity: 0.2,
        }}
      >
        <Logo style={{ height: "8px", width: "auto" }} />
      </div>
    </div>
  );
}
