import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface HistoryRow {
  id: string;
  topic: string;
  source_type: SourceType;
  score: number;
  total_questions: number;
  difficulty: string;
  question_type: string;
  time_taken: number;
  completed_at: string;
}

type SourceType = 'topic' | 'pdf' | 'text' | 'url';

export async function fetchHistory(): Promise<HistoryRow[]> {
  // Fetch quiz history from backend API - only real user data, no test data
  const { quizAPI } = await import('./api');
  try {
    console.log('[fetchHistory] Fetching user quiz history from backend...');
    const data = await quizAPI.getHistory(0, 50);
    console.log('[fetchHistory] Backend response:', data);
    
    if (!data || data.length === 0) {
      console.log('[fetchHistory] No quiz history found for this user');
      return [];
    }
    
    // Map backend response to HistoryRow format
    const mapped = data.map((attempt: any) => {
      // Calculate score from total_score or percentage
      let score = 0;
      if (attempt.total_score !== undefined) {
        score = Math.round(attempt.total_score);
      } else if (attempt.percentage !== undefined) {
        score = Math.round((attempt.percentage / 100) * (attempt.total_questions || 10));
      }
      
      // Handle completed_at timestamp
      let completedAt = new Date().toISOString();
      if (attempt.completed_at) {
        if (typeof attempt.completed_at === 'number') {
          const timestamp = attempt.completed_at < 10000000000 ? attempt.completed_at * 1000 : attempt.completed_at;
          completedAt = new Date(timestamp).toISOString();
        } else if (typeof attempt.completed_at === 'string') {
          completedAt = new Date(attempt.completed_at).toISOString();
        }
      }
      
      return {
        id: attempt.id?.toString() || Math.random().toString(),
        topic: attempt.topic || 'Quiz',
        source_type: (attempt.source_type || 'topic') as SourceType,
        score: score,
        total_questions: attempt.total_questions || 10,
        difficulty: attempt.difficulty || 'Medium',
        question_type: attempt.question_type || 'Mixed',
        time_taken: attempt.time_taken || 0,
        completed_at: completedAt,
      };
    });
    
    return mapped;
  } catch (error) {
    console.error('[fetchHistory] Error fetching user data:', error);
    return [];
  }
}

export async function saveHistory(row: Omit<HistoryRow, 'id' | 'completed_at'>): Promise<void> {
  // Save quiz attempt to backend API instead of Supabase
  const { quizAPI } = await import('./api');
  try {
    console.log('[saveHistory] Saving quiz attempt to backend:', row);
    
    // Call the backend endpoint to save quiz attempt
    // The backend will automatically associate it with the authenticated user
    const result = await quizAPI.quickSaveQuiz({
      topic: row.topic,
      source_type: row.source_type,
      score: row.score,
      total_questions: row.total_questions,
      difficulty: row.difficulty,
      question_type: row.question_type,
      time_taken: row.time_taken,
    });
    
    console.log('[saveHistory] Quiz attempt saved successfully:', result);
  } catch (error) {
    console.error('[saveHistory] Failed to save quiz attempt:', error);
    throw error;
  }
}

export async function clearHistory(): Promise<void> {
  // Clear user's quiz history via backend API
  const { quizAPI } = await import('./api');
  try {
    console.log('[clearHistory] Clearing quiz history...');
    // Note: You may need to add a clearHistory endpoint to the backend API
    // For now, this is a placeholder
    console.log('[clearHistory] Clear history not yet implemented in backend');
  } catch (error) {
    console.error('[clearHistory] Failed to clear history:', error);
    throw error;
  }
}
