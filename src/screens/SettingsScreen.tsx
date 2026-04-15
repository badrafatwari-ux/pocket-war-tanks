import React from 'react';
import { GameData } from '../game/types';

interface Props {
  data: GameData;
  onToggleSound: () => void;
  onToggleVibration: () => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ data, onToggleSound, onToggleVibration, onBack }) => {
  return (
    <div className="screen-container py-6">
      <div className="flex flex-col items-center gap-4 w-full max-w-sm px-4">
        <h2
          className="text-2xl font-bold tracking-[0.2em] uppercase mb-2"
          style={{ color: 'hsl(var(--sand-light))', fontFamily: "'Courier New', monospace" }}
        >
          ⚙ SETTINGS
        </h2>

        {[
          { label: 'Sound', value: data.soundOn, toggle: onToggleSound },
          { label: 'Vibration', value: data.vibrationOn, toggle: onToggleVibration },
        ].map((item) => (
          <button
            key={item.label}
            onClick={item.toggle}
            className="w-full flex justify-between items-center p-4 rounded-sm border-2 active:scale-95 transition-all"
            style={{
              background: 'hsl(var(--muted))',
              borderColor: item.value ? 'hsl(var(--accent))' : 'hsl(var(--border))',
              fontFamily: "'Courier New', monospace",
            }}
          >
            <span style={{ color: 'hsl(var(--foreground))' }}>{item.label}</span>
            <span
              className="text-sm font-bold px-3 py-1 rounded-sm"
              style={{
                background: item.value ? 'hsl(var(--military-green))' : 'hsl(var(--destructive))',
                color: 'hsl(var(--foreground))',
              }}
            >
              {item.value ? 'ON' : 'OFF'}
            </span>
          </button>
        ))}

        <button onClick={onBack} className="btn-military-secondary w-full mt-4">
          ← BACK
        </button>
      </div>
    </div>
  );
};
