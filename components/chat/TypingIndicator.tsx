export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full animate-typing-bounce"
          style={{ animationDelay: `${i * 0.18}s`, background: "var(--matcha)" }}
        />
      ))}
    </div>
  );
}
