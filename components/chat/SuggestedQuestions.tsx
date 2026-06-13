"use client";

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (q: string) => void;
}

export default function SuggestedQuestions({ questions, onSelect }: SuggestedQuestionsProps) {
  if (!questions.length) return null;

  return (
    <div className="px-4 pb-4">
      <p className="text-xs mb-2" style={{ color: "var(--ink-faint)" }}>Suggested questions</p>
      <div className="flex flex-col gap-2">
        {questions.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 hover:opacity-90"
            style={{ color: "var(--ink-soft)", border: "1px solid var(--border)", background: "var(--surface-2)" }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
