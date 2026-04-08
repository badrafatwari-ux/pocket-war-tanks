import React, { useRef, useEffect, useCallback } from 'react';
import { GameEngine } from '../game/engine';
import { GameMode } from '../game/types';

interface Props {
  mode: GameMode;
  soundOn: boolean;
  vibrationOn: boolean;
  onRoundEnd: (winner: number) => void;
}

export const GameScreen: React.FC<Props> = ({ mode, soundOn, vibrationOn, onRoundEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas, mode, soundOn, vibrationOn);
    engine.onRoundEnd = onRoundEnd;
    engineRef.current = engine;
    engine.start();

    const handleResize = () => {
      if (engineRef.current) {
        // re-init engine on resize handled internally
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      engine.stop();
      window.removeEventListener('resize', handleResize);
    };
  }, [mode, soundOn, vibrationOn, onRoundEnd]);

  const setControl = useCallback((player: 0 | 1, key: 'left' | 'right' | 'fire', value: boolean) => {
    const e = engineRef.current;
    if (e) e.controls[player][key] = value;
  }, []);

  const handleTouch = useCallback((e: React.TouchEvent | React.MouseEvent, player: 0 | 1, key: 'left' | 'right' | 'fire', value: boolean) => {
    e.preventDefault();
    setControl(player, key, value);
  }, [setControl]);

  const btnStyle = (color: string) => ({
    background: color,
    border: '2px solid rgba(255,255,255,0.15)',
    color: '#e8dcc8',
    fontFamily: "'Courier New', monospace",
    fontSize: '11px',
    fontWeight: 'bold' as const,
    textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
    boxShadow: '0 3px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
    touchAction: 'none' as const,
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const,
  });

  return (
    <div className="w-full h-screen flex" style={{ background: '#1a1a14', touchAction: 'none' }}>
      {/* P1 Controls */}
      <div className="flex flex-col justify-center items-center gap-2 p-2" style={{ width: '15%', minWidth: 56 }}>
        <div className="text-[10px] font-bold tracking-widest mb-1" style={{ color: '#4a6741' }}>P1</div>
        <button
          className="w-full flex-1 max-h-16 rounded-sm active:opacity-70"
          style={btnStyle('#3a5431')}
          onTouchStart={(e) => handleTouch(e, 0, 'left', true)}
          onTouchEnd={(e) => handleTouch(e, 0, 'left', false)}
          onMouseDown={(e) => handleTouch(e, 0, 'left', true)}
          onMouseUp={(e) => handleTouch(e, 0, 'left', false)}
        >
          ↺
        </button>
        <button
          className="w-full flex-1 max-h-16 rounded-sm active:opacity-70"
          style={btnStyle('#3a5431')}
          onTouchStart={(e) => handleTouch(e, 0, 'right', true)}
          onTouchEnd={(e) => handleTouch(e, 0, 'right', false)}
          onMouseDown={(e) => handleTouch(e, 0, 'right', true)}
          onMouseUp={(e) => handleTouch(e, 0, 'right', false)}
        >
          ↻
        </button>
        <button
          className="w-full flex-1 max-h-20 rounded-sm active:opacity-70"
          style={{ ...btnStyle('#8b2500'), fontSize: '13px' }}
          onTouchStart={(e) => handleTouch(e, 0, 'fire', true)}
          onTouchEnd={(e) => handleTouch(e, 0, 'fire', false)}
          onMouseDown={(e) => handleTouch(e, 0, 'fire', true)}
          onMouseUp={(e) => handleTouch(e, 0, 'fire', false)}
        >
          FIRE
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="flex-1 block"
        style={{ touchAction: 'none' }}
      />

      {/* P2 Controls */}
      <div className="flex flex-col justify-center items-center gap-2 p-2" style={{ width: '15%', minWidth: 56 }}>
        <div className="text-[10px] font-bold tracking-widest mb-1" style={{ color: '#8b7355' }}>P2</div>
        <button
          className="w-full flex-1 max-h-16 rounded-sm active:opacity-70"
          style={btnStyle('#6b5335')}
          onTouchStart={(e) => handleTouch(e, 1, 'left', true)}
          onTouchEnd={(e) => handleTouch(e, 1, 'left', false)}
          onMouseDown={(e) => handleTouch(e, 1, 'left', true)}
          onMouseUp={(e) => handleTouch(e, 1, 'left', false)}
        >
          ↺
        </button>
        <button
          className="w-full flex-1 max-h-16 rounded-sm active:opacity-70"
          style={btnStyle('#6b5335')}
          onTouchStart={(e) => handleTouch(e, 1, 'right', true)}
          onTouchEnd={(e) => handleTouch(e, 1, 'right', false)}
          onMouseDown={(e) => handleTouch(e, 1, 'right', true)}
          onMouseUp={(e) => handleTouch(e, 1, 'right', false)}
        >
          ↻
        </button>
        <button
          className="w-full flex-1 max-h-20 rounded-sm active:opacity-70"
          style={{ ...btnStyle('#8b2500'), fontSize: '13px' }}
          onTouchStart={(e) => handleTouch(e, 1, 'fire', true)}
          onTouchEnd={(e) => handleTouch(e, 1, 'fire', false)}
          onMouseDown={(e) => handleTouch(e, 1, 'fire', true)}
          onMouseUp={(e) => handleTouch(e, 1, 'fire', false)}
        >
          FIRE
        </button>
      </div>
    </div>
  );
};
