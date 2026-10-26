import { useState, useEffect, useRef, useCallback } from "react";

// Web Speech API interface definitions
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface UseSpeechRecognitionOptions {
  language?: "ta-IN" | "en-IN";
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string) => void;
  onEnd?: () => void;
}

export const useSpeechRecognition = (options: UseSpeechRecognitionOptions = {}) => {
  const {
    language = "en-IN",
    continuous = false,
    interimResults = true,
    onResult,
    onEnd,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isSupported = typeof window !== "undefined" && !!((window as IWindow).SpeechRecognition || (window as IWindow).webkitSpeechRecognition);

  useEffect(() => {
    if (!isSupported) return;

    const win = window as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();

    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let currentFinal = "";
      let currentInterim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          currentFinal += item[0].transcript;
        } else {
          currentInterim += item[0].transcript;
        }
      }

      if (currentFinal) {
        setTranscript((prev) => {
          const updated = prev ? `${prev} ${currentFinal.trim()}` : currentFinal.trim();
          if (onResult) onResult(updated);
          return updated;
        });
      }
      setInterimTranscript(currentInterim);
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      if (event.error === "no-speech") {
        setError("No speech detected. Please speak closer to the microphone.");
      } else if (event.error === "not-allowed") {
        setError("Microphone permission denied. Please allow microphone access in your browser.");
      } else {
        setError(`Speech error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
      if (onEnd) onEnd();
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isSupported, language, continuous, interimResults, onResult, onEnd]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }
    setError(null);
    setTranscript("");
    setInterimTranscript("");
    try {
      recognitionRef.current?.start();
    } catch (e) {
      // Already started
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
  };
};
