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
  const { data, error } = await supabase
    .from('quiz_history')
    .select('*')
    .order('completed_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as HistoryRow[];
}

export async function saveHistory(row: Omit<HistoryRow, 'id' | 'completed_at'>): Promise<void> {
  const { error } = await supabase.from('quiz_history').insert([row]);
  if (error) throw error;
}

export async function clearHistory(): Promise<void> {
  const { error } = await supabase.from('quiz_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw error;
}
