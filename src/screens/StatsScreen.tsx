import React from 'react';
import { GameData } from '../game/types';

interface Props {
  data: GameData;
  onReset: () => void;
  onBack: () => void;
}

export const StatsScreen: React.FC<Props> = ({ data, onReset, onBack }) => {
  const total = data.player1Wins + data.player2Wins;
  const p1Pct = total > 0 ? Math.round((data.player1Wins / total) * 100) : 0;
  const p2Pct = total > 0 ? Math.round((data.player2Wins / total) * 100) : 0;

  return (
    <div className="screen-container py-6">
      <div className="flex flex-col items-center gap-4 w-full max-w-sm px-4">
        <h2
          className="text-2xl font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: 'hsl(var(--sand-light))', fontFamily: "'Courier New', monospace" }}
        >
          📊 STATS
        </h2>

        <div className="w-full space-y-3">
          {[
            ['Matches Played', data.matchesPlayed],
            ['Player 1 Wins', data.player1Wins],
            ['Player 2 Wins', data.player2Wins],
            ['P1 Win Rate', `${p1Pct}%`],
            ['P2 Win Rate', `${p2Pct}%`],
          ].map(([label, val]) => (
            <div
              key={label as string}
              className="flex justify-between p-3 rounded-sm"
              style={{
                background: 'hsl(var(--muted))',
                borderLeft: '3px solid hsl(var(--accent))',
                fontFamily: "'Courier New', monospace",
              }}
            >
              <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</span>
              <span className="font-bold" style={{ color: 'hsl(var(--foreground))' }}>{val}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => { if (confirm('Reset all stats?')) onReset(); }}
          className="btn-military-secondary w-full mt-2"
          style={{ borderColor: 'hsl(var(--destructive))' }}
        >
          🗑 RESET STATS
        </button>
        <button onClick={onBack} className="btn-military-secondary w-full">
          ← BACK
        </button>
      </div>
    </div>
  );
};
