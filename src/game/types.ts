export type GameMode = 'classic' | 'chaos' | 'oneshot';
export type Screen = 'home' | 'modes' | 'game' | 'stats' | 'settings' | 'matchResult';

export interface GameData {
  matchesPlayed: number;
  player1Wins: number;
  player2Wins: number;
  soundOn: boolean;
  vibrationOn: boolean;
  selectedMode: GameMode;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface Tank {
  x: number;
  y: number;
  angle: number;
  width: number;
  height: number;
  alive: boolean;
  color: string;
  turretColor: string;
  cooldown: number;
}

export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  bounces: number;
  maxBounces: number;
  owner: number;
  speed: number;
}

export interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'brick' | 'steel';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export const DEFAULT_GAME_DATA: GameData = {
  matchesPlayed: 0,
  player1Wins: 0,
  player2Wins: 0,
  soundOn: true,
  vibrationOn: true,
  selectedMode: 'classic',
};
