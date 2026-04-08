"use client";

import { cx } from "styled-system/css";
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
      className={cx("screen", isActive && "active", className)}
    >
      {children}
    </div>
  );
}
