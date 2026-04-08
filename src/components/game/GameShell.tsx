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
      {/* Desktop chrome: logo in top-left corner */}
      <div className="desktop-chrome" style={{ position: "fixed", top: "21px", left: "26px", zIndex: 10 }}>
        <span
          className="text-black font-medium cursor-pointer"
          style={{
            fontSize: "21px",
            lineHeight: "21px",
            letterSpacing: "-0.84px",
            fontFamily: "var(--font-suisse, 'Inter', sans-serif)",
          }}
        >
          Dialed.
        </span>
      </div>

      {/* Game card container */}
      <div className="game-card">
        {children}

        {/* Fade overlay for transitions */}
        <div className={cn("fade-overlay", fastFade && "fast", fadeActive && "active")} />
      </div>
    </>
  );
}
