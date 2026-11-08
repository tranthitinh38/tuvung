// Web Speech Synthesis and Web Speech Recognition utilities

export function speakText(text: string, rate: number = 0.9): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      resolve();
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate; // 0.9 is natural for learners, 0.75 is slow
    utterance.pitch = 1.0;

    // Try finding a nice English voice
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (enVoice) {
      utterance.voice = enVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}

// Pronunciation recognition wrapper
export interface RecognitionResult {
  transcript: string;
  confidence: number;
}

export function createSpeechRecognizer(
  onResult: (res: RecognitionResult) => void,
  onError: (err: string) => void,
  onEnd: () => void
) {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;
  recognition.continuous = false;

  recognition.onresult = (event: any) => {
    if (event.results && event.results.length > 0) {
      const topResult = event.results[0][0];
      onResult({
        transcript: topResult.transcript,
        confidence: topResult.confidence || 0.85,
      });
    }
  };

  recognition.onerror = (event: any) => {
    onError(event.error || 'Lỗi nhận diện giọng nói');
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
}
