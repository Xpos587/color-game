"use client";

import { useCallback, useRef } from "react";
import { StripHandle } from "./StripHandle";
import { useDrag } from "@/hooks/useDrag";

interface HsbStripProps {
  type: "hue" | "saturation" | "brightness";
  value: number;
  hue?: number;
  onChange: (value: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

function getGradient(type: string, hue?: number): string {
  switch (type) {
    case "hue":
      return "linear-gradient(to bottom, hsl(0,100%,50%), hsl(30,100%,50%), hsl(60,100%,50%), hsl(90,100%,50%), hsl(120,100%,50%), hsl(150,100%,50%), hsl(180,100%,50%), hsl(210,100%,50%), hsl(240,100%,50%), hsl(270,100%,50%), hsl(300,100%,50%), hsl(330,100%,50%), hsl(360,100%,50%))";
    case "saturation":
      return `linear-gradient(to bottom, hsl(${hue ?? 0},100%,50%), hsl(${hue ?? 0},0%,50%))`;
    case "brightness":
      return `linear-gradient(to bottom, hsl(${hue ?? 0},${Math.round((hue ?? 0) * 0.8 + 20)}%,100%), #000)`;
    default:
      return "transparent";
  }
}

export function HsbStrip({ type, value, hue, onChange, onDragStart, onDragEnd }: HsbStripProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const max = type === "hue" ? 360 : 100;

  // Hue: 0 at top, 360 at bottom (no invert)
  // Sat/Bri: 100 at top, 0 at bottom (invert)
  const position = type === "hue" ? value / max : 1 - value / max;

  const handleDrag = useCallback(
    (deltaY: number) => {
      if (!containerRef.current) return;
      const height = containerRef.current.clientHeight;
      // Hue: drag down = increase value (position = value/max, 0 at top)
      // Sat/Bri: drag up = increase value (position = 1-value/max, 0 at bottom)
      const dir = type === "hue" ? 1 : -1;
      const deltaValue = dir * (deltaY / height) * max;
      const newValue = Math.round(
        Math.min(max, Math.max(0, value + deltaValue))
      );
      if (newValue !== value) {
        onChange(newValue);
      }
    },
    [value, max, onChange, type]
  );

  const { onMouseDown, onTouchStart, isDragging } = useDrag({
    onDrag: handleDrag,
    onDragStart,
    onDragEnd,
  });

  // Handle clicking on the strip directly
  const handleStripClick = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      // Hue: top = 0, bottom = 360 (ratio = y/height)
      // Sat/Bri: top = 100, bottom = 0 (ratio = 1 - y/height)
      const ratio = type === "hue" ? y / rect.height : 1 - y / rect.height;
      const newValue = Math.round(Math.min(max, Math.max(0, ratio * max)));
      onChange(newValue);
    },
    [max, onChange, type]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full cursor-pointer overflow-hidden no-touch-action"
      style={{ background: getGradient(type, hue) }}
      onClick={handleStripClick}
    >
      <StripHandle
        position={position}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        isDragging={isDragging}
      />
    </div>
  );
}
