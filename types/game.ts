export type AgeGroup = 'cocuk' | 'genc' | 'yetiskin';
export type Difficulty = 'kolay' | 'orta' | 'zor';
export type Team = 'A' | 'B';
export type PlayerRole = 'describer' | 'guesser' | 'controller';

export interface Player {
  id: string;
  nickname: string;
  team: Team;
  score: number;
  correctGuesses: number;
  tabuCatches: number;
  wordsDescribed: number;
}

export interface WordCard {
  id: string;
  word: string;
  forbidden: string[];
  ageGroup: AgeGroup[];
  category?: string;
}

export interface TurnResult {
  describerId: string;
  correct: number;
  tabu: number;
  passed: number;
}

export interface GameSettings {
  targetScore: number;
  turnDuration: number;
  ageGroup: AgeGroup;
  difficulty: Difficulty;
  passLimit: number;
}

export interface GameState {
  players: Player[];
  settings: GameSettings;
  currentTeam: Team;
  currentDescriberIndex: { A: number; B: number };
  scores: { A: number; B: number };
  usedCardIds: string[];
  turnResults: TurnResult[];
  isGameOver: boolean;
  round: number;
}

export const FORBIDDEN_COUNT: Record<Difficulty, number> = {
  kolay: 4,
  orta: 5,
  zor: 6,
};

export interface PlayerGameStats {
  playerId: string;
  nickname: string;
  team: Team;
  wordsDescribed: number;
  correctGuesses: number;
  tabuCatches: number;
  passed: number;
  score: number;
}

export interface GameHistoryEntry {
  id: string;
  date: string;
  settings: GameSettings;
  winner: Team | null;
  scores: { A: number; B: number };
  teamAPlayers: string[];
  teamBPlayers: string[];
  playerStats: PlayerGameStats[];
  rounds: number;
  totalCorrect: number;
  totalTabu: number;
  totalPassed: number;
}
