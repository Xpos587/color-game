"use client";

import { useCallback, useRef, useState } from "react";
import { useMountEffect } from "@/lib/useMountEffect";
import type { GameMode } from "@/types/game";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { Logo } from "@/components/ui/Logo";
import type { useSound } from "@/hooks/useSound";

const MAX_SPEED = 1200;

interface IntroScreenProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  onPlay: () => void;
  sound: ReturnType<typeof useSound>;
}

export function IntroScreen({ mode, onModeChange, onPlay, sound }: IntroScreenProps) {
  const [rgbSplitActive, setRgbSplitActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Solo button hover animation state
  const soloRef = useRef<HTMLButtonElement>(null);
  const soloHovering = useRef(false);
  const soloSpeed = useRef(36);
  const soloRingT = useRef(0);

  const handleModeChange = useCallback(
    (newMode: GameMode) => {
      if (newMode === "hard") {
        setRgbSplitActive(true);
        setTimeout(() => setRgbSplitActive(false), 550);
        if (containerRef.current) {
          if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
          setTimeout(() => {
            containerRef.current?.classList.remove("shaking");
            void containerRef.current?.offsetWidth;
            containerRef.current?.classList.add("shaking");
            shakeTimerRef.current = setTimeout(() => {
              containerRef.current?.classList.remove("shaking");
              shakeTimerRef.current = null;
            }, 900);
          }, 100);
        }
      }
      onModeChange(newMode);
    },
    [onModeChange]
  );

  // Rule 4: mount-only one-time external sync (solo button ring animation loop)
  useMountEffect(() => {
    let last = performance.now();
    let animId: number;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      if (soloHovering.current) {
        soloSpeed.current += (MAX_SPEED - soloSpeed.current) * 0.8 * dt;
        soloRingT.current = Math.min(soloRingT.current + dt / 5, 1);
        sound.soloHumUpdate(soloSpeed.current, MAX_SPEED);
      } else {
        soloRingT.current = Math.max(soloRingT.current - dt / 4, 0);
        soloSpeed.current += (36 - soloSpeed.current) * 0.6 * dt;
      }

      const t = soloRingT.current;
      const eased = t * t * (3 - 2 * t);
      const ringSpeed = 36 + (MAX_SPEED - 36) * eased;
      const dur = Math.max(0.3, 360 / ringSpeed);

      if (soloRef.current) {
        soloRef.current.style.setProperty("--ring-dur", dur + "s");
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  });

  const handleSoloEnter = useCallback(() => {
    soloHovering.current = true;
    soloSpeed.current = 36;
    soloRingT.current = 0;
    sound.soloHover();
    sound.soloHumStart();
  }, [sound]);

  const handleSoloLeave = useCallback(() => {
    soloHovering.current = false;
    sound.soloHumStop();
  }, [sound]);

  return (
    <div ref={containerRef} className="relative flex h-full w-full flex-col bg-black">
      {/* Title */}
      <h1
        className={cn(
          "intro-title text-white leading-none",
          "font-medium tracking-[-5.52px]",
          rgbSplitActive && "animate-[rgbSplit_0.55s_ease-in-out]"
        )}
      >
        color
      </h1>

      {/* Body text */}
      <div className="intro-body">
        <p>Люди не могут в точности повторить цвета. Это простая игра, чтобы проверить, насколько хорош (или плох) ты в&nbsp;этом.</p>
        <p>Мы покажем тебе пять цветов, а ты попробуешь их&nbsp;повторить.</p>
      </div>

      {/* Bottom area: play pill + mode toggle */}
      <div className="intro-bottom">
        <div className="intro-pill">
          <button
            ref={soloRef}
            type="button"
            onClick={onPlay}
            onMouseEnter={handleSoloEnter}
            onMouseLeave={handleSoloLeave}
            className={cn(
              "play-button flex h-11 items-center justify-center rounded-full",
              "bg-white text-black",
              "hover:text-white hover:scale-[1.04]",
              "active:scale-[0.94]"
            )}
            aria-label="Играть"
          >
            <span className="font-medium text-[15px] tracking-[-0.75px] relative z-[2] px-4">ГАЗ</span>
          </button>

          <div className="intro-pill-divider" />

          <ModeToggle mode={mode} onToggle={() => handleModeChange(mode === "easy" ? "hard" : "easy")} />
        </div>
      </div>

      {/* Footer: logo + credits */}
      <div className="intro-footer">
        <div className="intro-footer-logo">
          <Logo style={{ height: '14px' }} />
        </div>
        <span
          className="intro-credit"
          style={{ pointerEvents: 'auto' }}
          onMouseEnter={() => sound.creditHumStart()}
          onMouseLeave={() => sound.creditHumStop()}
          onClick={() => sound.creditHumStop()}
        >
          <span style={{ color: 'rgba(255,255,255,0.8)' }}>Color v1.4</span>
          <span style={{ opacity: 0.4, margin: '0 2px' }}>·</span>
          <a href="https://dialed.gg/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 'inherit' }}>Privacy</a>
          <span style={{ opacity: 0.4, margin: '0 2px' }}>·</span>
          <a href="https://dialed.gg/scoring" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 'inherit' }}>Scoring</a>
        </span>
      </div>
    </div>
  );
}
