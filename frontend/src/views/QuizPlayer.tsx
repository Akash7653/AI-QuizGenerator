import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Clock3, FileText, Flag, Lightbulb, Send, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { QuizAnswer, QuizConfig, QuizQuestion, QuizResult } from '@/types';
import { isShortAnswerCorrect } from '@/lib/quizEngine';
import { saveHistory } from '@/lib/supabase';

interface Props {
  config: QuizConfig;
  questions: QuizQuestion[];
  onComplete: (result: QuizResult) => void;
  onExit: () => void;
}

export function QuizPlayer({ config, questions, onComplete, onExit }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [seconds, setSeconds] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const current = questions[currentIndex];
  const currentAnswer = answers[current?.id] ?? '';
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const remaining = config.timeLimit > 0 ? Math.max(config.timeLimit * 60 - seconds, 0) : null;
  const timeExpired = remaining === 0 && config.timeLimit > 0;

  useEffect(() => {
    if (timeExpired) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [timeExpired]);

  const submit = useCallback(() => {
    const quizAnswers: QuizAnswer[] = questions.map((question) => {
      const userAnswer = answers[question.id] ?? '';
      const isCorrect = question.type === 'short'
        ? isShortAnswerCorrect(userAnswer, question.correctAnswer)
        : userAnswer === question.correctAnswer;
      return {
        questionId: question.id,
        question: question.question,
        userAnswer: userAnswer || 'Not answered',
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
        source: question.source,
        topic: question.topic,
        difficulty: question.difficulty,
      };
    });
    const score = quizAnswers.filter((answer) => answer.isCorrect).length;
    const result: QuizResult = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      topic: config.topic,
      sourceType: config.sourceType,
      score,
      totalQuestions: questions.length,
      difficulty: config.difficulty,
      questionType: config.questionType,
      timeTaken: seconds,
      completedAt: new Date().toISOString(),
      answers: quizAnswers,
      questions,
    };
    void saveHistory({
      topic: config.topic,
      source_type: config.sourceType,
      score,
      total_questions: questions.length,
      difficulty: config.difficulty,
      question_type: config.questionType,
      time_taken: seconds,
    }).catch(() => undefined);
    onComplete(result);
  }, [answers, config, onComplete, questions, seconds]);

  useEffect(() => {
    if (timeExpired) submit();
  }, [submit, timeExpired]);

  const chooseAnswer = (value: string) => {
    setAnswers((previous) => ({ ...previous, [current.id]: value }));
  };

  const next = () => {
    if (currentIndex === questions.length - 1) setShowConfirm(true);
    else setCurrentIndex((index) => index + 1);
  };

  const formatTime = (value: number): string => {
    const minutes = Math.floor(value / 60).toString().padStart(2, '0');
    const secondsValue = (value % 60).toString().padStart(2, '0');
    return `${minutes}:${secondsValue}`;
  };

  const answeredCount = useMemo(() => Object.values(answers).filter(Boolean).length, [answers]);

  if (!current) return null;

  return (
    <div className="mx-auto w-full max-w-none space-y-6 pb-24 lg:min-h-[calc(100vh-5rem)] lg:pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={onExit} className="-ml-3 text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Exit quiz
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full px-3 py-1">{config.topic}</Badge>
          <Badge variant="outline" className="rounded-full px-3 py-1">{config.difficulty}</Badge>
          {config.sourceType === 'pdf' && <Badge variant="outline" className="rounded-full px-3 py-1"><FileText className="mr-1 h-3 w-3" /> PDF grounded</Badge>}
        </div>
      </div>

      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 shadow-[0_28px_80px_rgba(99,102,241,0.10)]">
        <div className="h-1.5 bg-muted"><motion.div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" animate={{ width: `${progress}%` }} /></div>
        <CardHeader className="space-y-4 pb-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold">Question {currentIndex + 1} <span className="font-normal text-muted-foreground">of {questions.length}</span></span>
            <div className={`flex items-center gap-1.5 font-mono text-sm font-semibold ${remaining !== null && remaining < 60 ? 'text-destructive' : 'text-muted-foreground'}`}>
              <Clock3 className="h-4 w-4" /> {formatTime(remaining ?? seconds)}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <CardContent className="space-y-7 pb-8 pt-5">
              <div className="flex items-start gap-3">
                <motion.div
                  key={`badge-${currentIndex}`}
                  initial={{ scale: 0.8, rotate: -8 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-sm font-bold text-primary"
                >
                  {currentIndex + 1}
                </motion.div>
                <h1 className="text-xl font-bold leading-relaxed sm:text-2xl">{current.question}</h1>
              </div>

              <div className="space-y-3">
                {current.type === 'short' ? (
                  <div className="space-y-2">
                    <motion.div layout>
                      <Input
                        value={currentAnswer}
                        onChange={(event) => chooseAnswer(event.target.value)}
                        placeholder="Type your answer here…"
                        className="h-12 rounded-xl border-border/60 bg-background/90 text-base shadow-sm transition-all duration-200 focus-visible:ring-primary/50"
                        autoFocus
                      />
                    </motion.div>
                    <p className="text-xs text-muted-foreground">Keep it concise. Your answer will be checked against the key idea.</p>
                  </div>
                ) : (
                  current.options?.map((option, index) => {
                    const selected = currentAnswer === option;
                    return (
                      <motion.button
                        key={option}
                        whileHover={{ scale: 1.01, x: 2 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => chooseAnswer(option)}
                        className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200 ${selected ? 'border-primary bg-gradient-to-r from-primary/10 to-violet-500/10 shadow-md shadow-primary/10' : 'border-border/60 bg-background/70 hover:border-primary/40 hover:bg-accent/40'}`}
                      >
                        <motion.span
                          animate={selected ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                          transition={{ duration: 0.25 }}
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                        >
                          {current.type === 'truefalse' ? (option === 'True' ? '✓' : '×') : String.fromCharCode(65 + index)}
                        </motion.span>
                        <span className="text-sm font-medium">{option}</span>
                        {selected && <Check className="ml-auto h-5 w-5 text-primary" />}
                      </motion.button>
                    );
                  })
                )}
              </div>

              {current.source && (
                <div className="flex items-center gap-2 rounded-xl bg-accent/50 px-3 py-2 text-xs text-accent-foreground">
                  <FileText className="h-3.5 w-3.5" /> Source reference: {current.source}
                </div>
              )}

              <div className="flex flex-col-reverse justify-between gap-3 border-t border-border/60 pt-5 sm:flex-row">
                <Button variant="outline" onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))} disabled={currentIndex === 0} className="rounded-xl">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button onClick={next} className="rounded-xl shadow-lg shadow-primary/25">
                    {currentIndex === questions.length - 1 ? <><Flag className="mr-2 h-4 w-4" /> Finish quiz</> : <>Next <ArrowRight className="ml-2 h-4 w-4" /></>}
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </motion.div>
        </AnimatePresence>
      </Card>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{answeredCount} of {questions.length} answered</span>
        <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-success" /> Your progress is saved when you finish</span>
      </div>

      {showConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 18 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <Card className="border-primary/20 bg-gradient-to-br from-background via-background to-violet-500/10 shadow-[0_30px_90px_rgba(99,102,241,0.25)]">
              <CardHeader><CardTitle>Submit your quiz?</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm text-muted-foreground">You answered {answeredCount} of {questions.length} questions. Unanswered questions count as incorrect.</p>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowConfirm(false)}>Keep reviewing</Button>
                  <Button onClick={submit}><Send className="mr-2 h-4 w-4" /> Submit quiz</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
