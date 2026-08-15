import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  X, ChevronLeft, ChevronRight, Flag, CheckCircle2, AlertCircle,
  Trophy, Zap, Flame, ArrowRight, Target, Sparkles,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { QuestionNavigator, QuizTimer, QuizProgress } from '@/components/quiz/QuizControls';
import { quizService, saveResult } from '@/services/quizService';
import { sampleQuiz } from '@/data/mockData';
import type { Quiz, QuizMode, QuizResult, AnswerRecord } from '@/types';

const modeConfig: Record<QuizMode, { label: string; icon: typeof Target; color: string; bg: string }> = {
  practice: { label: 'Practice Mode', icon: Target, color: 'text-brand-600', bg: 'bg-brand-100 dark:bg-brand-900/30' },
  exam: { label: 'Exam Mode', icon: AlertCircle, color: 'text-accent-600', bg: 'bg-accent-100 dark:bg-accent-900/30' },
  adaptive: { label: 'Adaptive Mode', icon: Sparkles, color: 'text-success-600', bg: 'bg-success-100 dark:bg-success-900/30' },
  challenge: { label: 'Challenge Mode', icon: Trophy, color: 'text-warning-600', bg: 'bg-warning-100 dark:bg-warning-900/30' },
};

export function QuizInterfacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [marked, setMarked] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [instantFeedback, setInstantFeedback] = useState(false);
  const [mode, setMode] = useState<QuizMode>('practice');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [difficultyNote, setDifficultyNote] = useState('');
  const [adaptiveLevel, setAdaptiveLevel] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    (async () => {
      let loadedQuiz = id ? await quizService.getQuiz(id) : null;
      if (!loadedQuiz) loadedQuiz = sampleQuiz;
      setQuiz(loadedQuiz);
      setAnswers(new Array(loadedQuiz.questions.length).fill(null));
      setMarked(new Array(loadedQuiz.questions.length).fill(false));
      setMode(loadedQuiz.mode);
      setTimeLeft(loadedQuiz.config.timeLimit * 60);
      setLoading(false);
    })();
  }, [id]);

  // Timer
  useEffect(() => {
    if (loading || !quiz || quiz.config.timeLimit === 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loading, quiz]);

  const handleSelect = useCallback((optionId: string) => {
    if (!quiz) return;
    if (mode === 'practice') setInstantFeedback(true);
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQ] = optionId;
      return next;
    });

    // Challenge mode scoring
    if (mode === 'challenge') {
      const isCorrect = optionId === quiz.questions[currentQ].correctOptionId;
      if (isCorrect) {
        setScore((s) => s + 10 + streak * 2);
        setStreak((s) => s + 1);
        setXp((x) => x + 15);
      } else {
        setStreak(0);
      }
    }

    // Adaptive mode difficulty tracking
    if (mode === 'adaptive') {
      const isCorrect = optionId === quiz.questions[currentQ].correctOptionId;
      const newLevel = isCorrect ? adaptiveLevel + 1 : adaptiveLevel - 1;
      setAdaptiveLevel(newLevel);
      if (Math.abs(newLevel) >= 2) {
        setDifficultyNote(isCorrect ? 'Difficulty increased — you are doing great!' : 'Difficulty adjusted — take your time.');
        setTimeout(() => setDifficultyNote(''), 3000);
      }
    }
  }, [quiz, currentQ, mode, streak, adaptiveLevel]);

  const handleNext = () => {
    if (!quiz || currentQ >= quiz.questions.length - 1) return;
    setInstantFeedback(false);
    setCurrentQ((c) => c + 1);
  };

  const handlePrev = () => {
    if (currentQ <= 0) return;
    setInstantFeedback(false);
    setCurrentQ((c) => c - 1);
  };

  const handleMark = () => {
    setMarked((prev) => {
      const next = [...prev];
      next[currentQ] = !next[currentQ];
      return next;
    });
  };

  const handleSubmit = useCallback(() => {
    if (!quiz) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const answerRecords: AnswerRecord[] = quiz.questions.map((q, i) => {
      const selected = answers[i];
      const isCorrect = selected === q.correctOptionId;
      return {
        questionId: q.id,
        questionText: q.text,
        selectedOptionId: selected,
        correctOptionId: q.correctOptionId,
        isCorrect,
        skipped: !selected,
        markedForReview: marked[i],
        timeSpent: 0,
        topic: q.topic,
        difficulty: q.difficulty,
        explanation: q.explanation,
        sourceReference: q.sourceReference,
      };
    });

    const correct = answerRecords.filter((a) => a.isCorrect).length;
    const wrong = answerRecords.filter((a) => !a.isCorrect && !a.skipped).length;
    const unanswered = answerRecords.filter((a) => a.skipped).length;
    const total = quiz.questions.length;
    const scorePct = Math.round((correct / total) * 100);
    const timeTaken = quiz.config.timeLimit * 60 - timeLeft;

    const result: QuizResult = {
      id: `result_${Date.now()}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      mode: quiz.mode,
      date: new Date().toISOString(),
      score: scorePct,
      correct,
      wrong,
      unanswered,
      total,
      timeTaken: timeTaken > 0 ? timeTaken : 300,
      accuracy: total > 0 ? Math.round((correct / (correct + wrong || 1)) * 100) : 0,
      answers: answerRecords,
    };

    saveResult(result);
    navigate(`/quiz/${quiz.id}/results`, { state: { result } });
  }, [quiz, answers, marked, timeLeft, navigate]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!quiz) {
    return <div className="p-8 text-center text-ink-500">Quiz not found.</div>;
  }

  const m = modeConfig[mode];
  const answeredCount = answers.filter((a) => a !== null).length;
  const markedCount = marked.filter((m) => m).length;
  const unansweredCount = quiz.questions.length - answeredCount;
  const currentQuestion = quiz.questions[currentQ];
  const showExplanation = mode === 'practice' && instantFeedback && answers[currentQ] !== null;

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 sm:px-6 lg:px-8 dark:bg-ink-950">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_12px_35px_rgba(15,23,42,0.08)] dark:border-ink-800 dark:bg-ink-900 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setShowExit(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700"
                aria-label="Exit quiz"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-900 dark:text-white">{quiz.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 ${m.bg}`}>
                    <m.icon className={`h-3.5 w-3.5 ${m.color}`} />
                    {m.label}
                  </span>
                  <span>Question {currentQ + 1} of {quiz.questions.length}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300">
                <Target className="h-4 w-4 text-brand-600" />
                {answeredCount}/{quiz.questions.length}
              </div>
              {quiz.config.timeLimit > 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300">
                  <QuizTimer timeLeft={timeLeft} total={quiz.config.timeLimit * 60} />
                </div>
              )}
            </div>
          </div>

          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-ink-700 dark:bg-ink-800/60">
            <div className="flex items-center justify-between text-xs font-medium text-ink-500 dark:text-ink-400">
              <span>Progress</span>
              <span>{Math.round(((currentQ + 1) / quiz.questions.length) * 100)}%</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-ink-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-blue-600 transition-all duration-300"
                style={{ width: `${((currentQ + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>
          </div>

          {mode === 'challenge' && (
            <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 rounded-xl bg-warning-50 px-3 py-2 text-sm font-bold text-warning-600 dark:bg-warning-900/20 dark:text-warning-300">
                <Trophy className="h-4 w-4" /> {score} pts
              </div>
              <div className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-500 dark:bg-red-900/20 dark:text-red-300">
                <Flame className="h-4 w-4" /> {streak} streak
              </div>
              <div className="flex items-center gap-1.5 rounded-xl bg-brand-50 px-3 py-2 text-sm font-bold text-brand-600 dark:bg-brand-900/20 dark:text-brand-300">
                <Zap className="h-4 w-4" /> {xp} XP
              </div>
            </div>
          )}

          {mode === 'adaptive' && difficultyNote && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4"
              >
                <div className="flex items-center gap-2 rounded-xl bg-success-100 px-3 py-2 text-sm font-medium text-success-700 dark:bg-success-900/30 dark:text-success-300">
                  <Sparkles className="h-4 w-4" /> {difficultyNote}
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          <div className="space-y-5">
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentQ + 1}
              total={quiz.questions.length}
              selectedOptionId={answers[currentQ]}
              showResult={showExplanation}
              onSelect={handleSelect}
              disabled={showExplanation}
            />

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={handlePrev}
                disabled={currentQ === 0}
                className="btn-secondary px-4 py-2.5 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <button
                onClick={handleMark}
                className={`btn px-4 py-2.5 ${
                  marked[currentQ]
                    ? 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300'
                    : 'btn-outline'
                }`}
              >
                <Flag className="w-4 h-4" /> {marked[currentQ] ? 'Unmark' : 'Mark'}
              </button>

              {currentQ < quiz.questions.length - 1 ? (
                <button onClick={handleNext} className="btn-primary px-4 py-2.5">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={() => setShowSubmit(true)} className="btn-primary px-4 py-2.5 bg-success-600 hover:bg-success-700">
                  <CheckCircle2 className="w-4 h-4" /> Submit
                </button>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-ink-700 dark:bg-ink-800/60">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500 dark:text-ink-400">Question Navigator</p>
              <QuestionNavigator
                total={quiz.questions.length}
                current={currentQ}
                answers={answers}
                marked={marked}
                onSelect={(i) => { setInstantFeedback(false); setCurrentQ(i); }}
              />
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-ink-500 dark:text-ink-400">
                <span className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-success-100 dark:bg-success-900/40" /> Answered ({answeredCount})</span>
                <span className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-slate-200 dark:bg-ink-700" /> Unanswered ({unansweredCount})</span>
                <span className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-warning-100 dark:bg-warning-900/40" /> Marked ({markedCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={showSubmit} onClose={() => setShowSubmit(false)} title="Submit quiz?">
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-success-50 p-3 dark:bg-success-900/20">
            <span className="flex items-center gap-2 text-sm text-ink-700 dark:text-ink-300"><CheckCircle2 className="h-4 w-4 text-success-500" /> Answered</span>
            <span className="font-bold text-success-600">{answeredCount}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-ink-50 p-3 dark:bg-ink-800/50">
            <span className="flex items-center gap-2 text-sm text-ink-700 dark:text-ink-300"><AlertCircle className="h-4 w-4 text-ink-400" /> Unanswered</span>
            <span className="font-bold text-ink-600 dark:text-ink-300">{unansweredCount}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-warning-50 p-3 dark:bg-warning-900/20">
            <span className="flex items-center gap-2 text-sm text-ink-700 dark:text-ink-300"><Flag className="h-4 w-4 text-warning-500" /> Marked for review</span>
            <span className="font-bold text-warning-600">{markedCount}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setShowSubmit(false)}>
            Continue Quiz
          </Button>
          <Button className="flex-1 bg-success-600 hover:bg-success-700" onClick={handleSubmit}>
            Submit Quiz <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Modal>

      <Modal open={showExit} onClose={() => setShowExit(false)} title="Leave quiz?">
        <p className="mb-6 text-sm text-ink-600 dark:text-ink-400">
          Your progress will be lost. Are you sure you want to exit this quiz?
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setShowExit(false)}>
            Stay
          </Button>
          <Link to="/dashboard" className="btn flex-1 bg-error-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-error-700">
            Exit Quiz
          </Link>
        </div>
      </Modal>
    </div>
  );
}
