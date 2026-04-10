"use client";

import { useCallback, useRef, useState } from "react";
import { useMountEffect } from "@/lib/useMountEffect";
import type { GameMode } from "@/types/game";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ui/ModeToggle";
import type { useSound } from "@/hooks/useSound";

const MAX_SPEED = 1200;

interface IntroScreenProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  onPlay: () => void;
  sound: ReturnType<typeof useSound>;
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 9.5C13.3807 9.5 14.5 8.38071 14.5 7C14.5 5.61929 13.3807 4.5 12 4.5C10.6193 4.5 9.5 5.61929 9.5 7C9.5 8.38071 10.6193 9.5 12 9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 11C5.60457 11 6.5 10.1046 6.5 9C6.5 7.89543 5.60457 7 4.5 7C3.39543 7 2.5 7.89543 2.5 9C2.5 10.1046 3.39543 11 4.5 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.5 11C20.6046 11 21.5 10.1046 21.5 9C21.5 7.89543 20.6046 7 19.5 7C18.3954 7 17.5 7.89543 17.5 9C17.5 10.1046 18.3954 11 19.5 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 19.25H15.5C16.4665 19.25 17.25 18.4665 17.25 17.5C17.25 14.6005 14.8995 12.25 12 12.25C9.1005 12.25 6.75 14.6005 6.75 17.5C6.75 18.4665 7.5335 19.25 8.5 19.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.75136 18.2498H2.50119C1.39662 18.2498 0.470354 17.3063 0.986733 16.3299C1.67862 15.0215 3.02859 14.0591 4.50136 13.812" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.25 18.2498H21.5C22.6046 18.2498 23.5308 17.3063 23.0145 16.3298C22.3227 15.0215 20.9728 14.0591 19.5 13.812" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M4.75 8.75C4.75 7.64543 5.64543 6.75 6.75 6.75H17.25C18.3546 6.75 19.25 7.64543 19.25 8.75V17.25C19.25 18.3546 18.3546 19.25 17.25 19.25H6.75C5.64543 19.25 4.75 18.3546 4.75 17.25V8.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 4.75V8.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 4.75V8.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.75 10.75H16.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8.5" cy="13.5" r="1.15" fill="currentColor" />
      <circle cx="12" cy="13.5" r="1.15" fill="currentColor" />
      <circle cx="15.5" cy="13.5" r="1.15" fill="currentColor" />
      <circle cx="8.5" cy="16.5" r="1.15" fill="currentColor" />
      <circle cx="12" cy="16.5" r="1.15" fill="currentColor" />
      <circle cx="15.5" cy="16.5" r="1.15" fill="currentColor" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M6.55211 3.25C5.65611 5.69807 6.48402 7.13205 9.05211 7.58013C9.94812 5.13205 9.12021 3.69807 6.55211 3.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.05998 8.17912C2.82812 10.7757 3.99896 11.9465 6.59552 11.7147C6.82738 9.1181 5.65654 7.94726 3.05998 8.17912Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.67188 14.2992C3.11994 16.8673 4.55393 17.6952 7.002 16.7992C6.55393 14.2311 5.11995 13.4032 2.67188 14.2992Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.4506 3.25C18.3466 5.69807 17.5186 7.13205 14.9506 7.58013C14.0545 5.13205 14.8825 3.69807 17.4506 3.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.9315 8.17912C21.1633 10.7757 19.9925 11.9465 17.3959 11.7147C17.1641 9.1181 18.3349 7.94726 20.9315 8.17912Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21.3301 14.2982C20.8821 16.8663 19.4481 17.6942 17 16.7982C17.4481 14.2301 18.8821 13.4022 21.3301 14.2982Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 16.7979C9.4429 19.4992 13.2165 18.7897 15.5 21.4992" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 16.7979C14.5571 19.4992 10.7835 18.7897 8.5 21.4992" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
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
      {/* Leaderboard button — mobile: bottom-right (disabled) */}
      <button
        type="button"
        className="absolute z-20 flex items-center justify-center rounded-full text-white/50 transition-[transform,color] duration-150 intro-trophy-mobile btn-muted"
        style={{ bottom: 'calc(30px + env(safe-area-inset-bottom, 0px))', right: '30px', width: '32px', height: '32px', background: 'none', border: 'none' }}
        aria-label="Рейтинг"
      >
        <TrophyIcon className="size-[24px]" />
      </button>

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

      {/* Body text — pinned above mode buttons on mobile, top-aligned on desktop */}
      <div className="intro-body">
        <p>Люди не могут в точности повторить цвета. Это простая игра, чтобы проверить, насколько хорош (или плох) ты в&nbsp;этом.</p>
        <p>Мы покажем тебе пять цветов, а ты попробуешь их&nbsp;повторить.</p>
        <p className="intro-mode-label">Одиночная игра</p>
      </div>

      {/* Mode buttons area — absolute bottom */}
      <div className="intro-mode-buttons absolute flex items-center">
        {/* Solo play button — with rainbow ring + hum */}
        <button
          ref={soloRef}
          type="button"
          onClick={onPlay}
          onMouseEnter={handleSoloEnter}
          onMouseLeave={handleSoloLeave}
          className={cn(
            "play-button flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full",
            "bg-white text-black shadow-[0_2px_8px_rgba(0,0,0,0.15)]",
            "hover:text-white hover:scale-[1.04]",
            "active:scale-[0.94]"
          )}
          aria-label="Играть"
        >
          <span className="font-medium text-[22px] tracking-[-1.1px] relative z-[2]">ГАЗ</span>
        </button>

        {/* Multiplayer button (disabled) */}
        <button
          type="button"
          className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full bg-white text-black shadow-[0_2px_8px_rgba(0,0,0,0.15)] cursor-default btn-muted"
          aria-label="Мультиплеер (скоро)"
        >
          <UsersIcon className="size-[29px]" />
        </button>

        {/* Daily button (disabled) */}
        <button
          type="button"
          className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full bg-white text-black shadow-[0_2px_8px_rgba(0,0,0,0.15)] cursor-default btn-muted"
          aria-label="Ежедневный вызов (скоро)"
        >
          <CalendarIcon className="size-[29px]" />
        </button>

        {/* Mode toggle */}
        <ModeToggle mode={mode} onToggle={() => handleModeChange(mode === "easy" ? "hard" : "easy")} />

        {/* Leaderboard button — desktop (disabled) */}
        <button
          type="button"
          className="hidden md:flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full text-[#808080] transition-[transform,color] duration-150 cursor-default btn-muted"
          aria-label="Рейтинг"
        >
          <TrophyIcon className="size-[29px]" />
        </button>
      </div>

      {/* Credit footer */}
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
  );
}
