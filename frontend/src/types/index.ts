export type Difficulty = 'easy' | 'medium' | 'hard' | 'adaptive';
export type QuizMode = 'practice' | 'exam' | 'adaptive' | 'challenge';
export type QuestionType = 'mcq' | 'truefalse' | 'shortanswer' | 'mixed';
export type InputSource = 'pdf' | 'topic' | 'text' | 'url';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  quizzesCompleted: number;
  averageScore: number;
  streak: number;
  xp: number;
  level: number;
  joinedAt: string;
  preferences: {
    defaultDifficulty: Difficulty;
    defaultQuestionCount: number;
    defaultQuestionType: QuestionType;
    notifications: {
      quizReminders: boolean;
      performanceReports: boolean;
      recommendations: boolean;
    };
  };
}

export interface Option {
  id: string;
  label: string;
  text: string;
}

export interface Question {
  id: string;
  type: 'mcq' | 'truefalse' | 'shortanswer';
  text: string;
  options: Option[];
  correctOptionId: string;
  explanation: string;
  topic: string;
  difficulty: Difficulty;
  sourceReference?: string;
}

export interface QuizConfig {
  numQuestions: number;
  difficulty: Difficulty;
  questionType: QuestionType;
  timeLimit: number; // minutes, 0 = no limit
  negativeMarking: boolean;
  explanationsEnabled: boolean;
  randomizeQuestions: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  difficulty: Difficulty;
  mode: QuizMode;
  source: InputSource;
  sourceLabel: string;
  questions: Question[];
  config: QuizConfig;
  createdAt: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  quizTitle: string;
  topic: string;
  difficulty: Difficulty;
  mode: QuizMode;
  date: string;
  score: number; // percentage
  correct: number;
  wrong: number;
  unanswered: number;
  total: number;
  timeTaken: number; // seconds
  accuracy: number;
  answers: AnswerRecord[];
}

export interface AnswerRecord {
  questionId: string;
  questionText: string;
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean;
  skipped: boolean;
  markedForReview: boolean;
  timeSpent: number;
  topic: string;
  difficulty: Difficulty;
  explanation: string;
  sourceReference?: string;
}

export interface Recommendation {
  id: string;
  type: 'weak_topic' | 'recommended_quiz' | 'revision';
  title: string;
  description: string;
  topic: string;
  difficulty?: Difficulty;
  questionCount?: number;
  actionLabel: string;
  accuracy?: number;
}

export interface TopicStat {
  topic: string;
  accuracy: number;
  attempted: number;
}

export interface AnalyticsData {
  performanceOverTime: { date: string; score: number }[];
  accuracyByTopic: TopicStat[];
  questionDistribution: { name: string; value: number; color: string }[];
  difficultyPerformance: { difficulty: string; accuracy: number }[];
  answerBreakdown: { name: string; value: number; color: string }[];
  metrics: {
    totalQuizzes: number;
    averageScore: number;
    accuracy: number;
    questionsSolved: number;
    studyStreak: number;
    bestScore: number;
  };
}
