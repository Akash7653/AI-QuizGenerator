import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, History as HistoryIcon, Eye,
  Calendar, Clock, ListChecks,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/States';
import { formatDate, getDifficultyColor, getScoreColor, formatTime } from '@/lib/utils';
import { api } from '@/services/api';
import { loadResults } from '@/services/quizService';
import type { Difficulty, QuizMode } from '@/types';

type SortBy = 'date' | 'score' | 'topic';

export function HistoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [modeFilter, setModeFilter] = useState<QuizMode | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [quizHistory, setQuizHistory] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      try {
        const response = await api.get('/quiz/history');
        if (cancelled) return;
        const data = Array.isArray(response.data) ? response.data : [];
        const localResults = loadResults();
        const mappedLocalResults = localResults.map((result, index) => ({
          id: String(result.id ?? `local-history-${index}`),
          quizId: String(result.quizId ?? result.id ?? `local-history-${index}`),
          quizTitle: result.quizTitle || 'Quiz',
          topic: result.topic || 'General',
          difficulty: String(result.difficulty || 'medium').toLowerCase(),
          mode: String(result.mode || 'practice').toLowerCase(),
          date: result.date || new Date().toISOString(),
          score: Number(result.score ?? 0),
          correct: Number(result.correct ?? 0),
          wrong: Number(result.wrong ?? 0),
          unanswered: Number(result.unanswered ?? 0),
          total: Number(result.total ?? 0),
          timeTaken: Number(result.timeTaken ?? 0),
          accuracy: Number(result.accuracy ?? result.score ?? 0),
        }));
        const mergedHistory = [...data.map((item: any, index: number) => ({
          id: String(item.id ?? `history-${index}`),
          quizId: String(item.quiz_id ?? item.id ?? `history-${index}`),
          quizTitle: item.topic || item.quiz_title || 'Quiz',
          topic: item.topic || 'General',
          difficulty: String(item.difficulty || 'medium').toLowerCase(),
          mode: String(item.mode || 'practice').toLowerCase(),
          date: item.completed_at ? new Date(Number(item.completed_at) * 1000).toISOString() : new Date().toISOString(),
          score: Number(item.percentage ?? 0),
          correct: Number(item.correct_count ?? 0),
          wrong: Number(item.wrong_count ?? 0),
          unanswered: 0,
          total: Number(item.total_questions ?? item.max_score ?? 0),
          timeTaken: Number(item.time_taken ?? 0),
          accuracy: Number(item.percentage ?? 0),
        })), ...mappedLocalResults].filter((item, index, arr) => arr.findIndex((candidate) => candidate.id === item.id) === index);
        setQuizHistory(mergedHistory);
      } catch {
        if (!cancelled) setQuizHistory(loadResults().map((result, index) => ({
          id: String(result.id ?? `local-history-${index}`),
          quizId: String(result.quizId ?? result.id ?? `local-history-${index}`),
          quizTitle: result.quizTitle || 'Quiz',
          topic: result.topic || 'General',
          difficulty: String(result.difficulty || 'medium').toLowerCase(),
          mode: String(result.mode || 'practice').toLowerCase(),
          date: result.date || new Date().toISOString(),
          score: Number(result.score ?? 0),
          correct: Number(result.correct ?? 0),
          wrong: Number(result.wrong ?? 0),
          unanswered: Number(result.unanswered ?? 0),
          total: Number(result.total ?? 0),
          timeTaken: Number(result.timeTaken ?? 0),
          accuracy: Number(result.accuracy ?? result.score ?? 0),
        })));
      }
    };

    void loadHistory();
    const onResultsUpdate = () => {
      void loadHistory();
    };
    window.addEventListener('quiz-results-updated', onResultsUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener('quiz-results-updated', onResultsUpdate);
    };
  }, []);

  const filtered = useMemo(() => {
    let result = [...quizHistory];
    if (search) {
      result = result.filter((q) =>
        q.quizTitle.toLowerCase().includes(search.toLowerCase()) ||
        q.topic.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (difficultyFilter !== 'all') {
      result = result.filter((q) => q.difficulty === difficultyFilter);
    }
    if (modeFilter !== 'all') {
      result = result.filter((q) => q.mode === modeFilter);
    }
    result.sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'topic') return a.topic.localeCompare(b.topic);
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    return result;
  }, [search, difficultyFilter, modeFilter, sortBy]);

  const difficulties: (Difficulty | 'all')[] = ['all', 'easy', 'medium', 'hard'];
  const modes: (QuizMode | 'all')[] = ['all', 'practice', 'exam', 'adaptive', 'challenge'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <PageHeader
        title="Quiz History"
        subtitle="Review your past quiz attempts and performance"
        icon={<HistoryIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />}
      />

      {/* Search & filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="Search by quiz title or topic..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="input cursor-pointer"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as Difficulty | 'all')}
            >
              {difficulties.map((d) => (
                <option key={d} value={d}>{d === 'all' ? 'All Difficulties' : d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
            <select
              className="input cursor-pointer"
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value as QuizMode | 'all')}
            >
              {modes.map((m) => (
                <option key={m} value={m}>{m === 'all' ? 'All Modes' : m.charAt(0).toUpperCase() + m.slice(1)}</option>
              ))}
            </select>
            <select
              className="input cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
            >
              <option value="date">Sort: Date</option>
              <option value="score">Sort: Score</option>
              <option value="topic">Sort: Topic</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No quizzes found"
          description="Try adjusting your search or filters to find past quizzes."
          actionLabel="Create Your First Quiz"
          actionTo="/create-quiz"
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block card overflow-hidden">
            <table className="w-full">
              <thead className="bg-ink-50 dark:bg-ink-800/50">
                <tr className="text-left text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Quiz</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Difficulty</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Accuracy</th>
                  <th className="px-4 py-3">Questions</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                {filtered.map((quiz, i) => (
                  <motion.tr
                    key={quiz.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-ink-50 dark:hover:bg-ink-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-ink-900 dark:text-white text-sm">{quiz.quizTitle}</p>
                      <p className="text-xs text-ink-500">{quiz.topic}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-ink-600 dark:text-ink-300">{formatDate(quiz.date)}</td>
                    <td className="px-4 py-4">
                      <Badge variant="default" className={getDifficultyColor(quiz.difficulty)}>{quiz.difficulty}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="brand">{quiz.mode}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-lg font-extrabold ${getScoreColor(quiz.score)}`}>{quiz.score}%</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-ink-600 dark:text-ink-300">{quiz.accuracy}%</td>
                    <td className="px-4 py-4 text-sm text-ink-600 dark:text-ink-300">{quiz.correct}/{quiz.total}</td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => navigate(`/quiz/${quiz.quizId}/results`, { state: { result: quiz } })}
                        className="btn-ghost px-3 py-1.5 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map((quiz, i) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-ink-900 dark:text-white text-sm truncate">{quiz.quizTitle}</h3>
                    <p className="text-xs text-ink-500 mt-0.5">{quiz.topic}</p>
                  </div>
                  <span className={`text-2xl font-extrabold ${getScoreColor(quiz.score)}`}>{quiz.score}%</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="default" className={getDifficultyColor(quiz.difficulty)}>{quiz.difficulty}</Badge>
                  <Badge variant="brand">{quiz.mode}</Badge>
                  <span className="text-xs text-ink-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(quiz.date)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-ink-500 mb-3">
                  <span className="flex items-center gap-1"><ListChecks className="w-3.5 h-3.5" /> {quiz.correct}/{quiz.total} correct</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatTime(quiz.timeTaken)}</span>
                  <span>Accuracy: {quiz.accuracy}%</span>
                </div>
                <button
                  onClick={() => navigate(`/quiz/${quiz.quizId}/results`, { state: { result: quiz } })}
                  className="w-full py-2 rounded-xl bg-ink-50 dark:bg-ink-800 text-sm font-medium text-ink-700 dark:text-ink-200 hover:bg-brand-50 dark:hover:bg-brand-900/30 hover:text-brand-700 dark:hover:text-brand-300 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-4 h-4" /> View Results
                </button>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
