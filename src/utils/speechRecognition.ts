type SpeechRecognitionResultHandler = (transcript: string) => void;
type SpeechRecognitionStatusHandler = (message: string) => void;

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onresult:
    | ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void)
    | null;
};

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export const isSpeechRecognitionAvailable = (): boolean =>
  typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

export const createSpeechRecognizer = (
  onResult: SpeechRecognitionResultHandler,
  onStatus: SpeechRecognitionStatusHandler,
) => {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!Recognition) {
    onStatus('Speech recognition is not available on this browser.');
    return null;
  }

  const recognition = new Recognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => onStatus('Listening...');
  recognition.onend = () => onStatus('Tap the microphone to try again.');
  recognition.onerror = (event) => {
    onStatus(event.error ? `Listening stopped: ${event.error}` : 'Listening stopped.');
  };
  recognition.onresult = (event) => {
    const transcript = event.results[0]?.[0]?.transcript ?? '';
    onResult(transcript);
  };

  return recognition;
};
