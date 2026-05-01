import type { GameConfig, GameEntity, Lane, RunnerAction, RunnerState } from './types';

const RUN_SECONDS = 72;
const LANES: Lane[] = [0, 1, 2];
const CHALLENGE_ZONE = 82;
const COLLISION_ZONE = 86;

const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

const createEntity = (state: RunnerState, config: GameConfig): GameEntity => {
  const roll = Math.random();
  const kind = roll > 0.72 ? 'word' : roll > 0.42 ? 'collectible' : 'obstacle';
  const word = pick(config.words);
  const lane = pick(LANES);

  if (kind === 'word') {
    return {
      id: state.nextEntityId,
      kind,
      lane,
      y: -16,
      label: word,
      word,
      hit: false,
    };
  }

  return {
    id: state.nextEntityId,
    kind,
    lane,
    y: -18,
    label: kind === 'collectible' ? 'coin' : 'trap',
    hit: false,
  };
};

export const createInitialRunnerState = (bestStreak: number): RunnerState => ({
  playerLane: 1,
  targetLane: 1,
  jumpUntil: 0,
  speed: 22,
  distance: 0,
  timeLeft: RUN_SECONDS,
  entities: [],
  nextEntityId: 1,
  nextSpawnAt: 0.7,
  stats: {
    score: 0,
    coins: 0,
    streak: 0,
    bestStreak,
    wordsAttempted: 0,
    wordsCorrect: 0,
    missedWords: [],
  },
  challenge: null,
  complete: false,
  feedback: 'none',
});

export const runnerReducer = (state: RunnerState, action: RunnerAction): RunnerState => {
  if (action.type === 'move') {
    const nextLane = Math.max(0, Math.min(2, state.targetLane + action.direction)) as Lane;
    return { ...state, targetLane: nextLane, playerLane: nextLane };
  }

  if (action.type === 'jump') {
    return { ...state, jumpUntil: action.now + 560, feedback: 'none' };
  }

  if (action.type === 'resolveWord') {
    const challenge = state.challenge;
    if (!challenge) return state;

    const nextStats = { ...state.stats, wordsAttempted: state.stats.wordsAttempted + 1 };
    let feedback: RunnerState['feedback'] = 'bump';

    if (action.correct) {
      nextStats.wordsCorrect += 1;
      nextStats.streak += 1;
      nextStats.bestStreak = Math.max(nextStats.bestStreak, nextStats.streak);
      nextStats.score += 500 + nextStats.streak * 80;
      nextStats.coins += 3;
      feedback = 'correct';
    } else {
      nextStats.streak = 0;
      if (!action.skipped) {
        nextStats.missedWords = [...nextStats.missedWords, challenge.targetWord].slice(-12);
      }
    }

    return {
      ...state,
      challenge: null,
      stats: nextStats,
      entities: state.entities.filter((entity) => entity.id !== challenge.entityId),
      feedback,
    };
  }

  if (action.type === 'clearFeedback') {
    return { ...state, feedback: 'none' };
  }

  if (action.type === 'tick') {
    if (state.complete || state.challenge) return state;

    const speed = Math.min(43, state.speed + action.delta * 0.55);
    const timeLeft = Math.max(0, state.timeLeft - action.delta);
    const distance = state.distance + speed * action.delta;
    const movedEntities = state.entities
      .map((entity) => ({ ...entity, y: entity.y + speed * action.delta }))
      .filter((entity) => entity.y < 118 && !entity.hit);

    let nextState: RunnerState = {
      ...state,
      speed,
      distance,
      timeLeft,
      entities: movedEntities,
      feedback: state.feedback === 'complete' ? 'complete' : 'none',
    };

    if (timeLeft <= 0) {
      return { ...nextState, complete: true, feedback: 'complete' };
    }

    if (distance >= state.nextSpawnAt * 30) {
      const entity = createEntity(nextState, action.config);
      nextState = {
        ...nextState,
        nextEntityId: nextState.nextEntityId + 1,
        nextSpawnAt: state.nextSpawnAt + 1.15 + Math.random() * 0.95,
        entities: [...nextState.entities, entity],
      };
    }

    const activeEntity = nextState.entities.find(
      (entity) =>
        !entity.hit &&
        entity.lane === nextState.playerLane &&
        entity.y >= COLLISION_ZONE - 4 &&
        entity.y <= COLLISION_ZONE + 5,
    );

    if (!activeEntity) return nextState;

    if (activeEntity.kind === 'collectible') {
      return {
        ...nextState,
        stats: {
          ...nextState.stats,
          score: nextState.stats.score + 80,
          coins: nextState.stats.coins + 1,
        },
        entities: nextState.entities.filter((entity) => entity.id !== activeEntity.id),
        feedback: 'collect',
      };
    }

    if (activeEntity.kind === 'obstacle') {
      const jumping = action.now < nextState.jumpUntil;
      return {
        ...nextState,
        stats: {
          ...nextState.stats,
          score: Math.max(0, nextState.stats.score - (jumping ? 0 : 90)),
          streak: jumping ? nextState.stats.streak : 0,
        },
        entities: nextState.entities.filter((entity) => entity.id !== activeEntity.id),
        feedback: jumping ? 'collect' : 'bump',
      };
    }

    if (activeEntity.kind === 'word' && activeEntity.y >= CHALLENGE_ZONE) {
      return {
        ...nextState,
        challenge: {
          entityId: activeEntity.id,
          targetWord: activeEntity.word ?? activeEntity.label,
          status: 'prompt',
          transcript: '',
          message: `Say the word ${activeEntity.word ?? activeEntity.label}.`,
        },
      };
    }

    return nextState;
  }

  return state;
};
