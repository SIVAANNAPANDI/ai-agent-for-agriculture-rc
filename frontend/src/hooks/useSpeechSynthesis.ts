import { useState, useEffect, useRef, useCallback } from "react";

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  // Strip markdown symbols for speech synthesis
  const cleanMarkdownForSpeech = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
      .replace(/\*(.*?)\*/g, "$1") // Italic
      .replace(/#{1,6}\s+/g, "") // Headers
      .replace(/`{1,3}(.*?)`{1,3}/g, "$1") // Code
      .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Links
      .replace(/•/g, "") // Bullets
      .replace(/-{3,}/g, "") // Dividers
      .replace(/\n+/g, " ") // Newlines
      .trim();
  };

  const speak = useCallback(
    (text: string, lang: "ta" | "en" = "en") => {
      if (!isSupported || !text.trim()) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const cleanedText = cleanMarkdownForSpeech(text);
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utteranceRef.current = utterance;

      if (lang === "ta") {
        utterance.lang = "ta-IN";
        // Attempt to find a Tamil voice
        const tamilVoice = voices.find(
          (v) => v.lang.includes("ta") || v.name.toLowerCase().includes("tamil")
        );
        if (tamilVoice) utterance.voice = tamilVoice;
      } else {
        utterance.lang = "en-IN";
        // Attempt to find an Indian English or general English voice
        const englishVoice =
          voices.find((v) => v.lang === "en-IN") ||
          voices.find((v) => v.lang.startsWith("en"));
        if (englishVoice) utterance.voice = englishVoice;
      }

      utterance.rate = 0.95; // Slightly slower for agricultural clarity
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, voices]
  );

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    voices,
  };
};
