import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Flag, BookOpen } from 'lucide-react';
import type { Question } from '@/types';

interface AnswerOptionProps {
  label: string;
  text: string;
  selected: boolean;
  correct?: boolean;
  showResult?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function AnswerOption({ label, text, selected, correct, showResult, disabled, onClick }: AnswerOptionProps) {
  const isCorrect = showResult && correct;
  const isWrong = showResult && selected && !correct;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
        isCorrect
          ? 'border-success-500 bg-success-50 dark:bg-success-900/20'
          : isWrong
          ? 'border-error-500 bg-error-50 dark:bg-error-900/20'
          : selected
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
          : 'border-ink-200 dark:border-ink-700 hover:border-brand-300 bg-white dark:bg-ink-900'
      } ${disabled && !showResult ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
        isCorrect
          ? 'bg-success-500 text-white'
          : isWrong
          ? 'bg-error-500 text-white'
          : selected
          ? 'bg-brand-600 text-white'
          : 'bg-ink-100 dark:bg-ink-800 text-ink-500'
      }`}>
        {label}
      </div>
      <span className={`text-sm flex-1 ${
        isCorrect || isWrong ? 'font-semibold text-ink-900 dark:text-white' : 'text-ink-700 dark:text-ink-200'
      }`}>{text}</span>
      {isCorrect && <CheckCircle2 className="w-5 h-5 text-success-500 shrink-0" />}
      {isWrong && <XCircle className="w-5 h-5 text-error-500 shrink-0" />}
    </button>
  );
}

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  total: number;
  selectedOptionId: string | null;
  showResult?: boolean;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
}

export function QuestionCard({
  question,
  questionNumber,
  total,
  selectedOptionId,
  showResult,
  onSelect,
  disabled,
}: QuestionCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            Question {questionNumber} of {total}
          </span>
          <span className="chip bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300">
            {question.topic}
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-ink-900 dark:text-white mb-6 leading-relaxed">
          {question.text}
        </h2>

        <div className="space-y-3">
          {question.options.map((opt) => (
            <AnswerOption
              key={opt.id}
              label={opt.label}
              text={opt.text}
              selected={selectedOptionId === opt.id}
              correct={opt.id === question.correctOptionId}
              showResult={showResult}
              disabled={disabled}
              onClick={() => onSelect(opt.id)}
            />
          ))}
        </div>

        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 p-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800"
          >
            <div className="flex items-start gap-2">
              <BookOpen className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-brand-700 dark:text-brand-300 mb-1">Explanation</p>
                <p className="text-sm text-ink-700 dark:text-ink-300 leading-relaxed">{question.explanation}</p>
                {question.sourceReference && (
                  <p className="text-xs text-ink-500 mt-2">Source: {question.sourceReference}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
