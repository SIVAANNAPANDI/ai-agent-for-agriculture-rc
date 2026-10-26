import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../contexts/AuthContext";
import { farmService, type Farm } from "../../services/farmService";
import {
  aiService,
  type Message,
  type ConversationSummary,
} from "../../services/aiService";
import { useSpeechSynthesis } from "../../hooks/useSpeechSynthesis";
import { VoiceAssistantModal } from "../../components/voice/VoiceAssistantModal";
import { cleanSpeechAndText } from "../../utils/textCleaner";
import {
  Bot,
  Mic,
  Send,
  Sparkles,
  User,
  ShieldCheck,
  Plus,
  Trash2,
  AlertCircle,
  Wrench,
  Layers,
  CloudSun,
  Sprout,
  CheckCircle2,
  Clock,
  MessageSquare,
  Volume2,
  VolumeX,
} from "lucide-react";

export const AIAgentPage: React.FC = () => {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<"en" | "ta">("en");
  const [isSending, setIsSending] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Load farms and past conversation list
  const loadInitialData = useCallback(async () => {
    try {
      const [farmsList, convsList] = await Promise.all([
        farmService.getFarms(),
        aiService.getConversations(),
      ]);
      setFarms(farmsList);
      if (farmsList.length > 0) setSelectedFarmId(farmsList[0].id);

      setConversations(convsList);
      if (convsList.length > 0) {
        // Load most recent conversation
        setActiveConversationId(convsList[0].id);
        const detail = await aiService.getConversation(convsList[0].id);
        setMessages(detail.messages);
      } else {
        // Default welcoming intro
        setMessages([
          {
            sender: "ai",
            content:
              language === "ta"
                ? `வணக்கம் ${user?.name || "விவசாயி"}! நான் உங்கள் AgriAssist விவசாய நுண்ணறிவு உதவியாளர். பயிர் சாகுபடி, மண் பரிசோதனை, பூச்சி கட்டுப்பாடு, வானிலை மற்றும் பண்ணை மேலாண்மை சார்ந்த உங்கள் கேள்விகளை கேளுங்கள்.`
                : `Hello ${user?.name || "Farmer"}! I am AgriAssist AI, your personal agricultural decision intelligence agent. Ask me anything about crop cultivation, soil health, weather advisories, or pest management in English or தமிழ்.`,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (err: any) {
      console.error("Failed to load AI conversations:", err);
    }
  }, [user?.name, language]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Switch conversation thread
  const handleSelectConversation = async (id: number) => {
    try {
      setActiveConversationId(id);
      setError(null);
      const detail = await aiService.getConversation(id);
      setMessages(detail.messages);
    } catch (err: any) {
      setError(err.message || "Failed to load conversation thread.");
    }
  };

  // Start new conversation
  const handleNewConversation = () => {
    setActiveConversationId(null);
    setMessages([
      {
        sender: "ai",
        content:
          language === "ta"
            ? `வணக்கம் ${user?.name || "விவசாயி"}! புதிய விவசாய ஆலோசனை தொடங்கப்பட்டது. உங்கள் கேள்வியை கேளுங்கள்.`
            : `Hello ${user?.name || "Farmer"}! Started a new consultation thread. How can I help your farm today?`,
        created_at: new Date().toISOString(),
      },
    ]);
  };

  // Delete conversation
  const handleDeleteConversation = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await aiService.deleteConversation(id);
      const updated = await aiService.getConversations();
      setConversations(updated);
      if (activeConversationId === id) {
        handleNewConversation();
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete conversation.");
    }
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isSending) return;

    setInput("");
    setError(null);

    // Optimistically append user message
    const userMsg: Message = {
      sender: "farmer",
      content: query,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const res = await aiService.sendMessage({
        message: query,
        conversation_id: activeConversationId,
        farm_id: selectedFarmId,
        language: language,
      });

      setActiveConversationId(res.conversation_id);
      setMessages((prev) => [...prev, res.message]);

      // Refresh conversations list
      const convsList = await aiService.getConversations();
      setConversations(convsList);
    } catch (err: any) {
      setError(err.message || "Failed to send message to AI Agent. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  // Quick Prompt pills
  const samplePrompts = [
    {
      label: "🍅 Tomato Flowering Fertilizer",
      query: "What fertilizer and micronutrient spray should I apply for tomato plants during flowering stage?",
    },
    {
      label: "🌦️ Farm Weather Impact",
      query: "How is today's microclimate weather affecting my farm irrigation and spraying schedules?",
    },
    {
      label: "🧪 Soil pH Amendment",
      query: "How do I optimize alkaline soil with high pH for vegetable crops?",
    },
    {
      label: "🌿 பூ உதிர்வதை தடுப்பது (Tamil)",
      query: "தக்காளி மற்றும் மிளகாய் பயிர்களில் பூக்கள் உதிர்வதை தடுப்பது எப்படி?",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-agri-text">
              AgriAssist AI Agent
            </h1>
            <Badge variant="primary" className="text-xs">
              OpenRouter Nemotron-3
            </Badge>
          </div>
          <p className="text-sm text-agri-muted">
            Specialized conversational agronomist with real-time farm soil, weather, and crop tool integrations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs font-semibold">
            <button
              onClick={() => setLanguage("en")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                language === "en" ? "bg-white text-agri-text shadow-sm" : "text-agri-muted"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("ta")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                language === "ta" ? "bg-white text-agri-text shadow-sm" : "text-agri-muted"
              }`}
            >
              தமிழ்
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-agri-primary" />
            <span className="hidden sm:inline">Strict Agricultural Guardrails</span>
            <span className="sm:hidden">Agri Guardrails</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar + Chat Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left Sidebar: Previous Threads & Farm Context */}
        <Card variant="surface" className="p-4 space-y-4 lg:col-span-1 flex flex-col justify-between h-[640px]">
          <div className="space-y-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleNewConversation}
              className="w-full justify-center text-xs"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Consultation
            </Button>

            {/* Farm Context Selector */}
            {farms.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-agri-border">
                <label className="text-[11px] font-bold text-agri-muted uppercase tracking-wider block">
                  Active Farm Context:
                </label>
                <select
                  value={selectedFarmId || ""}
                  onChange={(e) => setSelectedFarmId(Number(e.target.value))}
                  className="w-full text-xs font-semibold p-2 rounded-xl border border-agri-border bg-agri-bg focus:ring-1 focus:ring-agri-primary outline-none"
                >
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.land_area} {f.area_unit})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* History List */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold text-agri-muted uppercase tracking-wider block">
                Previous Consultations:
              </span>
              <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                {conversations.length === 0 ? (
                  <p className="text-xs text-agri-muted p-2 text-center">
                    No past consultations.
                  </p>
                ) : (
                  conversations.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectConversation(c.id)}
                      className={`group p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        activeConversationId === c.id
                          ? "bg-agri-primary text-white border-agri-primary shadow-xs"
                          : "bg-white text-agri-text border-agri-border hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-80" />
                        <span className="truncate font-medium">{c.title}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteConversation(e, c.id)}
                        className={`p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                          activeConversationId === c.id
                            ? "hover:bg-white/20 text-white"
                            : "hover:bg-red-50 text-red-500"
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-agri-border text-[11px] text-agri-muted flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-agri-primary shrink-0" />
            <span>Nemotron-3 550B + Multi-Tool</span>
          </div>
        </Card>

        {/* Right Canvas: Chat Window */}
        <Card variant="surface" className="lg:col-span-3 flex flex-col h-[640px] p-0 overflow-hidden shadow-card border-agri-border">
          {/* Chat Canvas Header */}
          <div className="p-3.5 sm:p-4 border-b border-agri-border bg-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-agri-primary text-white flex items-center justify-center font-bold shadow-sm">
                <Bot className="w-5 h-5 text-agri-primaryLight" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-agri-text">AgriAssist Agricultural AI</h3>
                <span className="text-[11px] text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Ready to assist in {language === "ta" ? "தமிழ்" : "English"}
                </span>
              </div>
            </div>
            <Badge variant="primary" className="text-xs">
              Context: {farms.find((f) => f.id === selectedFarmId)?.name || "General Agriculture"}
            </Badge>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-agri-bg/40">
            {messages.map((msg, index) => {
              const isUser = msg.sender === "farmer";
              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 shadow-sm ${
                      isUser
                        ? "bg-emerald-700 text-white"
                        : "bg-agri-primary text-white"
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-agri-primaryLight" />}
                  </div>

                  <div className={`space-y-2 max-w-[85%] sm:max-w-[75%]`}>
                    {/* Tool Invocations Badge */}
                    {msg.tool_calls && msg.tool_calls.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {msg.tool_calls.map((tc, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200"
                          >
                            <Wrench className="w-3 h-3 text-emerald-600" />
                            Executed {tc.tool}
                          </span>
                        ))}
                      </div>
                    )}

                    <div
                      className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? "bg-agri-primary text-white rounded-tr-sm"
                          : "bg-white text-agri-text border border-agri-border rounded-tl-sm"
                      }`}
                    >
                      {isUser ? msg.content : cleanSpeechAndText(msg.content)}
                    </div>

                    <div className={`flex items-center gap-2 px-1 ${isUser ? "justify-end" : "justify-between"}`}>
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => {
                            const spokenText = cleanSpeechAndText(msg.content);
                            if (isSpeaking && speakingIndex === index) {
                              stopSpeaking();
                              setSpeakingIndex(null);
                            } else {
                              stopSpeaking();
                              setSpeakingIndex(index);
                              speak(spokenText, language);
                            }
                          }}
                          className="flex items-center gap-1 text-[11px] font-semibold text-agri-primary hover:text-agri-primaryDark bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200 transition-colors"
                          title="Listen to advice aloud"
                        >
                          {isSpeaking && speakingIndex === index ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-agri-primary animate-pulse" />
                              <span>Stop Audio</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Read Aloud</span>
                            </>
                          )}
                        </button>
                      )}

                      <span className="text-[10px] text-slate-400">
                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-agri-primary text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-agri-primaryLight" />
                </div>
                <div className="p-3.5 bg-white rounded-2xl rounded-tl-sm border border-agri-border shadow-sm text-xs text-agri-muted flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-agri-primary animate-ping" />
                  <span>Analyzing farm agronomy & consulting Nemotron-3...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sample Prompts (if few messages) */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 bg-white border-t border-agri-border/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-[11px] font-bold text-agri-muted shrink-0">
                Suggested:
              </span>
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.query)}
                  className="px-2.5 py-1 rounded-xl bg-agri-bg hover:bg-emerald-50 text-[11px] font-medium text-agri-text hover:text-agri-primary border border-agri-border transition-colors shrink-0"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-xs text-red-700 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-agri-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                className="p-3 rounded-xl border border-agri-border bg-emerald-50 text-agri-primary hover:bg-emerald-100 transition-all shadow-xs"
                title="Voice Assistant (Tamil & English)"
              >
                <Mic className="w-5 h-5 animate-pulse" />
              </button>

              <input
                type="text"
                placeholder={
                  language === "ta"
                    ? "விவசாய கேள்வியை உள்ளிடவும் (தமிழ் / English)..."
                    : "Ask about crops, soil chemistry, pests, or weather..."
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isSending}
                className="flex-1 h-12 px-4 rounded-xl border border-agri-border bg-agri-bg/50 text-agri-text text-sm focus:outline-none focus:ring-2 focus:ring-agri-primary focus:bg-white transition-all disabled:opacity-50"
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSending}
                disabled={!input.trim()}
                className="h-12 px-5"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => {
          setIsVoiceOpen(false);
          loadInitialData();
        }}
        farmId={selectedFarmId}
      />
    </div>
  );
};
