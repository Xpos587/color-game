"use client";

import { useCallback, useRef, useState } from "react";
import { useMountEffect } from "@/lib/useMountEffect";
import type { useSound } from "@/hooks/useSound";

interface AnimatedScoreProps {
  value: number;
  onAnimationComplete?: () => void;
  className?: string;
  sound?: ReturnType<typeof useSound>;
}

function quinticEaseOut(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

function ScoreAnimator({
  value,
  onAnimationComplete,
  sound,
}: {
  value: number;
  onAnimationComplete?: () => void;
  sound?: ReturnType<typeof useSound>;
}) {
  const intRef = useRef<HTMLSpanElement>(null);
  const decRef = useRef<HTMLSpanElement>(null);
  const [displayInt, setDisplayInt] = useState(0);
  const [displayDec, setDisplayDec] = useState("00");
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSoundTimeRef = useRef(0);
  const lastIntRef = useRef(0);
  const lastStepTimeRef = useRef(0);

  const totalHundredths = Math.round(value * 100);
  const duration = 1200 + (value / 10) * 800;

  const cleanup = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (delayRef.current !== null) {
      clearTimeout(delayRef.current);
      delayRef.current = null;
    }
  }, []);

  // Trigger slide animation on an element
  const triggerSlide = useCallback((el: HTMLSpanElement | null, fast: boolean) => {
    if (!el) return;
    const cls = fast ? "num-in-fast" : "num-in";
    el.classList.remove("num-in-fast", "num-out-fast", "num-in", "num-out");
    void el.offsetWidth;
    el.classList.add(cls);
  }, []);

  // Rule 4: mount-only animation start (350ms delay before animation begins)
  useMountEffect(() => {
    startTimeRef.current = null;
    lastSoundTimeRef.current = 0;
    lastIntRef.current = 0;
    lastStepTimeRef.current = 0;
    setDisplayInt(0);
    setDisplayDec("00");

    delayRef.current = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const rawP = Math.min(elapsed / duration, 1);
        const easedP = quinticEaseOut(rawP);
        const currentHundredths = Math.min(totalHundredths, Math.round(easedP * value * 100));
        const newInt = Math.floor(currentHundredths / 100);
        const newDec = currentHundredths % 100;
        const gap = timestamp - lastStepTimeRef.current;
        const slow = gap > 70;

        if (currentHundredths !== lastStepTimeRef.current) {
          const isIntChange = newInt !== lastIntRef.current;

          if (isIntChange) {
            if (slow) triggerSlide(intRef.current, false);
            setDisplayInt(newInt);
            lastIntRef.current = newInt;
          }

          if (slow) {
            triggerSlide(decRef.current, false);
          }
          setDisplayDec(String(newDec).padStart(2, "0"));

          // Sound: tick on tenths changes
          if (sound && timestamp - lastSoundTimeRef.current > 50 && currentHundredths % 10 < 5) {
            sound.scoreTick(currentHundredths / Math.max(1, totalHundredths), isIntChange);
            lastSoundTimeRef.current = timestamp;
          }

          lastStepTimeRef.current = timestamp;
        }

        if (rawP < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          // Clean landing — clear animation classes, set final value
          if (intRef.current) {
            intRef.current.classList.remove("num-in-fast", "num-out-fast", "num-in", "num-out");
          }
          if (decRef.current) {
            decRef.current.classList.remove("num-in-fast", "num-out-fast", "num-in", "num-out");
          }
          setDisplayInt(Math.floor(value));
          setDisplayDec(String(Math.round((value % 1) * 100)).padStart(2, "0"));
          if (sound) sound.scoreLand();
          onAnimationComplete?.();
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    }, 350);

    return cleanup;
  });

  return (
    <>
      <span ref={intRef} style={{ display: "inline-block" }}>{displayInt}</span>
      <span style={{ display: "inline-block", opacity: 0.5 }}>.</span>
      <span ref={decRef} style={{ display: "inline-block", opacity: 0.52 }}>{displayDec}</span>
    </>
  );
}

export function AnimatedScore({
  value,
  onAnimationComplete,
  className,
  sound,
}: AnimatedScoreProps) {
  return (
    <span className={className}>
      <ScoreAnimator key={value} value={value} onAnimationComplete={onAnimationComplete} sound={sound} />
    </span>
  );
}
