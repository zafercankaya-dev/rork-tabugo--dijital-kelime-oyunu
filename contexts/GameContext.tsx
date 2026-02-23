import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';
import { WORD_DATABASE } from '@/mocks/words';
import { WORD_DATABASE_EN } from '@/mocks/words_en';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  GameState,
  GameSettings,
  Player,
  Team,
  WordCard,
  FORBIDDEN_COUNT,
} from '@/types/game';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

const DEFAULT_SETTINGS: GameSettings = {
  targetScore: 30,
  turnDuration: 60,
  ageGroup: 'yetiskin',
  difficulty: 'orta',
  passLimit: 3,
};

export const [GameProvider, useGame] = createContextHook(() => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [players, setPlayers] = useState<Player[]>([]);
  const { language } = useLanguage();

  const wordDatabase = useMemo(() => {
    return language === 'en' ? WORD_DATABASE_EN : WORD_DATABASE;
  }, [language]);

  const updateSettings = useCallback((partial: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const addPlayer = useCallback((nickname: string, team: Team) => {
    const player: Player = {
      id: generateId(),
      nickname,
      team,
      score: 0,
      correctGuesses: 0,
      tabuCatches: 0,
      wordsDescribed: 0,
    };
    setPlayers((prev) => [...prev, player]);
    return player;
  }, []);

  const removePlayer = useCallback((id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const switchTeam = useCallback((id: string) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, team: p.team === 'A' ? 'B' : 'A' } : p
      )
    );
  }, []);

  const teamA = useMemo(() => players.filter((p) => p.team === 'A'), [players]);
  const teamB = useMemo(() => players.filter((p) => p.team === 'B'), [players]);

  const startGame = useCallback(() => {
    const state: GameState = {
      players: [...players],
      settings: { ...settings },
      currentTeam: 'A',
      currentDescriberIndex: { A: 0, B: 0 },
      scores: { A: 0, B: 0 },
      usedCardIds: [],
      turnResults: [],
      isGameOver: false,
      round: 1,
    };
    setGameState(state);
    return state;
  }, [players, settings]);

  const getNextCard = useCallback((): WordCard | null => {
    if (!gameState) return null;

    const available = wordDatabase.filter(
      (card) =>
        card.ageGroup.includes(gameState.settings.ageGroup) &&
        !gameState.usedCardIds.includes(card.id)
    );

    if (available.length === 0) {
      console.log('[Game] No more cards available - all cards used in this game');
      return null;
    }

    const idx = Math.floor(Math.random() * available.length);
    const card = available[idx];
    setGameState((prev) =>
      prev ? { ...prev, usedCardIds: [...prev.usedCardIds, card.id] } : null
    );

    const forbiddenCount = FORBIDDEN_COUNT[gameState.settings.difficulty];
    const trimmedCard: WordCard = {
      ...card,
      forbidden: card.forbidden.slice(0, forbiddenCount),
    };

    return trimmedCard;
  }, [gameState, wordDatabase]);

  const getCurrentDescriber = useCallback((): Player | null => {
    if (!gameState) return null;
    const team = gameState.currentTeam;
    const teamPlayers = gameState.players.filter((p) => p.team === team);
    if (teamPlayers.length === 0) return null;
    const idx = gameState.currentDescriberIndex[team] % teamPlayers.length;
    return teamPlayers[idx];
  }, [gameState]);

  const recordCorrect = useCallback(() => {
    if (!gameState) return;
    const describer = getCurrentDescriber();
    if (!describer) return;

    setGameState((prev) => {
      if (!prev) return null;
      const team = prev.currentTeam;
      const newScores = { ...prev.scores, [team]: prev.scores[team] + 1 };
      const newPlayers = prev.players.map((p) =>
        p.id === describer.id
          ? { ...p, wordsDescribed: p.wordsDescribed + 1, score: p.score + 1 }
          : p
      );

      const isGameOver = newScores[team] >= prev.settings.targetScore;

      return {
        ...prev,
        scores: newScores,
        players: newPlayers,
        isGameOver,
      };
    });
  }, [gameState, getCurrentDescriber]);

  const recordTabu = useCallback((catcherId?: string) => {
    if (!gameState) return;

    setGameState((prev) => {
      if (!prev) return null;
      const team = prev.currentTeam;
      const newScores = {
        ...prev.scores,
        [team]: Math.max(0, prev.scores[team] - 1),
      };
      const newPlayers = catcherId
        ? prev.players.map((p) =>
            p.id === catcherId ? { ...p, tabuCatches: p.tabuCatches + 1 } : p
          )
        : prev.players;
      return { ...prev, scores: newScores, players: newPlayers };
    });
  }, [gameState]);

  const endTurn = useCallback(() => {
    if (!gameState) return;

    setGameState((prev) => {
      if (!prev) return null;
      const currentTeam = prev.currentTeam;
      const nextTeam: Team = currentTeam === 'A' ? 'B' : 'A';
      const newDescriberIndex = {
        ...prev.currentDescriberIndex,
        [currentTeam]: prev.currentDescriberIndex[currentTeam] + 1,
      };
      const newRound = nextTeam === 'A' ? prev.round + 1 : prev.round;

      return {
        ...prev,
        currentTeam: nextTeam,
        currentDescriberIndex: newDescriberIndex,
        round: newRound,
      };
    });
  }, [gameState]);

  const resetGame = useCallback(() => {
    setGameState(null);
    setPlayers([]);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    gameState,
    settings,
    players,
    teamA,
    teamB,
    updateSettings,
    addPlayer,
    removePlayer,
    switchTeam,
    startGame,
    getNextCard,
    getCurrentDescriber,
    recordCorrect,
    recordTabu,
    endTurn,
    resetGame,
  };
});
