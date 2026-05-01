type SoundName = 'collect' | 'jump' | 'success' | 'error' | 'complete';

const soundMap: Record<SoundName, { frequency: number; duration: number; type: OscillatorType }> = {
  collect: { frequency: 720, duration: 0.08, type: 'triangle' },
  jump: { frequency: 380, duration: 0.1, type: 'sine' },
  success: { frequency: 920, duration: 0.16, type: 'triangle' },
  error: { frequency: 180, duration: 0.14, type: 'sawtooth' },
  complete: { frequency: 660, duration: 0.28, type: 'square' },
};

let audioContext: AudioContext | null = null;

export const playSound = (name: SoundName, muted: boolean): void => {
  if (muted || typeof window === 'undefined') {
    return;
  }

  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) {
    return;
  }

  audioContext ??= new AudioContextConstructor();
  const sound = soundMap[name];
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = sound.type;
  oscillator.frequency.setValueAtTime(sound.frequency, audioContext.currentTime);
  gain.gain.setValueAtTime(0.05, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + sound.duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + sound.duration);
};

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
