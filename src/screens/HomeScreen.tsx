import React from 'react';

interface Props {
  onPlay: () => void;
  onPlayAI: () => void;
  onModes: () => void;
  onStats: () => void;
  onSettings: () => void;
}

export const HomeScreen: React.FC<Props> = ({ onPlay, onPlayAI, onModes, onStats, onSettings }) => {
  return (
    <div className="screen-container relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-smoke"
            style={{
              width: 60 + i * 30,
              height: 60 + i * 30,
              background: 'hsl(var(--sand) / 0.3)',
              left: `${15 + i * 18}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(hsl(var(--sand) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--sand) / 0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-5">
        {/* Title */}
        <div className="text-center mb-2">
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-[0.3em] uppercase"
            style={{
              color: 'hsl(var(--sand-light))',
              textShadow: '2px 2px 4px rgba(0,0,0,0.6), 0 0 20px hsl(var(--military-green) / 0.3)',
              fontFamily: "'Courier New', monospace",
            }}
          >
            RETRO TANK
          </h1>
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-[0.4em] uppercase -mt-1"
            style={{
              color: 'hsl(var(--accent))',
              textShadow: '2px 2px 4px rgba(0,0,0,0.6), 0 0 30px hsl(var(--accent) / 0.2)',
              fontFamily: "'Courier New', monospace",
            }}
          >
            DUEL
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="h-px w-12" style={{ background: 'hsl(var(--sand) / 0.3)' }} />
            <span className="text-xs tracking-[0.5em] uppercase" style={{ color: 'hsl(var(--muted-foreground))' }}>
              2 PLAYER
            </span>
            <div className="h-px w-12" style={{ background: 'hsl(var(--sand) / 0.3)' }} />
          </div>
        </div>

        {/* Buttons */}
        <button onClick={onPlay} className="btn-military text-lg w-56 animate-pulse-glow">
          ▶ 2P LOCAL
        </button>
        <button onClick={onPlayAI} className="btn-military text-lg w-56">
          🤖 VS COMPUTER
        </button>
        <button onClick={onModes} className="btn-military-secondary w-56">
          🎮 GAME MODES
        </button>
        <button onClick={onStats} className="btn-military-secondary w-56">
          📊 STATS
        </button>
        <button onClick={onSettings} className="btn-military-secondary w-56">
          ⚙ SETTINGS
        </button>
      </div>
    </div>
  );
};
