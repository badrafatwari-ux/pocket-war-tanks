import React, { useState, useEffect } from 'react';

export const LandscapeGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const check = () => {
      // Only enforce on mobile-sized screens (touch devices)
      const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsPortrait(isMobile && window.innerHeight > window.innerWidth);
    };
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  if (isPortrait) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-6"
        style={{ background: '#1a1a14', color: '#e8dcc8', fontFamily: "'Courier New', monospace" }}>
        <div style={{ fontSize: 48 }}>📱🔄</div>
        <div className="text-xl font-bold tracking-widest" style={{ color: '#c4a46c' }}>
          ROTATE YOUR DEVICE
        </div>
        <div className="text-sm text-center px-8 opacity-70">
          Retro Tank Duel is best played in landscape mode.<br />
          Please turn your phone sideways.
        </div>
        <div className="animate-pulse text-3xl">↻</div>
      </div>
    );
  }

  return <>{children}</>;
};
