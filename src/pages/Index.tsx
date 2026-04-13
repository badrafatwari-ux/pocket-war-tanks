import React, { useState, useCallback } from 'react';
import { Screen, GameMode, GameData, DEFAULT_GAME_DATA } from '../game/types';
import { loadGameData, saveGameData } from '../game/storage';
import { playVictory } from '../game/sounds';
import { HomeScreen } from '../screens/HomeScreen';
import { ModesScreen } from '../screens/ModesScreen';
import { GameScreen } from '../screens/GameScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { MatchResultScreen } from '../screens/MatchResultScreen';

const Index = () => {
  const [screen, setScreen] = useState<Screen>('home');
  const [data, setData] = useState<GameData>(loadGameData);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [matchWinner, setMatchWinner] = useState(0);
  const [roundKey, setRoundKey] = useState(0);

  const save = useCallback((newData: GameData) => {
    setData(newData);
    saveGameData(newData);
  }, []);

  const winsNeeded = data.selectedMode === 'oneshot' ? 1 : 3;

  const handleRoundEnd = useCallback((winner: number) => {
    const newP1 = winner === 1 ? p1Score + 1 : p1Score;
    const newP2 = winner === 2 ? p2Score + 1 : p2Score;

    if (newP1 >= winsNeeded || newP2 >= winsNeeded) {
      const mw = newP1 >= winsNeeded ? 1 : 2;
      setP1Score(newP1);
      setP2Score(newP2);
      setMatchWinner(mw);
      if (data.soundOn) playVictory();
      const newData = {
        ...data,
        matchesPlayed: data.matchesPlayed + 1,
        player1Wins: data.player1Wins + (mw === 1 ? 1 : 0),
        player2Wins: data.player2Wins + (mw === 2 ? 1 : 0),
      };
      save(newData);
      setScreen('matchResult');
    } else {
      setP1Score(newP1);
      setP2Score(newP2);
      // Start next round
      setRoundKey((k) => k + 1);
    }
  }, [p1Score, p2Score, winsNeeded, data, save]);

  const startMatch = useCallback(() => {
    setP1Score(0);
    setP2Score(0);
    setMatchWinner(0);
    setRoundKey((k) => k + 1);
    setScreen('game');
  }, []);

  const selectMode = useCallback((mode: GameMode) => {
    save({ ...data, selectedMode: mode });
  }, [data, save]);

  const resetStats = useCallback(() => {
    save({ ...DEFAULT_GAME_DATA, soundOn: data.soundOn, vibrationOn: data.vibrationOn, selectedMode: data.selectedMode });
  }, [data, save]);

  const toggleSound = useCallback(() => save({ ...data, soundOn: !data.soundOn }), [data, save]);
  const toggleVibration = useCallback(() => save({ ...data, vibrationOn: !data.vibrationOn }), [data, save]);
  const goHome = useCallback(() => setScreen('home'), []);

  switch (screen) {
    case 'home':
      return (
        <HomeScreen
          onPlay={startMatch}
          onModes={() => setScreen('modes')}
          onStats={() => setScreen('stats')}
          onSettings={() => setScreen('settings')}
        />
      );
    case 'modes':
      return <ModesScreen selectedMode={data.selectedMode} onSelect={selectMode} onBack={goHome} />;
    case 'game':
      return (
        <GameScreen
          key={roundKey}
          mode={data.selectedMode}
          soundOn={data.soundOn}
          vibrationOn={data.vibrationOn}
          p1Score={p1Score}
          p2Score={p2Score}
          winsNeeded={winsNeeded}
          onRoundEnd={handleRoundEnd}
        />
      );
    case 'stats':
      return <StatsScreen data={data} onReset={resetStats} onBack={goHome} />;
    case 'settings':
      return <SettingsScreen data={data} onToggleSound={toggleSound} onToggleVibration={toggleVibration} onBack={goHome} />;
    case 'matchResult':
      return (
        <MatchResultScreen
          winner={matchWinner}
          p1Score={p1Score}
          p2Score={p2Score}
          onRematch={startMatch}
          onHome={goHome}
        />
      );
    default:
      return null;
  }
};

export default Index;
