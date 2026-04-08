"use client";

import { useCallback, useRef, useState } from "react";

interface UseDragOptions {
  onDrag: (deltaY: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function useDrag({ onDrag, onDragStart, onDragEnd }: UseDragOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const lastY = useRef(0);

  const handleMove = useCallback((clientY: number) => {
    const deltaY = clientY - lastY.current;
    lastY.current = clientY;
    onDrag(deltaY);
  }, [onDrag]);

  const handleStart = useCallback(
    (clientY: number) => {
      setIsDragging(true);
      lastY.current = clientY;
      onDragStart?.();

      const handleMouseMove = (e: MouseEvent) => handleMove(e.clientY);
      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        handleMove(e.touches[0].clientY);
      };
      const handleEnd = () => {
        setIsDragging(false);
        onDragEnd?.();
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleEnd);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleEnd);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleEnd);
    },
    [handleMove, onDragStart, onDragEnd]
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientY);
    },
    [handleStart]
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleStart(e.touches[0].clientY);
    },
    [handleStart]
  );

  return { onMouseDown, onTouchStart, isDragging };
}
