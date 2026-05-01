# Word Rush

Word Rush is a browser-based educational reading runner for kids. Players race through themed worlds, collect rewards, dodge hazards, and read word challenges aloud with the browser Web Speech API.

## Setup

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open the local Vite URL shown in the terminal.

## Build

```bash
npm run build
```

## Browser Support Notes

- Gameplay, keyboard controls, touch controls, text-to-speech, sounds, and local progress use built-in browser capabilities.
- Speech recognition uses `SpeechRecognition` / `webkitSpeechRecognition`. If it is unavailable, Word Rush shows: “Speech recognition is not available on this browser.” The word challenge still works with `I said it`, `Try again`, and `Skip word`.
- Saved progress uses `localStorage` only. There are no accounts, paid APIs, uploads, databases, ads, or tracking.

## Editing Word Categories

Word lists live in `src/data/wordCategories.ts`. Add or change categories by editing the exported `WORD_CATEGORIES` object. The category selection screen reads that data automatically.

World theme data lives in `src/data/worlds.ts`. Ancient Egypt is the polished MVP world; the other worlds are playable visual variants ready for expansion.

## Controls

- Desktop: `ArrowLeft` / `A`, `ArrowRight` / `D`, `Space` / `ArrowUp` / `W`
- Mobile: swipe left, swipe right, swipe up, or use the on-screen buttons
- `Escape`: pause

## Future Upgrade Ideas

- Parent dashboard
- Teacher dashboard
- Custom word import
- Progress history
- Offline PWA mode
- Character customization
- Boss battles
- More advanced worlds
- Richer animations
- Advanced pronunciation scoring
