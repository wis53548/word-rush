import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { GameScene } from './components/GameScene';
import { WORD_CATEGORIES } from './data/wordCategories';
import type { WordCategoryName } from './data/wordCategories';
import { WORLDS } from './data/worlds';
import type { WorldId } from './data/worlds';
import type { GameSettings, RunStats } from './game/types';
import { calculateRank, defaultProgress, loadProgress, saveProgress } from './utils/progress';
import type { SavedProgress } from './utils/progress';
import { speakPrompt } from './utils/speechSynthesis';

type Screen = 'loading' | 'start' | 'categories' | 'worlds' | 'instructions' | 'play' | 'complete' | 'progress';

const categoryNames = Object.keys(WORD_CATEGORIES) as WordCategoryName[];

const formatAccuracy = (correct: number, attempted: number): string =>
  attempted === 0 ? '0%' : `${Math.round((correct / attempted) * 100)}%`;

function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [progress, setProgress] = useState<SavedProgress>(defaultProgress);
  const [selectedCategories, setSelectedCategories] = useState<WordCategoryName[]>(['CVC']);
  const [selectedWorld, setSelectedWorld] = useState<WorldId>('egypt');
  const [settings, setSettings] = useState<GameSettings>({ muted: false, voiceSpeed: 'normal' });
  const [lastRun, setLastRun] = useState<RunStats | null>(null);

  useEffect(() => {
    const loaded = loadProgress();
    setProgress(loaded);
    setSelectedCategories(loaded.selectedCategories.length ? loaded.selectedCategories : ['CVC']);
    setSelectedWorld(loaded.selectedWorld);
    const timeout = window.setTimeout(() => setScreen('start'), 850);
    return () => window.clearTimeout(timeout);
  }, []);

  const selectedWordCount = useMemo(
    () => selectedCategories.reduce((total, category) => total + WORD_CATEGORIES[category].length, 0),
    [selectedCategories],
  );

  const toggleCategory = (category: WordCategoryName) => {
    setSelectedCategories((current) => {
      if (current.includes(category)) {
        return current.length === 1 ? current : current.filter((item) => item !== category);
      }
      return [...current, category];
    });
  };

  const persistSelections = (nextScreen: Screen) => {
    const nextProgress = {
      ...progress,
      selectedCategories,
      selectedWorld,
    };
    setProgress(nextProgress);
    saveProgress(nextProgress);
    setScreen(nextScreen);
  };

  const finishRun = (stats: RunStats) => {
    const merged: SavedProgress = {
      ...progress,
      score: progress.score + stats.score,
      coins: progress.coins + stats.coins,
      bestStreak: Math.max(progress.bestStreak, stats.bestStreak),
      wordsAttempted: progress.wordsAttempted + stats.wordsAttempted,
      wordsCorrect: progress.wordsCorrect + stats.wordsCorrect,
      missedWords: [...stats.missedWords, ...progress.missedWords].slice(0, 18),
      selectedWorld,
      selectedCategories,
      rank: calculateRank(progress.score + stats.score, progress.wordsCorrect + stats.wordsCorrect),
    };
    setLastRun(stats);
    setProgress(merged);
    saveProgress(merged);
    setScreen('complete');
  };

  if (screen === 'loading') {
    return (
      <main className="loading-screen">
        <div className="loading-orbit" />
        <h1>Word Rush</h1>
        <p>Opening the word gates...</p>
      </main>
    );
  }

  if (screen === 'play') {
    return (
      <GameScene
        worldId={selectedWorld}
        categories={selectedCategories}
        bestStreak={progress.bestStreak}
        settings={settings}
        onSettingsChange={setSettings}
        onComplete={finishRun}
        onExit={() => setScreen('start')}
      />
    );
  }

  return (
    <main className="app-shell">
      <section className="arcade-backdrop" aria-hidden="true">
        <span />
        <span />
        <span />
      </section>

      <nav className="top-nav" aria-label="Main navigation">
        <button type="button" onClick={() => setScreen('start')}>Home</button>
        <button type="button" onClick={() => setScreen('categories')}>Words</button>
        <button type="button" onClick={() => setScreen('worlds')}>Worlds</button>
        <button type="button" onClick={() => setScreen('progress')}>Progress</button>
        <button
          type="button"
          onClick={() => setSettings((current) => ({ ...current, muted: !current.muted }))}
        >
          {settings.muted ? 'Sound off' : 'Sound on'}
        </button>
      </nav>

      {screen === 'start' && (
        <section className="start-layout">
          <div className="hero-copy">
            <h1>Word Rush</h1>
            <p>
              Race through wild history worlds, dodge hazards, grab coins, and read the lost words
              aloud to blast open the gates.
            </p>
            <div className="hero-actions">
              <button type="button" className="primary-button" onClick={() => setScreen('categories')}>
                Start run
              </button>
              <button type="button" onClick={() => setScreen('instructions')}>Instructions</button>
            </div>
          </div>
          <div className="arcade-preview" aria-label="Ancient Egypt runner preview">
            <div className="preview-sun" />
            <div className="preview-pyramids" />
            <div className="preview-road">
              <span className="preview-runner" />
              <span className="preview-tablet">cat</span>
              <span className="preview-coin" />
              <span className="preview-trap" />
            </div>
          </div>
        </section>
      )}

      {screen === 'categories' && (
        <section className="panel-screen">
          <div className="screen-heading">
            <h1>Choose Word Power</h1>
            <p>{selectedWordCount} words ready from {selectedCategories.length} selected categories.</p>
          </div>
          <div className="category-grid">
            {categoryNames.map((category) => (
              <button
                type="button"
                className={selectedCategories.includes(category) ? 'selected' : ''}
                key={category}
                onClick={() => toggleCategory(category)}
              >
                <strong>{category}</strong>
                <span>{WORD_CATEGORIES[category].length} words</span>
              </button>
            ))}
          </div>
          <div className="sticky-actions">
            <button type="button" onClick={() => persistSelections('worlds')} className="primary-button">
              Pick a world
            </button>
          </div>
        </section>
      )}

      {screen === 'worlds' && (
        <section className="panel-screen">
          <div className="screen-heading">
            <h1>Select World</h1>
            <p>Ancient Egypt is the polished MVP world. Every world is already playable as a theme.</p>
          </div>
          <div className="world-grid">
            {WORLDS.map((world) => (
              <button
                type="button"
                className={selectedWorld === world.id ? 'world-card selected' : 'world-card'}
                key={world.id}
                style={{ '--accent': world.palette.accent, '--accent-2': world.palette.accent2 } as CSSProperties}
                onClick={() => {
                  setSelectedWorld(world.id);
                  speakPrompt(world.introPrompt, settings);
                }}
              >
                <span>{world.status}</span>
                <strong>{world.name}</strong>
                <small>{world.wordObjects.slice(0, 2).join(' + ')}</small>
              </button>
            ))}
          </div>
          <div className="sticky-actions">
            <button type="button" onClick={() => persistSelections('instructions')} className="primary-button">
              Continue
            </button>
          </div>
        </section>
      )}

      {screen === 'instructions' && (
        <section className="panel-screen instructions">
          <div className="screen-heading">
            <h1>Runner Controls</h1>
            <p>Move fast, stay loose, and read the gate word when the run pauses.</p>
          </div>
          <div className="instruction-grid">
            <article><strong>Desktop</strong><span>ArrowLeft / A, ArrowRight / D, Space / ArrowUp / W</span></article>
            <article><strong>Mobile</strong><span>Swipe left or right, swipe up, or use the on-screen buttons.</span></article>
            <article><strong>Reading</strong><span>Press Microphone, read the word aloud, then keep running.</span></article>
            <article><strong>Fallback</strong><span>If speech is unavailable, use I said it, Try again, or Skip word.</span></article>
          </div>
          <label className="speed-setting">
            Voice speed
            <select
              value={settings.voiceSpeed}
              onChange={(event) => setSettings({ ...settings, voiceSpeed: event.target.value as GameSettings['voiceSpeed'] })}
            >
              <option value="slow">slow</option>
              <option value="normal">normal</option>
              <option value="fast">fast</option>
            </select>
          </label>
          <button type="button" className="primary-button" onClick={() => setScreen('play')}>Start adventure</button>
        </section>
      )}

      {screen === 'complete' && lastRun && (
        <section className="panel-screen complete-screen">
          <div className="level-complete-burst" />
          <h1>Run Complete!</h1>
          <div className="summary-grid">
            <article><span>Score</span><strong>{lastRun.score}</strong></article>
            <article><span>Coins</span><strong>{lastRun.coins}</strong></article>
            <article><span>Words</span><strong>{lastRun.wordsCorrect}/{lastRun.wordsAttempted}</strong></article>
            <article><span>Best streak</span><strong>{lastRun.bestStreak}</strong></article>
          </div>
          <p>Accuracy: {formatAccuracy(lastRun.wordsCorrect, lastRun.wordsAttempted)}</p>
          <div className="hero-actions">
            <button type="button" className="primary-button" onClick={() => setScreen('play')}>Run again</button>
            <button type="button" onClick={() => setScreen('progress')}>Progress</button>
          </div>
        </section>
      )}

      {screen === 'progress' && (
        <section className="panel-screen progress-screen">
          <div className="screen-heading">
            <h1>Reader Progress</h1>
            <p>{progress.rank}</p>
          </div>
          <div className="summary-grid">
            <article><span>Total score</span><strong>{progress.score}</strong></article>
            <article><span>Coins</span><strong>{progress.coins}</strong></article>
            <article><span>Best streak</span><strong>{progress.bestStreak}</strong></article>
            <article><span>Accuracy</span><strong>{formatAccuracy(progress.wordsCorrect, progress.wordsAttempted)}</strong></article>
          </div>
          <h2>Recent practice words</h2>
          <div className="missed-list">
            {progress.missedWords.length ? progress.missedWords.map((word, index) => <span key={`${word}-${index}`}>{word}</span>) : <span>No missed words yet</span>}
          </div>
          <button type="button" className="primary-button" onClick={() => setScreen('categories')}>New run</button>
        </section>
      )}
    </main>
  );
}

export default App;
