export type Difficulty = 'Beginner' | 'Easy' | 'Medium' | 'Hard';
export type QuestionType = 'MCQ' | 'True/False' | 'Short Answer' | 'Mixed';
export type SourceType = 'topic' | 'pdf' | 'text' | 'url';

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'truefalse' | 'short';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  source?: string;
  topic: string;
  difficulty: Difficulty;
}

export interface QuizConfig {
  topic: string;
  sourceType: SourceType;
  numQuestions: number;
  difficulty: Difficulty;
  questionType: QuestionType;
  timeLimit: number; // minutes, 0 = no limit
  adaptiveDifficulty: boolean;
  showExplanations: boolean;
  randomizeQuestions: boolean;
  fileName?: string;
}

export interface QuizResult {
  id: string;
  topic: string;
  sourceType: SourceType;
  score: number;
  totalQuestions: number;
  difficulty: Difficulty;
  questionType: QuestionType;
  timeTaken: number; // seconds
  completedAt: string;
  answers: QuizAnswer[];
  questions: QuizQuestion[];
}

export interface QuizAnswer {
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  source?: string;
  topic: string;
  difficulty: Difficulty;
}

export type View =
  | { name: 'landing' }
  | { name: 'auth' }
  | { name: 'dashboard' }
  | { name: 'create' }
  | { name: 'documents' }
  | { name: 'analytics' }
  | { name: 'learning' }
  | { name: 'recommendations' }
  | { name: 'settings' }
  | { name: 'quiz'; config: QuizConfig; questions: QuizQuestion[] }
  | { name: 'results'; result: QuizResult };
