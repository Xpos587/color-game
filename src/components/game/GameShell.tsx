"use client";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";

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
        <Logo
          className="cursor-pointer"
          style={{ height: "21px", width: "auto", color: "#000" }}
        />
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
