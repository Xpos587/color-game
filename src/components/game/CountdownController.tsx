"use client";

import { useCallback, useRef, useState } from "react";
import { useMountEffect } from "@/lib/useMountEffect";
import type { GameScreen, HSB } from "@/types/game";
import { CountdownScreen } from "@/components/game/CountdownScreen";
import type { useSound } from "@/hooks/useSound";

interface CountdownControllerProps {
  step: number;
  targetHsb: HSB;
  nextCountdown: () => void;
  setScreen: (screen: GameScreen) => void;
  sound: ReturnType<typeof useSound>;
}


export function CountdownController({
  step,
  targetHsb,
  nextCountdown,
  setScreen,
  sound,
}: CountdownControllerProps) {
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [wordOpacity, setWordOpacity] = useState(1);

  const cleanup = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  }, []);

  // Show a new word: fade out (0), change step, fade in (1) after delay
  const showNextWord = useCallback((callback?: () => void) => {
    setWordOpacity(0);
    timersRef.current.push(setTimeout(() => {
      callback?.();
      setWordOpacity(1);
    }, 150));
  }, []);

  // Rule 4 + Rule 5: mount-only schedule
  useMountEffect(() => {
    // "Ready" shown immediately with blip
    sound.blipReady();

    // "Set" at 800ms
    timersRef.current.push(setTimeout(() => {
      showNextWord(() => {
        sound.blipReady();
        nextCountdown(); // step 0 → 1
      });
    }, 800));

    // "Go" at 1600ms
    timersRef.current.push(setTimeout(() => {
      showNextWord(() => {
        sound.blipGo();
        nextCountdown(); // step 1 → 2
      });
    }, 1600));

    // Advance to memorize at 2650ms (250ms hold after "Go")
    timersRef.current.push(setTimeout(() => {
      setWordOpacity(0);
      timersRef.current.push(setTimeout(() => {
        setScreen("memorize");
      }, 200));
    }, 2650));

    return cleanup;
  });

  return (
    <CountdownScreen
      step={step}
      targetHsb={targetHsb}
      wordOpacity={wordOpacity}
      onStepComplete={() => {}}
    />
  );
}
