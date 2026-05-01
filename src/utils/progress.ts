import type { WordCategoryName } from '../data/wordCategories';
import type { WorldId } from '../data/worlds';

export type Rank =
  | 'Rookie Reader'
  | 'Word Explorer'
  | 'Time Trek Reader'
  | 'Word Warrior'
  | 'Word Rush Legend';

export type SavedProgress = {
  score: number;
  coins: number;
  bestStreak: number;
  wordsAttempted: number;
  wordsCorrect: number;
  missedWords: string[];
  selectedWorld: WorldId;
  selectedCategories: WordCategoryName[];
  rank: Rank;
};

const STORAGE_KEY = 'word-rush-progress-v1';

export const calculateRank = (score: number, correctWords: number): Rank => {
  if (score >= 12000 || correctWords >= 120) return 'Word Rush Legend';
  if (score >= 7000 || correctWords >= 70) return 'Word Warrior';
  if (score >= 3500 || correctWords >= 35) return 'Time Trek Reader';
  if (score >= 1200 || correctWords >= 12) return 'Word Explorer';
  return 'Rookie Reader';
};

export const defaultProgress: SavedProgress = {
  score: 0,
  coins: 0,
  bestStreak: 0,
  wordsAttempted: 0,
  wordsCorrect: 0,
  missedWords: [],
  selectedWorld: 'egypt',
  selectedCategories: ['CVC'],
  rank: 'Rookie Reader',
};

export const loadProgress = (): SavedProgress => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
    return { ...defaultProgress, ...JSON.parse(raw) } as SavedProgress;
  } catch {
    return defaultProgress;
  }
};

export const saveProgress = (progress: SavedProgress): void => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...progress, rank: calculateRank(progress.score, progress.wordsCorrect) }),
  );
};
