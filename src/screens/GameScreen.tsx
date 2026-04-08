import React, { useRef, useEffect, useCallback } from 'react';
import { GameEngine } from '../game/engine';
import { GameMode } from '../game/types';
import { VirtualJoystick } from '../components/VirtualJoystick';

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

    return () => {
      engine.stop();
    };
  }, [mode, soundOn, vibrationOn, onRoundEnd]);

  const handleP1Move = useCallback((dx: number, dy: number) => {
    const e = engineRef.current;
    if (e) { e.controls[0].moveX = dx; e.controls[0].moveY = dy; }
  }, []);

  const handleP2Move = useCallback((dx: number, dy: number) => {
    const e = engineRef.current;
    if (e) { e.controls[1].moveX = dx; e.controls[1].moveY = dy; }
  }, []);

  const handleFire = useCallback((e: React.TouchEvent | React.MouseEvent, player: 0 | 1, value: boolean) => {
    e.preventDefault();
    const eng = engineRef.current;
    if (eng) eng.controls[player].fire = value;
  }, []);

  const fireBtnStyle = {
    background: '#8b2500',
    border: '2px solid rgba(255,255,255,0.15)',
    color: '#e8dcc8',
    fontFamily: "'Courier New', monospace",
    fontSize: '13px',
    fontWeight: 'bold' as const,
    textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
    boxShadow: '0 3px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
    touchAction: 'none' as const,
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const,
  };

  return (
    <div className="w-full h-screen flex" style={{ background: '#1a1a14', touchAction: 'none' }}>
      {/* P1 Controls */}
      <div className="flex flex-col justify-center items-center gap-2 p-2" style={{ width: '18%', minWidth: 80 }}>
        <div className="text-[10px] font-bold tracking-widest mb-1" style={{ color: '#4a6741', fontFamily: "'Courier New', monospace" }}>P1</div>
        <VirtualJoystick size={90} onMove={handleP1Move} color="#4a6741" />
        <button
          className="w-16 h-16 rounded-full active:opacity-70 mt-1"
          style={fireBtnStyle}
          onTouchStart={(e) => handleFire(e, 0, true)}
          onTouchEnd={(e) => handleFire(e, 0, false)}
          onMouseDown={(e) => handleFire(e, 0, true)}
          onMouseUp={(e) => handleFire(e, 0, false)}
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
      <div className="flex flex-col justify-center items-center gap-2 p-2" style={{ width: '18%', minWidth: 80 }}>
        <div className="text-[10px] font-bold tracking-widest mb-1" style={{ color: '#8b7355', fontFamily: "'Courier New', monospace" }}>P2</div>
        <VirtualJoystick size={90} onMove={handleP2Move} color="#8b7355" />
        <button
          className="w-16 h-16 rounded-full active:opacity-70 mt-1"
          style={fireBtnStyle}
          onTouchStart={(e) => handleFire(e, 1, true)}
          onTouchEnd={(e) => handleFire(e, 1, false)}
          onMouseDown={(e) => handleFire(e, 1, true)}
          onMouseUp={(e) => handleFire(e, 1, false)}
        >
          FIRE
        </button>
      </div>
    </div>
  );
};
