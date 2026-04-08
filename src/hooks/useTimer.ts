"use client";

import { useCallback, useRef, useState } from "react";
import { useMountEffect } from "@/lib/useMountEffect";

export function useTimer(
  duration: number,
  onExpire: () => void
) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const rafRef = useRef<number>(0);
  const fallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const generationRef = useRef(0);

  const expire = useCallback((gen: number) => {
    if (generationRef.current !== gen) return;
    setIsRunning(false);
    setTimeLeft(0);
    onExpire();
  }, [onExpire]);

  const start = useCallback((d?: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (fallbackRef.current) clearTimeout(fallbackRef.current);

    const dur = d ?? duration;
    const gen = ++generationRef.current;
    setTimeLeft(dur);
    setIsRunning(true);
    startTimeRef.current = performance.now();

    // Fallback timeout ensures expiry even when tab is backgrounded (RAF pauses)
    fallbackRef.current = setTimeout(() => expire(gen), dur * 1000 + 50);

    const tick = () => {
      if (generationRef.current !== gen) return;

      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, dur - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (fallbackRef.current) clearTimeout(fallbackRef.current);
        fallbackRef.current = null;
        expire(gen);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [duration, expire]);

  // Cancel RAF + fallback on unmount — Rule 4
  useMountEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (fallbackRef.current) clearTimeout(fallbackRef.current);
    };
  });

  return { timeLeft, isRunning, start };
}
