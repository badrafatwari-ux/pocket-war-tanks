import React, { useRef, useCallback, useState } from 'react';

interface JoystickProps {
  size?: number;
  onMove: (dx: number, dy: number) => void;
  color: string;
}

export const VirtualJoystick: React.FC<JoystickProps> = ({ size = 100, onMove, color }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stick, setStick] = useState({ x: 0, y: 0 });
  const activeTouch = useRef<number | null>(null);
  const radius = size / 2 - 10;

  const getOffset = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius) {
      dx = (dx / dist) * radius;
      dy = (dy / dist) * radius;
    }
    return { x: dx, y: dy };
  }, [radius]);

  const handleStart = useCallback((clientX: number, clientY: number, touchId?: number) => {
    if (touchId !== undefined) activeTouch.current = touchId;
    const off = getOffset(clientX, clientY);
    setStick(off);
    onMove(off.x / radius, off.y / radius);
  }, [getOffset, onMove, radius]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    const off = getOffset(clientX, clientY);
    setStick(off);
    onMove(off.x / radius, off.y / radius);
  }, [getOffset, onMove, radius]);

  const handleEnd = useCallback(() => {
    activeTouch.current = null;
    setStick({ x: 0, y: 0 });
    onMove(0, 0);
  }, [onMove]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    handleStart(t.clientX, t.clientY, t.identifier);
  }, [handleStart]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouch.current) {
        handleMove(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
        break;
      }
    }
  }, [handleMove]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouch.current) {
        handleEnd();
        break;
      }
    }
  }, [handleEnd]);

  return (
    <div
      ref={containerRef}
      className="relative rounded-full flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: 'rgba(255,255,255,0.06)',
        border: `2px solid ${color}44`,
        touchAction: 'none',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      onMouseDown={(e) => { e.preventDefault(); handleStart(e.clientX, e.clientY); }}
      onMouseMove={(e) => { if (e.buttons > 0) handleMove(e.clientX, e.clientY); }}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      {/* Center crosshair */}
      <div className="absolute" style={{ width: 2, height: size * 0.4, background: `${color}22`, top: '30%' }} />
      <div className="absolute" style={{ height: 2, width: size * 0.4, background: `${color}22`, left: '30%' }} />
      
      {/* Stick knob */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.38,
          height: size * 0.38,
          background: `${color}bb`,
          boxShadow: `0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 ${color}44`,
          transform: `translate(${stick.x}px, ${stick.y}px)`,
          transition: stick.x === 0 && stick.y === 0 ? 'transform 0.12s ease-out' : 'none',
        }}
      />
    </div>
  );
};
