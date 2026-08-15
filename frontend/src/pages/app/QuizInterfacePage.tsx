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
    <div className="min-h-[calc(100vh-4rem)] bg-ink-50 dark:bg-ink-950">
      {/* Quiz header */}
      <div className="sticky top-16 z-10 glass border-b border-white/30 dark:border-white/5 px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setShowExit(true)}
            className="p-2 rounded-lg text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
            aria-label="Exit quiz"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.bg}`}>
              <m.icon className={`w-4 h-4 ${m.color}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-ink-900 dark:text-white truncate max-w-[200px]">{quiz.title}</p>
              <p className="text-xs text-ink-500">{m.label}</p>
            </div>
          </div>
          <QuizProgress current={currentQ} total={quiz.questions.length} />
          {quiz.config.timeLimit > 0 && <QuizTimer timeLeft={timeLeft} total={quiz.config.timeLimit * 60} />}
        </div>

        {/* Challenge mode HUD */}
        {mode === 'challenge' && (
          <div className="max-w-4xl mx-auto mt-2 flex items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1.5 text-sm font-bold text-warning-600 dark:text-warning-400">
              <Trophy className="w-4 h-4" /> {score} pts
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-error-500">
              <Flame className="w-4 h-4" /> {streak} streak
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-brand-600 dark:text-brand-400">
              <Zap className="w-4 h-4" /> {xp} XP
            </div>
          </div>
        )}

        {/* Adaptive mode note */}
        {mode === 'adaptive' && difficultyNote && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto mt-2"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 text-sm font-medium">
                <Sparkles className="w-4 h-4" /> {difficultyNote}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Quiz body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQ + 1}
          total={quiz.questions.length}
          selectedOptionId={answers[currentQ]}
          showResult={showExplanation}
          onSelect={handleSelect}
          disabled={showExplanation}
        />

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-6 gap-2">
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

        {/* Question navigator */}
        <div className="card p-4 mt-6">
          <p className="text-xs font-semibold text-ink-500 dark:text-ink-400 mb-3 uppercase tracking-wider">Question Navigator</p>
          <QuestionNavigator
            total={quiz.questions.length}
            current={currentQ}
            answers={answers}
            marked={marked}
            onSelect={(i) => { setInstantFeedback(false); setCurrentQ(i); }}
          />
          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-ink-500">
            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-success-100 dark:bg-success-900/40" /> Answered ({answeredCount})</span>
            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-ink-100 dark:bg-ink-800" /> Unanswered ({unansweredCount})</span>
            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-warning-100 dark:bg-warning-900/40" /> Marked ({markedCount})</span>
          </div>
        </div>
      </div>

      {/* Submit confirmation modal */}
      <Modal open={showSubmit} onClose={() => setShowSubmit(false)} title="Submit quiz?">
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 rounded-xl bg-success-50 dark:bg-success-900/20">
            <span className="text-sm text-ink-700 dark:text-ink-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success-500" /> Answered</span>
            <span className="font-bold text-success-600">{answeredCount}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50">
            <span className="text-sm text-ink-700 dark:text-ink-300 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-ink-400" /> Unanswered</span>
            <span className="font-bold text-ink-600 dark:text-ink-300">{unansweredCount}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-warning-50 dark:bg-warning-900/20">
            <span className="text-sm text-ink-700 dark:text-ink-300 flex items-center gap-2"><Flag className="w-4 h-4 text-warning-500" /> Marked for review</span>
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

      {/* Exit confirmation modal */}
      <Modal open={showExit} onClose={() => setShowExit(false)} title="Leave quiz?">
        <p className="text-sm text-ink-600 dark:text-ink-400 mb-6">
          Your progress will be lost. Are you sure you want to exit this quiz?
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setShowExit(false)}>
            Stay
          </Button>
          <Link to="/dashboard" className="btn flex-1 bg-error-600 text-white hover:bg-error-700 px-4 py-2.5 text-sm font-semibold">
            Exit Quiz
          </Link>
        </div>
      </Modal>
    </div>
  );
}
