import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { WordCategoryName } from '../data/wordCategories';
import { WORD_CATEGORIES } from '../data/wordCategories';
import { getWorld } from '../data/worlds';
import type { WorldId } from '../data/worlds';
import { createInitialRunnerState, runnerReducer } from '../game/runnerEngine';
import type { GameConfig, GameSettings, RunStats } from '../game/types';
import { useResponsiveGameSize } from '../hooks/useResponsiveGameSize';
import { playSound } from '../utils/audio';
import { createSpeechRecognizer, isSpeechRecognitionAvailable } from '../utils/speechRecognition';
import { speakPrompt } from '../utils/speechSynthesis';
import { isCloseWordMatch } from '../utils/wordMatching';

type GameSceneProps = {
  worldId: WorldId;
  categories: WordCategoryName[];
  bestStreak: number;
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onComplete: (stats: RunStats) => void;
  onExit: () => void;
};

const laneLeft = (lane: number): string => `${26 + lane * 24}%`;

const flattenWords = (categories: WordCategoryName[]): string[] =>
  categories.flatMap((category) => [...WORD_CATEGORIES[category]]);

export function GameScene({
  worldId,
  categories,
  bestStreak,
  settings,
  onSettingsChange,
  onComplete,
  onExit,
}: GameSceneProps) {
  const world = getWorld(worldId);
  const size = useResponsiveGameSize();
  const [state, dispatch] = useReducer(runnerReducer, bestStreak, createInitialRunnerState);
  const [paused, setPaused] = useState(false);
  const [speechStatus, setSpeechStatus] = useState('');
  const [lastTranscript, setLastTranscript] = useState('');
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const completedRef = useRef(false);

  const config = useMemo<GameConfig>(
    () => ({
      worldId,
      categories,
      words: flattenWords(categories),
      bestStreak,
    }),
    [bestStreak, categories, worldId],
  );

  const move = useCallback((direction: -1 | 1) => {
    dispatch({ type: 'move', direction });
  }, []);

  const jump = useCallback(() => {
    dispatch({ type: 'jump', now: performance.now() });
    playSound('jump', settings.muted);
  }, [settings.muted]);

  useEffect(() => {
    speakPrompt(world.introPrompt, settings);
  }, [settings, world.introPrompt]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPaused((value) => !value);
      if (state.challenge || paused) return;
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') move(-1);
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') move(1);
      if (event.key === ' ' || event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') {
        event.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [jump, move, paused, state.challenge]);

  useEffect(() => {
    const loop = (time: number) => {
      const delta = Math.min(0.04, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;
      if (!paused) {
        dispatch({ type: 'tick', delta, now: time, config });
      }
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [config, paused]);

  useEffect(() => {
    if (state.feedback === 'collect') playSound('collect', settings.muted);
    if (state.feedback === 'bump') playSound('error', settings.muted);
    if (state.feedback === 'correct') playSound('success', settings.muted);
    if (state.feedback === 'complete') playSound('complete', settings.muted);

    if (state.feedback !== 'none') {
      const timeout = window.setTimeout(() => dispatch({ type: 'clearFeedback' }), 480);
      return () => window.clearTimeout(timeout);
    }

    return undefined;
  }, [settings.muted, state.feedback]);

  useEffect(() => {
    if (!state.challenge) return;
    speakPrompt(`Find the word ${state.challenge.targetWord}. Say the word ${state.challenge.targetWord}.`, settings);
  }, [settings, state.challenge]);

  useEffect(() => {
    if (state.complete && !completedRef.current) {
      completedRef.current = true;
      onComplete(state.stats);
    }
  }, [onComplete, state.complete, state.stats]);

  const startListening = () => {
    if (!state.challenge) return;

    if (!isSpeechRecognitionAvailable()) {
      setSpeechStatus('Speech recognition is not available on this browser.');
      return;
    }

    const recognizer = createSpeechRecognizer(
      (transcript) => {
        setLastTranscript(transcript);
        if (state.challenge && isCloseWordMatch(transcript, state.challenge.targetWord)) {
          speakPrompt('Great job!', settings);
          dispatch({ type: 'resolveWord', correct: true });
        } else {
          speakPrompt('Try again.', settings);
          setSpeechStatus('Try again. You can press Try again or I said it.');
        }
      },
      setSpeechStatus,
    );
    recognizer?.start();
  };

  const handleTouchEnd = (clientX: number, clientY: number) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || state.challenge || paused) return;
    const dx = clientX - start.x;
    const dy = clientY - start.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 28) move(dx > 0 ? 1 : -1);
    if (dy < -26) jump();
  };

  const progressPercent = Math.round((1 - state.timeLeft / 72) * 100);
  const playerJumping = performance.now() < state.jumpUntil;

  return (
    <main
      className={`game-scene ${state.feedback}`}
      style={{
        '--sky': world.palette.sky,
        '--horizon': world.palette.horizon,
        '--road': world.palette.road,
        '--lane': world.palette.lane,
        '--accent': world.palette.accent,
        '--accent-2': world.palette.accent2,
        '--danger': world.palette.danger,
        '--panel': world.palette.panel,
      } as CSSProperties}
      onTouchStart={(event) => {
        const touch = event.touches[0];
        touchStart.current = { x: touch.clientX, y: touch.clientY };
      }}
      onTouchEnd={(event) => {
        const touch = event.changedTouches[0];
        handleTouchEnd(touch.clientX, touch.clientY);
      }}
    >
      {size.isNarrow && <div className="rotate-hint">Rotate your device for best play.</div>}

      <div className="sky-layer">
        <div className="sun" />
        <div className="pyramids">{world.scenery.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div>
      </div>

      <section className="hud" aria-label="Run status">
        <div className="brand-chip">Word Rush</div>
        <div>Score {state.stats.score}</div>
        <div>Streak {state.stats.streak}</div>
        <div>Coins {state.stats.coins}</div>
        <div>{categories.join(' + ')}</div>
        <button type="button" aria-label="Pause" onClick={() => setPaused(true)}>II</button>
        <button
          type="button"
          aria-label={settings.muted ? 'Unmute' : 'Mute'}
          onClick={() => onSettingsChange({ ...settings, muted: !settings.muted })}
        >
          {settings.muted ? 'Sound off' : 'Sound on'}
        </button>
      </section>

      <div className="progress-rail"><span style={{ width: `${progressPercent}%` }} /></div>

      <section className="runner-stage" aria-label={`${world.name} runner play area`}>
        <div className="speed-lines" />
        <div className="road">
          {[0, 1, 2].map((lane) => <div className="lane-line" key={lane} />)}
          {state.entities.map((entity) => (
            <div
              className={`entity ${entity.kind}`}
              key={entity.id}
              style={{ left: laneLeft(entity.lane), top: `${entity.y}%` }}
            >
              <span>{entity.kind === 'word' ? entity.label : entity.kind === 'collectible' ? '✦' : '!'}</span>
              <small>
                {entity.kind === 'word'
                  ? world.wordObjects[entity.id % world.wordObjects.length]
                  : entity.kind === 'collectible'
                    ? world.collectibles[entity.id % world.collectibles.length]
                    : world.obstacles[entity.id % world.obstacles.length]}
              </small>
            </div>
          ))}
          <div
            className={`runner ${playerJumping ? 'jumping' : ''}`}
            style={{ left: laneLeft(state.playerLane) }}
            aria-label="Runner"
          >
            <span className="runner-head" />
            <span className="runner-body" />
            <span className="runner-scarf" />
          </div>
        </div>
      </section>

      <section className="touch-controls" aria-label="Touch controls">
        <button type="button" onClick={() => move(-1)} aria-label="Move left">Left</button>
        <button type="button" onClick={jump} aria-label="Jump">Jump</button>
        <button type="button" onClick={() => move(1)} aria-label="Move right">Right</button>
      </section>

      {state.challenge && (
        <section className="challenge-overlay" role="dialog" aria-modal="true" aria-label="Read the word">
          <div className="challenge-card">
            <p className="challenge-kicker">{state.challenge.message}</p>
            <h2>{state.challenge.targetWord}</h2>
            <p>{speechStatus || 'Press the microphone and read the word aloud.'}</p>
            {lastTranscript && <p className="transcript">Heard: {lastTranscript}</p>}
            <div className="challenge-actions">
              <button type="button" onClick={startListening}>Microphone</button>
              <button type="button" onClick={() => speakPrompt(`Say the word ${state.challenge?.targetWord}.`, settings)}>Replay</button>
              <button type="button" onClick={() => dispatch({ type: 'resolveWord', correct: true })}>I said it</button>
              <button type="button" onClick={startListening}>Try again</button>
              <button type="button" onClick={() => dispatch({ type: 'resolveWord', correct: false, skipped: true })}>Skip word</button>
            </div>
          </div>
        </section>
      )}

      {paused && (
        <section className="pause-overlay" role="dialog" aria-modal="true" aria-label="Paused">
          <div className="menu-card compact">
            <h2>Paused</h2>
            <label>
              Voice speed
              <select
                value={settings.voiceSpeed}
                onChange={(event) =>
                  onSettingsChange({ ...settings, voiceSpeed: event.target.value as GameSettings['voiceSpeed'] })
                }
              >
                <option value="slow">slow</option>
                <option value="normal">normal</option>
                <option value="fast">fast</option>
              </select>
            </label>
            <button type="button" onClick={() => setPaused(false)}>Resume</button>
            <button type="button" onClick={onExit}>Exit run</button>
          </div>
        </section>
      )}
    </main>
  );
}
