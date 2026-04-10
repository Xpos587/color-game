"use client";

import { cn } from "@/lib/utils";

interface GameShellProps {
  children: React.ReactNode;
  fadeActive: boolean;
  fastFade?: boolean;
}

export function GameShell({ children, fadeActive, fastFade }: GameShellProps) {
  return (
    <>
      {/* Game card container */}
      <div className="game-card">
        {children}

        {/* Fade overlay for transitions */}
        <div className={cn("fade-overlay", fastFade && "fast", fadeActive && "active")} />
      </div>
    </>
  );
}
