import { GameData, DEFAULT_GAME_DATA } from './types';

const STORAGE_KEY = 'retro_tank_duel_data';

export function loadGameData(): GameData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_GAME_DATA, ...JSON.parse(raw) };
    }
  } catch {}
  return { ...DEFAULT_GAME_DATA };
}

export function saveGameData(data: GameData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}
