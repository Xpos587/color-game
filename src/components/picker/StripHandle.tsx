"use client";

interface StripHandleProps {
  position: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  isDragging: boolean;
}

export function StripHandle({
  position,
  onMouseDown,
  onTouchStart,
  isDragging,
}: StripHandleProps) {
  return (
    <div
      className="strip-handle"
      style={{
        top: `${position * 100}%`,
        ...(isDragging ? { transform: "translate(-50%, -50%) scale(1.1)" } : {}),
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    />
  );
}
