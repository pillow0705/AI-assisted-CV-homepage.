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
  const [mode, setMode] = useState<"chat" | "interview">("chat");
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
          body: JSON.stringify({ messages: newMessages, sessionId, mode }),
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
    [messages, isStreaming, sessionId, mode]
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

  // Switching mode starts a fresh conversation so the persona is consistent.
  const switchMode = (next: "chat" | "interview") => {
    if (next === mode || isStreaming) return;
    setMode(next);
    setMessages([]);
    setStreamingContent("");
  };

  const providerLabel: Record<string, string> = {
    openai: "GPT",
    anthropic: "Claude",
    deepseek: "DeepSeek",
  };

  return (
    <>
      {/* Trigger button (also accessible via id for external click) */}
      {/* Attention label + arrow pointing at the button (closed state only) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="chat-hint"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: [0, -6, 0] }}
            exit={{ opacity: 0, x: 16 }}
            transition={{
              opacity: { duration: 0.4 },
              x: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
            }}
            onClick={() => setOpen(true)}
            className="fixed bottom-[34px] right-24 z-50 cursor-pointer hidden sm:flex items-center gap-2"
          >
            <span
              className="px-4 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap shadow-lg"
              style={{
                background: "var(--surface)",
                color: "var(--ink)",
                border: "1.5px solid var(--matcha)",
                boxShadow: "0 6px 20px rgba(110,159,87,0.30)",
              }}
            >
              💬 Ask my AI →
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        id="chat-trigger"
        onClick={() => setOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
          isOpen ? "rotate-45 scale-90" : "animate-bounce-chat hover:scale-110"
        }`}
        style={{
          background: "linear-gradient(135deg, #8FBE74, #6E9F57)",
          boxShadow: "0 0 0 5px rgba(143,190,116,0.22), 0 0 30px rgba(110,159,87,0.7), 0 6px 22px rgba(74,63,42,0.3)",
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
              className="text-white text-2xl font-light"
            >
              ✕
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-white text-2xl"
            >
              ✦
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Expanding pulse ring on closed state */}
      {!isOpen && (
        <div
          className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full pointer-events-none"
          style={{
            background: "rgba(110,159,87,0.35)",
            animation: "chatPing 1.8s cubic-bezier(0,0,0.2,1) infinite",
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
              background: "var(--surface)",
              border: "1px solid var(--border-strong)",
              boxShadow: "0 25px 60px rgba(74,63,42,0.25), 0 0 40px rgba(110,159,87,0.12)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{
                background: "var(--matcha-soft)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                  style={{ background: "linear-gradient(135deg, #8FBE74, #6E9F57)", color: "#fff" }}
                >
                  ✦
                </div>
                <div>
                  <p className="font-semibold text-sm leading-tight" style={{ color: "var(--ink)" }}>
                    {mode === "interview" ? `Mock interview with ${ownerName}` : `Ask about ${ownerName}`}
                  </p>
                  <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
                    Powered by{" "}
                    <span style={{ color: "var(--matcha-deep)" }}>{providerLabel[aiProvider] || aiProvider}</span>
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

            {/* Mode toggle: ask-about vs mock-interview */}
            <div
              className="flex gap-1 px-3 py-2 flex-shrink-0"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              {([
                { id: "chat", label: "💬 Ask about me" },
                { id: "interview", label: "🎤 Mock interview" },
              ] as const).map((m) => {
                const isActive = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => switchMode(m.id)}
                    disabled={isStreaming}
                    className="flex-1 text-xs font-medium py-1.5 rounded-lg transition-all disabled:opacity-50"
                    style={
                      isActive
                        ? { background: "var(--matcha)", color: "#fff" }
                        : { background: "var(--surface-2)", color: "var(--ink-soft)", border: "1px solid var(--border)" }
                    }
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-3 pt-4"
            >
              {messages.length === 0 && !isStreaming && (
                <div className="text-center py-6 px-4">
                  <div className="text-3xl mb-3">{mode === "interview" ? "🎤" : "✦"}</div>
                  {mode === "interview" ? (
                    <>
                      <p className="text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>You&apos;re the interviewer</p>
                      <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
                        I&apos;ll answer as {ownerName} in the first person — ask interview questions to help {ownerName} practice.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>Hi! I&apos;m {ownerName}&apos;s AI</p>
                      <p className="text-xs" style={{ color: "var(--ink-faint)" }}>Ask me anything about {ownerName}&apos;s background, research, or projects.</p>
                    </>
                  )}
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
                      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm mt-1" style={{ background: "linear-gradient(135deg, #8FBE74, #6E9F57)", color: "#fff" }}>
                        ✦
                      </div>
                      <div className="rounded-2xl rounded-tl-sm" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
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
                className="absolute bottom-[72px] right-4 w-7 h-7 rounded-full flex items-center justify-center transition-all text-xs"
                style={{ background: "var(--matcha-soft)", border: "1px solid var(--matcha)", color: "var(--matcha-deep)" }}
              >
                ↓
              </button>
            )}

            {/* Suggested questions */}
            {messages.length === 0 && !isStreaming && (
              <SuggestedQuestions
                questions={
                  mode === "interview"
                    ? [
                        "Tell me about yourself.",
                        "Walk me through your most challenging project.",
                        "Why are you interested in this role?",
                      ]
                    : suggestedQuestions
                }
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
              <div className="flex items-end gap-2 rounded-xl px-3 py-2 transition-colors" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  rows={1}
                  disabled={rateLimited}
                  className="flex-1 bg-transparent text-sm resize-none outline-none min-h-[24px] max-h-[120px] leading-6"
                  style={{ fieldSizing: "content", color: "var(--ink)" } as React.CSSProperties}
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
                      background: input.trim() ? "linear-gradient(135deg, #8FBE74, #6E9F57)" : "var(--border)",
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
