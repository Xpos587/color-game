"use client";

import { cn } from "@/lib/utils";
import type { GameScreen } from "@/types/game";

interface ScreenProps {
  id: GameScreen;
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Screen({ id, isActive, children, className }: ScreenProps) {
  return (
    <div
      id={`screen-${id}`}
      className={cn("screen", isActive && "active", className)}
    >
      {children}
    </div>
  );
}
