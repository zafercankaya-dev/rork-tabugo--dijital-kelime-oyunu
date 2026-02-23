import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GameHistoryEntry, PlayerGameStats, GameState, Team } from '@/types/game';

const HISTORY_STORAGE_KEY = '@tabugo_game_history';

function generateHistoryId(): string {
  return 'gh_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export const [GameHistoryProvider, useGameHistory] = createContextHook(() => {
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ['game_history'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as GameHistoryEntry[];
      }
      return [] as GameHistoryEntry[];
    },
  });

  useEffect(() => {
    if (historyQuery.data !== undefined) {
      setHistory(historyQuery.data);
    }
  }, [historyQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (entries: GameHistoryEntry[]) => {
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
      return entries;
    },
    onSuccess: (entries) => {
      setHistory(entries);
      queryClient.setQueryData(['game_history'], entries);
    },
  });

  const saveGame = useCallback((gameState: GameState) => {
    const winner: Team | null =
      gameState.scores.A > gameState.scores.B ? 'A' :
      gameState.scores.B > gameState.scores.A ? 'B' : null;

    const playerStats: PlayerGameStats[] = gameState.players.map((p) => ({
      playerId: p.id,
      nickname: p.nickname,
      team: p.team,
      wordsDescribed: p.wordsDescribed,
      correctGuesses: p.correctGuesses,
      tabuCatches: p.tabuCatches,
      passed: 0,
      score: p.score,
    }));

    const totalCorrect = gameState.players.reduce((sum, p) => sum + p.wordsDescribed, 0);
    const totalTabu = gameState.players.reduce((sum, p) => sum + p.tabuCatches, 0);

    const entry: GameHistoryEntry = {
      id: generateHistoryId(),
      date: new Date().toISOString(),
      settings: { ...gameState.settings },
      winner,
      scores: { ...gameState.scores },
      teamAPlayers: gameState.players.filter((p) => p.team === 'A').map((p) => p.nickname),
      teamBPlayers: gameState.players.filter((p) => p.team === 'B').map((p) => p.nickname),
      playerStats,
      rounds: gameState.round,
      totalCorrect,
      totalTabu,
      totalPassed: 0,
    };

    const updated = [entry, ...history];
    saveMutation.mutate(updated);
    console.log('[GameHistory] Saved game:', entry.id);
    return entry;
  }, [history, saveMutation]);

  const clearHistory = useCallback(() => {
    saveMutation.mutate([]);
  }, [saveMutation]);

  const allTimeStats = useMemo(() => {
    const playerMap = new Map<string, {
      nickname: string;
      gamesPlayed: number;
      totalDescribed: number;
      totalCorrect: number;
      totalTabu: number;
      totalPassed: number;
      totalScore: number;
      wins: number;
    }>();

    const teamStats = { A: { wins: 0, totalScore: 0 }, B: { wins: 0, totalScore: 0 } };

    for (const game of history) {
      if (game.winner === 'A') teamStats.A.wins++;
      if (game.winner === 'B') teamStats.B.wins++;
      teamStats.A.totalScore += game.scores.A;
      teamStats.B.totalScore += game.scores.B;

      for (const ps of game.playerStats) {
        const existing = playerMap.get(ps.nickname) ?? {
          nickname: ps.nickname,
          gamesPlayed: 0,
          totalDescribed: 0,
          totalCorrect: 0,
          totalTabu: 0,
          totalPassed: 0,
          totalScore: 0,
          wins: 0,
        };
        existing.gamesPlayed++;
        existing.totalDescribed += ps.wordsDescribed;
        existing.totalCorrect += ps.correctGuesses;
        existing.totalTabu += ps.tabuCatches;
        existing.totalPassed += ps.passed;
        existing.totalScore += ps.score;
        if (game.winner === ps.team) existing.wins++;
        playerMap.set(ps.nickname, existing);
      }
    }

    return {
      totalGames: history.length,
      playerLeaderboard: Array.from(playerMap.values()).sort((a, b) => b.totalScore - a.totalScore),
      teamStats,
    };
  }, [history]);

  return {
    history,
    isLoading: historyQuery.isLoading,
    saveGame,
    clearHistory,
    allTimeStats,
  };
});
