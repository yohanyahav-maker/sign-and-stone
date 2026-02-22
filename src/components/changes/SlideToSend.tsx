import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

interface SlideToSendProps {
  onComplete: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

export function SlideToSend({ onComplete, loading, disabled, label = "החלק לשליחה" }: SlideToSendProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState(0);
  const [completed, setCompleted] = useState(false);
  const startX = useRef(0);
  const trackWidth = useRef(0);
  const thumbSize = 56;

  const getMaxOffset = () => {
    if (!trackRef.current) return 200;
    return trackRef.current.offsetWidth - thumbSize - 8; // 8 = padding
  };

  const handleStart = useCallback((clientX: number) => {
    if (disabled || loading || completed) return;
    startX.current = clientX;
    trackWidth.current = getMaxOffset();
    setDragging(true);
  }, [disabled, loading, completed]);

  const handleMove = useCallback((clientX: number) => {
    if (!dragging) return;
    // RTL: dragging left means negative delta
    const delta = startX.current - clientX;
    const clamped = Math.max(0, Math.min(delta, trackWidth.current));
    setOffset(clamped);
  }, [dragging]);

  const handleEnd = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    const threshold = trackWidth.current * 0.85;
    if (offset >= threshold) {
      setCompleted(true);
      setOffset(trackWidth.current);
      onComplete();
    } else {
      setOffset(0);
    }
  }, [dragging, offset, onComplete]);

  useEffect(() => {
    if (!dragging) return;
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onMouseUp = () => handleEnd();
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const onTouchEnd = () => handleEnd();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [dragging, handleMove, handleEnd]);

  const progress = trackWidth.current > 0 ? offset / trackWidth.current : 0;

  return (
    <div
      ref={trackRef}
      className={cn(
        "relative h-16 rounded-full bg-card border border-border overflow-hidden select-none",
        disabled && "opacity-40 pointer-events-none",
      )}
    >
      {/* Background fill */}
      <div
        className="absolute inset-y-0 right-0 bg-foreground/5 rounded-full transition-all"
        style={{ width: `${progress * 100}%`, transition: dragging ? "none" : "width 0.3s ease" }}
      />

      {/* Label */}
      <div
        className="absolute inset-0 flex items-center justify-center text-sm font-medium text-muted-foreground pointer-events-none transition-opacity"
        style={{ opacity: 1 - progress * 2 }}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : completed ? (
          <span className="text-foreground font-semibold">נשלח ✓</span>
        ) : (
          <>
            {label}
            <ArrowLeft className="h-4 w-4 mr-2" />
          </>
        )}
      </div>

      {/* Thumb */}
      <div
        className={cn(
          "absolute top-1 h-[calc(100%-8px)] aspect-square rounded-full bg-foreground text-primary-foreground flex items-center justify-center cursor-grab",
          dragging && "cursor-grabbing",
          !dragging && !completed && "transition-all duration-300 ease-out",
        )}
        style={{ right: `${4 + offset}px` }}
        onMouseDown={(e) => handleStart(e.clientX)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      >
        {completed ? (
          <Check className="h-5 w-5" />
        ) : (
          <ArrowLeft className="h-5 w-5" />
        )}
      </div>
    </div>
  );
}
