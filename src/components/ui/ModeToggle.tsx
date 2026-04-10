"use client";

import { useCallback, useRef, useState } from "react";
import type { GameMode } from "@/types/game";
import { cn } from "@/lib/utils";

interface ModeToggleProps {
  mode: GameMode;
  onToggle: () => void;
  className?: string;
}

function ToggleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 shrink-0">
      <path
        d="M1.75 12C1.75 8.54822 4.54822 5.75 8 5.75H16C19.4518 5.75 22.25 8.54822 22.25 12C22.25 15.4518 19.4518 18.25 16 18.25H8C4.54822 18.25 1.75 15.4518 1.75 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        className="toggle-knob"
        d="M12.75 12C12.75 10.2051 14.2051 8.75 16 8.75C17.7949 8.75 19.25 10.2051 19.25 12C19.25 13.7949 17.7949 15.25 16 15.25C14.2051 15.25 12.75 13.7949 12.75 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function ModeToggle({ mode, onToggle, className }: ModeToggleProps) {
  const [isSpring, setIsSpring] = useState(false);
  const springTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback(() => {
    if (isSpring) return;
    if (mode === "easy") {
      setIsSpring(true);
      springTimerRef.current = setTimeout(() => setIsSpring(false), 550);
    }
    onToggle();
  }, [isSpring, mode, onToggle]);

  const isHard = mode === "hard";

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Это не весело. Ты был предупрежден."
      className={cn(
        "mode-toggle",
        !isHard ? "easy" : "hard",
        className
      )}
    >
      <ToggleIcon />
      <span>{isHard ? "Сложно" : "Легко"}</span>
    </button>
  );
}
