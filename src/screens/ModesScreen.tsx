import React from 'react';
import { GameMode } from '../game/types';

interface Props {
  selectedMode: GameMode;
  onSelect: (mode: GameMode) => void;
  onBack: () => void;
}

const modes: { id: GameMode; name: string; icon: string; desc: string }[] = [
  { id: 'classic', name: 'CLASSIC', icon: '🎯', desc: 'Best of 5 rounds. Pure skill.' },
  { id: 'chaos', name: 'CHAOS', icon: '💥', desc: 'Faster bullets, more ricochets, extra obstacles.' },
  { id: 'oneshot', name: 'ONE SHOT', icon: '☠️', desc: 'One hit = instant match win.' },
];

export const ModesScreen: React.FC<Props> = ({ selectedMode, onSelect, onBack }) => {
  return (
    <div className="screen-container">
      <div className="flex flex-col items-center gap-4 w-full max-w-sm px-4">
        <h2
          className="text-2xl font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: 'hsl(var(--sand-light))', fontFamily: "'Courier New', monospace" }}
        >
          GAME MODES
        </h2>

        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className="w-full p-4 rounded-sm border-2 transition-all active:scale-95 text-left"
            style={{
              background: selectedMode === m.id ? 'hsl(var(--military-green))' : 'hsl(var(--muted))',
              borderColor: selectedMode === m.id ? 'hsl(var(--accent))' : 'hsl(var(--border))',
              color: 'hsl(var(--foreground))',
              fontFamily: "'Courier New', monospace",
            }}
          >
            <div className="text-lg font-bold">
              {m.icon} {m.name}
            </div>
            <div className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {m.desc}
            </div>
          </button>
        ))}

        <button onClick={onBack} className="btn-military-secondary mt-2 w-full">
          ← BACK
        </button>
      </div>
    </div>
  );
};
