export type VoiceSpeed = 'slow' | 'normal' | 'fast';

export type SpeechSettings = {
  muted: boolean;
  speed?: VoiceSpeed;
  voiceSpeed?: VoiceSpeed;
};

const speedRate: Record<VoiceSpeed, number> = {
  slow: 0.75,
  normal: 0.95,
  fast: 1.15,
};

export const speakPrompt = (text: string, settings: SpeechSettings): void => {
  if (settings.muted || typeof window === 'undefined' || !window.speechSynthesis) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.pitch = 1.08;
  utterance.rate = speedRate[settings.speed ?? settings.voiceSpeed ?? 'normal'];
  window.speechSynthesis.speak(utterance);
};
