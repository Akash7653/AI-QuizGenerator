import type {
  Quiz,
  QuizConfig,
  Question,
  QuizResult,
  InputSource,
} from '@/types';
import { sampleQuestions } from '@/data/mockData';
import { api } from './api';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const QUIZ_KEY = 'quizgen_quizzes';
const RESULT_KEY = 'quizgen_results';
const AUTH_KEY = 'quizgen_auth';

function getDayKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function calculateStreak(results: QuizResult[]): number {
  if (!results.length) return 0;

  const uniqueDates = [...new Set(results.map((result) => getDayKey(new Date(result.date))))].sort().reverse();
  const today = new Date();
  const todayKey = getDayKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = getDayKey(yesterday);

  let cursor = new Date(today);
  let startKey = todayKey;

  if (!uniqueDates.includes(todayKey) && uniqueDates.includes(yesterdayKey)) {
    cursor = new Date(yesterday);
    startKey = yesterdayKey;
  }

  if (!uniqueDates.includes(startKey)) {
    return 0;
  }

  let streak = 0;
  let current = new Date(cursor);
  while (uniqueDates.includes(getDayKey(current))) {
    streak += 1;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}

function syncUserProgress(results: QuizResult[]): void {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return;

  try {
    const session = JSON.parse(raw) as { user?: Record<string, any> };
    const user = session.user ?? {};
    const averageScore = results.length
      ? Math.round(results.reduce((sum, item) => sum + Number(item.score || 0), 0) / results.length)
      : 0;

    session.user = {
      ...user,
      quizzesCompleted: results.length,
      averageScore,
      streak: calculateStreak(results),
      xp: Number(user.xp ?? 0),
      level: Number(user.level ?? 1),
    };

    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  } catch {
    // ignore malformed session data
  }
}

function loadQuizzes(): Quiz[] {
  const raw = localStorage.getItem(QUIZ_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Quiz[];
  } catch {
    return [];
  }
}

function saveQuizzes(quizzes: Quiz[]): void {
  localStorage.setItem(QUIZ_KEY, JSON.stringify(quizzes));
}

export function loadResults(): QuizResult[] {
  const raw = localStorage.getItem(RESULT_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QuizResult[];
  } catch {
    return [];
  }
}

export function notifyQuizResultsUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('quiz-results-updated'));
  }
}

export function saveResult(result: QuizResult): void {
  const results = loadResults();
  results.unshift(result);
  localStorage.setItem(RESULT_KEY, JSON.stringify(results));
  syncUserProgress(results);
  notifyQuizResultsUpdated();
}

export const quizService = {
  async generateQuiz(
    source: InputSource,
    sourceLabel: string,
    topic: string,
    config: QuizConfig,
  ): Promise<Quiz> {
    try {
      // Try backend API first
      const response = await api.post('/quiz/generate-topic', {
        topic: topic || 'General',
        difficulty: config.difficulty,
        total_questions: config.numQuestions,
        question_type: config.questionType === 'mixed' ? 'Mixed' : config.questionType,
        time_limit: config.timeLimit,
        source_type: source,
      });

      const questions: Question[] = response.data.questions.map((q: any, i: number) => ({
        id: q.id || `q_${i}`,
        text: q.question,
        type: q.type || 'mcq',
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }));

      const quiz: Quiz = {
        id: `quiz_${Date.now()}`,
        title: topic ? `${topic} Quiz` : `${sourceLabel.substring(0, 40)} Quiz`,
        topic: topic || 'General',
        difficulty: config.difficulty,
        mode: 'practice',
        source,
        sourceLabel,
        questions,
        config,
        createdAt: new Date().toISOString(),
      };

      const quizzes = loadQuizzes();
      quizzes.unshift(quiz);
      saveQuizzes(quizzes);
      return quiz;
    } catch (error) {
      console.error('Backend quiz generation failed, using fallback:', error);
      
      // Fallback to local generation
      await delay(100);
      const numQ = Math.min(config.numQuestions, sampleQuestions.length);
      const questions: Question[] = sampleQuestions.slice(0, numQ);

      const quiz: Quiz = {
        id: `quiz_${Date.now()}`,
        title: topic
          ? `${topic} Quiz`
          : `${sourceLabel.substring(0, 40)} Quiz`,
        topic: topic || 'General',
        difficulty: config.difficulty,
        mode: 'practice',
        source,
        sourceLabel,
        questions,
        config,
        createdAt: new Date().toISOString(),
      };

      const quizzes = loadQuizzes();
      quizzes.unshift(quiz);
      saveQuizzes(quizzes);
      return quiz;
    }
  },

  async getQuiz(id: string): Promise<Quiz | null> {
    await delay(300);
    const quizzes = loadQuizzes();
    return quizzes.find((q) => q.id === id) || null;
  },

  async getAllQuizzes(): Promise<Quiz[]> {
    await delay(300);
    return loadQuizzes();
  },

  async getResults(): Promise<QuizResult[]> {
    await delay(300);
    return loadResults();
  },

  async submitQuiz(result: QuizResult): Promise<QuizResult> {
    await delay(500);
    saveResult(result);
    return result;
  },
};
