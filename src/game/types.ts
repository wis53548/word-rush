import type { WordCategoryName } from '../data/wordCategories';
import type { WorldId } from '../data/worlds';

export type Lane = 0 | 1 | 2;
export type EntityKind = 'collectible' | 'obstacle' | 'word';

export type GameEntity = {
  id: number;
  kind: EntityKind;
  lane: Lane;
  y: number;
  label: string;
  word?: string;
  hit: boolean;
};

export type RunStats = {
  score: number;
  coins: number;
  streak: number;
  bestStreak: number;
  wordsAttempted: number;
  wordsCorrect: number;
  missedWords: string[];
};

export type ChallengeState = {
  entityId: number;
  targetWord: string;
  status: 'prompt' | 'listening' | 'correct' | 'retry' | 'skipped';
  transcript: string;
  message: string;
};

export type GameSettings = {
  muted: boolean;
  voiceSpeed: 'slow' | 'normal' | 'fast';
};

export type GameConfig = {
  worldId: WorldId;
  categories: WordCategoryName[];
  words: string[];
  bestStreak: number;
};

export type RunnerState = {
  playerLane: Lane;
  targetLane: Lane;
  jumpUntil: number;
  speed: number;
  distance: number;
  timeLeft: number;
  entities: GameEntity[];
  nextEntityId: number;
  nextSpawnAt: number;
  stats: RunStats;
  challenge: ChallengeState | null;
  complete: boolean;
  feedback: 'none' | 'collect' | 'bump' | 'correct' | 'complete';
};

export type RunnerAction =
  | { type: 'move'; direction: -1 | 1 }
  | { type: 'jump'; now: number }
  | { type: 'tick'; delta: number; now: number; config: GameConfig }
  | { type: 'resolveWord'; correct: boolean; skipped?: boolean }
  | { type: 'clearFeedback' };
