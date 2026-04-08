import React, { useRef, useEffect, useCallback } from 'react';
import { GameEngine } from '../game/engine';
import { GameMode } from '../game/types';

interface Props {
  mode: GameMode;
  soundOn: boolean;
  vibrationOn: boolean;
  onRoundEnd: (winner: number) => void;
}

type Dir = 'up' | 'down' | 'left' | 'right' | 'fire';

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
    return () => { engine.stop(); };
  }, [mode, soundOn, vibrationOn, onRoundEnd]);

  const set = useCallback((player: 0 | 1, key: Dir, val: boolean) => {
    const e = engineRef.current;
    if (e) e.controls[player][key] = val;
  }, []);

  const bind = (player: 0 | 1, key: Dir) => ({
    onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); set(player, key, true); },
    onTouchEnd: (e: React.TouchEvent) => { e.preventDefault(); set(player, key, false); },
    onTouchCancel: (e: React.TouchEvent) => { e.preventDefault(); set(player, key, false); },
    onMouseDown: (e: React.MouseEvent) => { e.preventDefault(); set(player, key, true); },
    onMouseUp: (e: React.MouseEvent) => { e.preventDefault(); set(player, key, false); },
    onMouseLeave: (e: React.MouseEvent) => { e.preventDefault(); set(player, key, false); },
  });

  const dpadBtn = (color: string) => ({
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    background: color,
    border: '2px solid rgba(255,255,255,0.12)',
    color: '#e8dcc8',
    fontFamily: "'Courier New', monospace",
    fontSize: '16px',
    fontWeight: 'bold' as const,
    textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
    touchAction: 'none' as const,
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const,
    borderRadius: 4,
    width: 44,
    height: 44,
  });

  const DPad = ({ player, color }: { player: 0 | 1; color: string }) => (
    <div className="flex flex-col items-center gap-1">
      {/* Up */}
      <button style={dpadBtn(color)} {...bind(player, 'up')} className="active:opacity-60">▲</button>
      {/* Left / Fire / Right */}
      <div className="flex items-center gap-1">
        <button style={dpadBtn(color)} {...bind(player, 'left')} className="active:opacity-60">◄</button>
        <button
          style={{ ...dpadBtn('#8b2500'), width: 48, height: 48, fontSize: '11px', letterSpacing: '0.05em' }}
          {...bind(player, 'fire')}
          className="active:opacity-60 rounded-full"
        >
          FIRE
        </button>
        <button style={dpadBtn(color)} {...bind(player, 'right')} className="active:opacity-60">►</button>
      </div>
      {/* Down */}
      <button style={dpadBtn(color)} {...bind(player, 'down')} className="active:opacity-60">▼</button>
    </div>
  );

  return (
    <div className="w-full h-screen flex items-center" style={{ background: '#1a1a14', touchAction: 'none' }}>
      {/* P1 Controls */}
      <div className="flex flex-col items-center justify-center p-2" style={{ width: '20%', minWidth: 100 }}>
        <div className="text-[10px] font-bold tracking-widest mb-2" style={{ color: '#4a6741', fontFamily: "'Courier New', monospace" }}>P1</div>
        <DPad player={0} color="#3a5431" />
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} className="flex-1 block h-full" style={{ touchAction: 'none' }} />

      {/* P2 Controls */}
      <div className="flex flex-col items-center justify-center p-2" style={{ width: '20%', minWidth: 100 }}>
        <div className="text-[10px] font-bold tracking-widest mb-2" style={{ color: '#8b7355', fontFamily: "'Courier New', monospace" }}>P2</div>
        <DPad player={1} color="#6b5335" />
      </div>
    </div>
  );
};
