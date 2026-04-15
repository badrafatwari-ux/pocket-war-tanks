import React from 'react';

interface Props {
  winner: number;
  p1Score: number;
  p2Score: number;
  onRematch: () => void;
  onHome: () => void;
}

export const MatchResultScreen: React.FC<Props> = ({ winner, p1Score, p2Score, onRematch, onHome }) => {
  return (
    <div className="screen-container py-6">
      <div className="flex flex-col items-center gap-5 text-center">
        <div
          className="text-lg tracking-[0.3em] uppercase"
          style={{ color: 'hsl(var(--muted-foreground))', fontFamily: "'Courier New', monospace" }}
        >
          MATCH OVER
        </div>

        <div
          className="text-3xl font-bold tracking-[0.2em]"
          style={{
            color: 'hsl(var(--accent))',
            textShadow: '0 0 20px hsl(var(--accent) / 0.4)',
            fontFamily: "'Courier New', monospace",
          }}
        >
          🏆 PLAYER {winner} WINS! 🏆
        </div>

        <div className="flex gap-8 my-4">
          <div className="text-center">
            <div className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>P1</div>
            <div className="text-2xl font-bold" style={{ color: '#4a6741' }}>{p1Score}</div>
          </div>
          <div className="text-xl font-bold self-end mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
            —
          </div>
          <div className="text-center">
            <div className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>P2</div>
            <div className="text-2xl font-bold" style={{ color: '#8b7355' }}>{p2Score}</div>
          </div>
        </div>

        <button onClick={onRematch} className="btn-military w-56">
          🔄 REMATCH
        </button>
        <button onClick={onHome} className="btn-military-secondary w-56">
          🏠 MAIN MENU
        </button>
      </div>
    </div>
  );
};
