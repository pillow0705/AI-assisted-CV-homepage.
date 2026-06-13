"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import ChatMessage from "./ChatMessage";
import SuggestedQuestions from "./SuggestedQuestions";
import TypingIndicator from "./TypingIndicator";
import type { Message } from "@/types";

interface ChatWidgetProps {
  ownerName: string;
  aiProvider: string;
  suggestedQuestions?: string[];
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const RATE_LIMIT_KEY = "chat_msg_count";
const RATE_LIMIT_RESET = "chat_msg_reset";
const MAX_MSGS_PER_HOUR = 30;

export default function ChatWidget({
  ownerName,
  aiProvider,
  suggestedQuestions = [],
  isOpen: controlledOpen,
  onOpenChange,
}: ChatWidgetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    else setInternalOpen(v);
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [sessionId] = useState(() => uuidv4());
  const [atBottom, setAtBottom] = useState(true);
  const [rateLimited, setRateLimited] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (atBottom) scrollToBottom();
  }, [messages, streamingContent, atBottom, scrollToBottom]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const reset = parseInt(localStorage.getItem(RATE_LIMIT_RESET) || "0");
    if (now > reset) {
      localStorage.setItem(RATE_LIMIT_KEY, "1");
      localStorage.setItem(RATE_LIMIT_RESET, String(now + 3600000));
      return true;
    }
    const count = parseInt(localStorage.getItem(RATE_LIMIT_KEY) || "0");
    if (count >= MAX_MSGS_PER_HOUR) {
      setRateLimited(true);
      return false;
    }
    localStorage.setItem(RATE_LIMIT_KEY, String(count + 1));
    return true;
  };

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;
      if (!checkRateLimit()) return;

      const userMessage: Message = { role: "user", content: trimmed };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setIsStreaming(true);
      setStreamingContent("");

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages, sessionId }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) throw new Error(await res.text());

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.delta) {
                  accumulated += parsed.delta;
                  setStreamingContent(accumulated);
                }
                if (parsed.error) throw new Error(parsed.error);
              } catch {
                // partial JSON or non-data line, skip
              }
            }
          }
        }

        setMessages((prev) => [...prev, { role: "assistant", content: accumulated }]);
      } catch (err: unknown) {
        if ((err as Error).name !== "AbortError") {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "I'm sorry, I encountered an error. Please try again in a moment.",
            },
          ]);
        }
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
        abortRef.current = null;
      }
    },
    [messages, isStreaming, sessionId]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 60);
  };

  const stopStreaming = () => {
    abortRef.current?.abort();
  };

  const clearChat = () => {
    setMessages([]);
    setStreamingContent("");
    setRateLimited(false);
  };

  const providerLabel: Record<string, string> = {
    openai: "GPT",
    anthropic: "Claude",
    deepseek: "DeepSeek",
  };

  return (
    <>
      {/* Trigger button (also accessible via id for external click) */}
      <button
        id="chat-trigger"
        onClick={() => setOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen ? "rotate-45 scale-90" : "animate-bounce-chat"
        }`}
        style={{
          background: "linear-gradient(135deg, #F472B6, #A855F7, #60A5FA)",
          boxShadow: "0 0 25px rgba(168,85,247,0.6), 0 4px 20px rgba(0,0,0,0.4)",
        }}
        aria-label="Toggle AI chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              className="text-white text-xl font-light"
            >
              ✕
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-white text-xl"
            >
              ✦
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Pulse ring on closed state */}
      {!isOpen && (
        <div
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full pointer-events-none"
          style={{
            background: "rgba(168,85,247,0.2)",
            animation: "glowPulse 2s ease-in-out infinite",
          }}
        />
      )}

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] h-[580px] max-h-[calc(100vh-120px)] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: "rgba(15, 12, 30, 0.92)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(168,85,247,0.25)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(168,85,247,0.15)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{
                background: "linear-gradient(90deg, rgba(244,114,182,0.12), rgba(168,85,247,0.12), rgba(96,165,250,0.12))",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                  style={{ background: "linear-gradient(135deg, #F472B6, #A855F7)" }}
                >
                  ✦
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-tight">Ask about {ownerName}</p>
                  <p className="text-slate-500 text-xs">
                    Powered by{" "}
                    <span className="text-purple-400">{providerLabel[aiProvider] || aiProvider}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all text-xs"
                    title="Clear chat"
                  >
                    🗑
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-3 pt-4"
            >
              {messages.length === 0 && !isStreaming && (
                <div className="text-center py-6 px-4">
                  <div className="text-3xl mb-3">✦</div>
                  <p className="text-slate-300 text-sm font-medium mb-1">Hi! I&apos;m {ownerName}&apos;s AI</p>
                  <p className="text-slate-500 text-xs">Ask me anything about {ownerName}&apos;s background, research, or projects.</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  message={msg}
                  isStreaming={false}
                />
              ))}

              {isStreaming && (
                <>
                  {streamingContent ? (
                    <ChatMessage
                      message={{ role: "assistant", content: streamingContent }}
                      isStreaming
                    />
                  ) : (
                    <div className="flex gap-2.5 mb-4">
                      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm mt-1 bg-gradient-to-br from-purple-500 to-blue-500">
                        ✦
                      </div>
                      <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-sm">
                        <TypingIndicator />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Scroll to bottom */}
            {!atBottom && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-[72px] right-4 w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 hover:bg-purple-500/30 transition-all text-xs"
              >
                ↓
              </button>
            )}

            {/* Suggested questions */}
            {messages.length === 0 && !isStreaming && suggestedQuestions.length > 0 && (
              <SuggestedQuestions
                questions={suggestedQuestions}
                onSelect={(q) => sendMessage(q)}
              />
            )}

            {/* Rate limit notice */}
            {rateLimited && (
              <div className="px-4 py-2 text-center text-xs text-amber-400 border-t border-white/5">
                You&apos;ve reached the hourly message limit. Please try again later.
              </div>
            )}

            {/* Input area */}
            <div className="flex-shrink-0 px-3 pb-3 pt-2 border-t border-white/5">
              <div className="flex items-end gap-2 bg-white/5 rounded-xl border border-white/8 px-3 py-2 focus-within:border-purple-500/50 transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  rows={1}
                  disabled={rateLimited}
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 resize-none outline-none min-h-[24px] max-h-[120px] leading-6"
                  style={{ fieldSizing: "content" } as React.CSSProperties}
                />
                {isStreaming ? (
                  <button
                    onClick={stopStreaming}
                    className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 flex items-center justify-center flex-shrink-0 transition-all"
                    title="Stop"
                  >
                    ⏹
                  </button>
                ) : (
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || rateLimited}
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
                    style={{
                      background: input.trim() ? "linear-gradient(135deg, #A855F7, #60A5FA)" : "rgba(255,255,255,0.05)",
                    }}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-center text-slate-700 text-[10px] mt-1.5">Enter to send · Shift+Enter for newline</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
