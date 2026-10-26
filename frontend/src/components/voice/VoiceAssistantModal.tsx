import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "../../hooks/useSpeechSynthesis";
import { aiService, type ChatResponse } from "../../services/aiService";
import { cleanSpeechAndText } from "../../utils/textCleaner";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  Sparkles,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmId?: number | null;
  onOpenFullChat?: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  farmId,
  onOpenFullChat,
}) => {
  const [voiceLang, setVoiceLang] = useState<"ta" | "en">("en");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis();

  const handleSpeechResult = async (finalTranscript: string) => {
    if (!finalTranscript.trim() || isProcessing) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setAiResponse(null);

    try {
      const res = await aiService.sendMessage({
        message: finalTranscript.trim(),
        farm_id: farmId,
        language: voiceLang,
      });

      const replyText = cleanSpeechAndText(res.message.content);
      setAiResponse(replyText);

      // Auto speak aloud reply
      speak(replyText, voiceLang);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process voice query.");
    } finally {
      setIsProcessing(false);
    }
  };

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isSTTSupported,
    error: sttError,
  } = useSpeechRecognition({
    language: voiceLang === "ta" ? "ta-IN" : "en-IN",
    onResult: (finalText) => {
      // Auto submit when final recognized
      handleSpeechResult(finalText);
    },
  });

  // Stop everything when closing
  useEffect(() => {
    if (!isOpen) {
      stopListening();
      stopSpeaking();
      resetTranscript();
      setAiResponse(null);
      setErrorMsg(null);
    }
  }, [isOpen, stopListening, stopSpeaking, resetTranscript]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking();
      resetTranscript();
      setAiResponse(null);
      setErrorMsg(null);
      startListening();
    }
  };

  const handleLanguageChange = (lang: "ta" | "en") => {
    setVoiceLang(lang);
    stopListening();
    stopSpeaking();
    resetTranscript();
    setAiResponse(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bilingual Voice Assistant"
      description="Speak naturally in Tamil (தமிழ்) or English to query farm advisories, pests, and weather."
      maxWidth="md"
    >
      <div className="space-y-6 text-center py-2">
        {/* Language Selector */}
        <div className="flex justify-center">
          <div className="inline-flex bg-slate-100 p-1 rounded-2xl border border-agri-border text-xs font-bold">
            <button
              onClick={() => handleLanguageChange("en")}
              className={`px-4 py-2 rounded-xl transition-all ${
                voiceLang === "en"
                  ? "bg-agri-primary text-white shadow-xs"
                  : "text-agri-muted hover:text-agri-text"
              }`}
            >
              English (Indian)
            </button>
            <button
              onClick={() => handleLanguageChange("ta")}
              className={`px-4 py-2 rounded-xl transition-all ${
                voiceLang === "ta"
                  ? "bg-agri-primary text-white shadow-xs"
                  : "text-agri-muted hover:text-agri-text"
              }`}
            >
              தமிழ் (Tamil)
            </button>
          </div>
        </div>

        {/* Large Animated Microphone Visualizer */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="relative">
            {/* Animated Pulses */}
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full bg-red-400/30 animate-ping pointer-events-none" />
                <div className="absolute -inset-3 rounded-full bg-red-400/20 animate-pulse pointer-events-none" />
              </>
            )}

            {isSpeaking && (
              <>
                <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping pointer-events-none" />
                <div className="absolute -inset-3 rounded-full bg-emerald-400/20 animate-pulse pointer-events-none" />
              </>
            )}

            <button
              type="button"
              onClick={handleMicClick}
              disabled={isProcessing}
              className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 ${
                isListening
                  ? "bg-red-500 text-white shadow-red-500/30"
                  : isSpeaking
                  ? "bg-emerald-600 text-white shadow-emerald-600/30"
                  : isProcessing
                  ? "bg-slate-300 text-slate-600 animate-pulse"
                  : "bg-agri-primary text-white shadow-agri-primary/30 hover:bg-agri-primaryDark"
              }`}
            >
              {isListening ? (
                <Mic className="w-10 h-10 animate-bounce" />
              ) : isSpeaking ? (
                <Volume2 className="w-10 h-10 animate-pulse" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>
          </div>

          {/* Current State Text */}
          <div className="space-y-1">
            <span className="font-extrabold text-sm text-agri-text block">
              {isListening
                ? voiceLang === "ta"
                  ? "பேசுங்கள்... கேட்கிறது..."
                  : "Listening to your voice..."
                : isProcessing
                ? voiceLang === "ta"
                  ? "ஆராய்கிறது... காத்திருக்கவும்..."
                  : "Analyzing agronomic data..."
                : isSpeaking
                ? voiceLang === "ta"
                  ? "பதில் பேசுகிறது..."
                  : "Speaking AI answer..."
                : voiceLang === "ta"
                ? "மைக் பட்டனை அழுத்தி பேசவும்"
                : "Tap the microphone to speak"}
            </span>
            <span className="text-xs text-agri-muted block">
              {voiceLang === "ta"
                ? "எடுத்துக்காட்டு: 'தக்காளி பயிரில் பூ உதிர்வதை தடுப்பது எப்படி?'"
                : "e.g., 'What fertilizer should I apply for tomato during flowering?'"}
            </span>
          </div>
        </div>

        {/* Real-time Transcription Box */}
        {(transcript || interimTranscript) && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-left space-y-1">
            <span className="text-[10px] font-bold text-agri-muted uppercase tracking-wider block">
              You Asked:
            </span>
            <p className="text-agri-text font-medium">
              {transcript} <span className="text-slate-400 italic">{interimTranscript}</span>
            </p>
          </div>
        )}

        {/* AI Answer Box */}
        {aiResponse && (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl text-xs text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <Bot className="w-3.5 h-3.5 text-agri-primary" />
                AgriAssist Recommendation:
              </span>
              <button
                onClick={() => (isSpeaking ? stopSpeaking() : speak(aiResponse, voiceLang))}
                className="flex items-center gap-1 text-[11px] font-bold text-agri-primary hover:underline"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" /> Stop Voice
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" /> Read Aloud
                  </>
                )}
              </button>
            </div>
            <p className="text-agri-text leading-relaxed whitespace-pre-wrap">
              {aiResponse}
            </p>
          </div>
        )}

        {(errorMsg || sttError) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg || sttError}</span>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-agri-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              stopSpeaking();
              stopListening();
              resetTranscript();
              setAiResponse(null);
            }}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Reset
          </Button>

          {onOpenFullChat && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onOpenFullChat();
              }}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Open in AI Chat Canvas
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
