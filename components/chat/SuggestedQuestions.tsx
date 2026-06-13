"use client";

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (q: string) => void;
}

export default function SuggestedQuestions({ questions, onSelect }: SuggestedQuestionsProps) {
  if (!questions.length) return null;

  return (
    <div className="px-4 pb-4">
      <p className="text-xs text-slate-500 mb-2">Suggested questions</p>
      <div className="flex flex-col gap-2">
        {questions.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="text-left px-3 py-2.5 rounded-xl text-sm text-slate-300 border border-white/8 bg-white/3 hover:bg-white/8 hover:border-purple-500/40 hover:text-white transition-all duration-200"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
