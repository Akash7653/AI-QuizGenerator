import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, FileText, Link2, Type, Upload, Sparkles, X,
  CheckCircle2, FileUp, Loader2, Wand2, Settings2, Clock,
  ListOrdered, Gauge, HelpCircle, Shuffle, Lightbulb, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { filterSuggestions, generateQuiz, getTopicSuggestions } from '@/lib/quizEngine';
import { quizAPI } from '@/lib/api';
import { useThemeMode } from '@/hooks/use-theme-mode';
import type { Difficulty, QuestionType, QuizConfig, QuizQuestion, SourceType } from '@/types';

interface Props {
  onGenerate: (config: QuizConfig, questions: QuizQuestion[]) => void;
  userName?: string;
}

const NUM_OPTIONS = [5, 10, 15, 20];
const DIFFICULTIES: Difficulty[] = ['Beginner', 'Easy', 'Medium', 'Hard'];
const Q_TYPES: { label: string; value: QuestionType; icon: any; desc: string }[] = [
  { label: 'MCQ', value: 'MCQ', icon: ListOrdered, desc: 'Multiple choice' },
  { label: 'True/False', value: 'True/False', icon: CheckCircle2, desc: 'Binary answers' },
  { label: 'Short Answer', value: 'Short Answer', icon: Type, desc: 'Type the answer' },
  { label: 'Mixed', value: 'Mixed', icon: Shuffle, desc: 'Variety of types' },
];
const TIME_OPTIONS = [0, 5, 10, 15, 20];

export function CreateQuiz({ onGenerate, userName }: Props) {
  const { theme } = useThemeMode();
  const [tab, setTab] = useState<'topic' | 'pdf' | 'text' | 'url'>('topic');
  const [topic, setTopic] = useState('');
  const [showSuggest, setShowSuggest] = useState(false);
  const [activeSuggest, setActiveSuggest] = useState(-1);

  const [fileName, setFileName] = useState<string | null>(null);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfStage, setPdfStage] = useState<'idle' | 'uploading' | 'extracting' | 'ready'>('idle');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pastedText, setPastedText] = useState('');
  const [url, setUrl] = useState('');

  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [questionType, setQuestionType] = useState<QuestionType>('Mixed');
  const [timeLimit, setTimeLimit] = useState(10);
  const [adaptive, setAdaptive] = useState(true);
  const [showExplanations, setShowExplanations] = useState(true);
  const [randomize, setRandomize] = useState(true);
  const [generating, setGenerating] = useState(false);

  const defaultSuggestions = getTopicSuggestions();
  const normalizedTopic = topic.trim();
  const isCustomTopic = normalizedTopic.length > 0 && !defaultSuggestions.some((item) => item.toLowerCase() === normalizedTopic.toLowerCase());
  const suggestions = normalizedTopic ? [...new Set([...filterSuggestions(normalizedTopic), ...(isCustomTopic ? [normalizedTopic] : [])])] : filterSuggestions('');

  const handleTopicKey = (e: React.KeyboardEvent) => {
    if (!showSuggest) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveSuggest((i) => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveSuggest((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && activeSuggest >= 0) { e.preventDefault(); setTopic(suggestions[activeSuggest]); setShowSuggest(false); }
    else if (e.key === 'Escape') setShowSuggest(false);
  };

  const processPdf = useCallback(async (file: File) => {
    setFileName(file.name);
    setPdfStage('uploading');
    setPdfProgress(0);
    await animateProgress(30, 400, setPdfProgress);
    setPdfStage('extracting');
    await animateProgress(90, 700, setPdfProgress);
    setPdfProgress(100);
    setPdfStage('ready');
  }, []);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      return;
    }
    processPdf(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const canGenerate = (): boolean => {
    if (generating) return false;
    if (tab === 'topic') return normalizedTopic.length > 0;
    if (tab === 'pdf') return pdfStage === 'ready';
    if (tab === 'text') return pastedText.trim().length > 20;
    if (tab === 'url') return url.trim().length > 5;
    return false;
  };

  const getTopicLabel = (): string => {
    if (tab === 'topic') return normalizedTopic;
    if (tab === 'pdf') return fileName ?? 'Uploaded PDF';
    if (tab === 'text') return 'Pasted Text';
    if (tab === 'url') return 'Article URL';
    return '';
  };

  const mapGeneratedQuestions = (items: any[] = []): QuizQuestion[] =>
    items.map((item, index) => ({
      id: String(item.id ?? `api-${index}-${Date.now()}`),
      type: item.type === 'truefalse' ? 'truefalse' : item.type === 'short' ? 'short' : 'mcq',
      question: String(item.question ?? item.question_text ?? `Question ${index + 1}`),
      options: Array.isArray(item.options) && item.options.length ? item.options : ['True', 'False'],
      correctAnswer: String(item.correctAnswer ?? item.correct_answer ?? 'True'),
      explanation: String(item.explanation ?? 'Topic concept explanation.'),
      source: item.source ?? `AI-generated topic: ${normalizedTopic}`,
      topic: String(item.topic ?? normalizedTopic),
      difficulty: (item.difficulty as Difficulty) ?? difficulty,
    }));

  const handleGenerate = async () => {
    if (!canGenerate()) return;

    const config: QuizConfig = {
      topic: getTopicLabel(),
      sourceType: tab as SourceType,
      numQuestions,
      difficulty,
      questionType,
      timeLimit,
      adaptiveDifficulty: adaptive,
      showExplanations,
      randomizeQuestions: randomize,
      fileName: tab === 'pdf' ? fileName ?? undefined : undefined,
    };

    setGenerating(true);

    try {
      let questions: QuizQuestion[] = [];

      if (tab === 'topic' && isCustomTopic) {
        const response = await quizAPI.generateFromTopic({
          topic: normalizedTopic,
          difficulty,
          total_questions: numQuestions,
          question_type: questionType,
          time_limit: timeLimit,
          source_type: 'topic',
        });
        questions = mapGeneratedQuestions(response?.questions ?? []);
      } else {
        questions = generateQuiz(config);
      }

      if (!questions.length) {
        questions = generateQuiz(config);
      }

      onGenerate(config, questions);
    } catch (error) {
      console.error('[CreateQuiz] generation failed:', error);
      onGenerate(config, generateQuiz(config));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-24 lg:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className={`rounded-[30px] border p-6 shadow-[0_28px_80px_rgba(99,102,241,0.12)] backdrop-blur-xl ${theme === 'dark' ? 'border-violet-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950/30' : 'border-violet-200/80 bg-gradient-to-br from-white via-violet-50 to-blue-50'}`}
      >
        <p className={`mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${theme === 'dark' ? 'border-violet-500/30 bg-violet-500/10 text-violet-200' : 'border-violet-200 bg-violet-100 text-violet-700'}`}>
          <Sparkles className="h-3.5 w-3.5" /> AI Studio
        </p>
        <h1 className={`text-3xl font-black tracking-tight sm:text-4xl ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          {userName ? `${userName.split(' ')[0]}'s quiz studio` : 'Create a New Quiz'}
        </h1>
        <p className={`mt-2 text-sm sm:text-base ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
          Choose a source — type a topic, upload a PDF, paste text, or enter an article URL.
        </p>
      </motion.div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className={`grid w-full grid-cols-4 rounded-2xl border p-1.5 shadow-sm backdrop-blur ${theme === 'dark' ? 'border-slate-700/70 bg-slate-900/60' : 'border-slate-200/80 bg-white/80'}`}>
          <TabsTrigger value="topic" className="rounded-xl"><Search className="mr-1.5 h-4 w-4" /> Topic</TabsTrigger>
          <TabsTrigger value="pdf" className="rounded-xl"><FileText className="mr-1.5 h-4 w-4" /> PDF</TabsTrigger>
          <TabsTrigger value="text" className="rounded-xl"><Type className="mr-1.5 h-4 w-4" /> Text</TabsTrigger>
          <TabsTrigger value="url" className="rounded-xl"><Link2 className="mr-1.5 h-4 w-4" /> URL</TabsTrigger>
        </TabsList>

        <TabsContent value="topic" className="mt-4">
          <Card className={theme === 'dark' ? 'border-slate-700/70 bg-slate-900/60' : 'border-slate-200/80 bg-white/80'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5 text-primary" /> Search a Topic</CardTitle>
              <CardDescription>What do you want to learn?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                  <Input
                    value={topic}
                    onChange={(e) => { setTopic(e.target.value); setShowSuggest(true); setActiveSuggest(-1); }}
                    onFocus={() => setShowSuggest(true)}
                    onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
                    onKeyDown={handleTopicKey}
                    placeholder="What do you want to learn?"
                    className={`h-12 rounded-2xl pl-10 text-base ${theme === 'dark' ? 'border-slate-700 bg-slate-950/40 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`}
                  />
                </div>
                <AnimatePresence>
                  {showSuggest && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className={`absolute z-20 mt-1 w-full overflow-hidden rounded-2xl border shadow-xl ${theme === 'dark' ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}
                    >
                      {suggestions.map((s, i) => (
                        <button
                          key={s}
                          onMouseDown={() => { setTopic(s); setShowSuggest(false); }}
                          className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors ${i === activeSuggest ? 'bg-violet-500/10 text-violet-600 dark:text-violet-200' : theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                        >
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                          {s}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex flex-wrap gap-2">
                {defaultSuggestions.slice(0, 6).map((s) => (
                  <button key={s} onClick={() => setTopic(s)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${theme === 'dark' ? 'border-slate-700 bg-slate-800 text-slate-200 hover:border-violet-500/60 hover:text-violet-200' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-300 hover:text-violet-700'}`}>
                    {s}
                  </button>
                ))}
              </div>
              {isCustomTopic && (
                <div className={`rounded-xl border border-dashed px-3 py-2 text-xs ${theme === 'dark' ? 'border-violet-500/40 bg-violet-500/10 text-violet-200' : 'border-violet-300 bg-violet-50 text-violet-700'}`}>
                  Custom topic detected — Gemini will generate a quiz for this topic.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pdf" className="mt-4">
          <Card className={theme === 'dark' ? 'border-slate-700/70 bg-slate-900/60' : 'border-slate-200/80 bg-white/80'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Upload a PDF</CardTitle>
              <CardDescription>We'll extract the text and generate questions based only on your document.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
              <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${dragOver ? 'border-primary bg-primary/5' : theme === 'dark' ? 'border-slate-700 hover:border-violet-500/50 hover:bg-slate-800/70' : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50'}`}>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/20">
                  <FileUp className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Drag and drop your PDF here</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>or click to browse — PDF files only</p>
                </div>
                <Button type="button" variant="outline" className="mt-1" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  <Upload className="mr-2 h-4 w-4" /> Upload PDF
                </Button>
              </div>

              <AnimatePresence>
                {fileName && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                    <div className={`flex items-center justify-between rounded-xl border p-3 ${theme === 'dark' ? 'border-slate-700 bg-slate-950/40' : 'border-slate-200 bg-slate-50'}`}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-white">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="max-w-[200px] truncate text-sm font-medium sm:max-w-xs">{fileName}</p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                            {pdfStage === 'ready' ? 'Text extracted — ready to generate' : pdfStage === 'extracting' ? 'Extracting text…' : 'Uploading…'}
                          </p>
                        </div>
                      </div>
                      {pdfStage === 'ready' ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setFileName(null); setPdfStage('idle'); setPdfProgress(0); }}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {pdfStage !== 'idle' && pdfStage !== 'ready' && (
                      <div className="space-y-1">
                        <div className={`h-2 w-full overflow-hidden rounded-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}>
                          <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500" animate={{ width: `${pdfProgress}%` }} transition={{ duration: 0.3 }} />
                        </div>
                        <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{pdfStage === 'uploading' ? 'Uploading file…' : 'Extracting text with PyMuPDF…'} {pdfProgress}%</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="text" className="mt-4">
          <Card className={theme === 'dark' ? 'border-slate-700/70 bg-slate-900/60' : 'border-slate-200/80 bg-white/80'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Type className="h-5 w-5 text-primary" /> Paste Text</CardTitle>
              <CardDescription>Paste notes or an article and we'll build a quiz from it.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea value={pastedText} onChange={(e) => setPastedText(e.target.value)} placeholder="Paste your study notes or article text here…" className={`min-h-[180px] rounded-2xl ${theme === 'dark' ? 'border-slate-700 bg-slate-950/40 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`} />
              <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{pastedText.trim().length} characters</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="url" className="mt-4">
          <Card className={theme === 'dark' ? 'border-slate-700/70 bg-slate-900/60' : 'border-slate-200/80 bg-white/80'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5 text-primary" /> Article URL</CardTitle>
              <CardDescription>Enter a link to an article and we'll fetch the content.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Link2 className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/article" className={`h-12 rounded-2xl pl-10 text-base ${theme === 'dark' ? 'border-slate-700 bg-slate-950/40 text-white' : 'border-slate-200 bg-slate-50 text-slate-900'}`} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className={theme === 'dark' ? 'border-slate-700/70 bg-slate-900/60' : 'border-slate-200/80 bg-white/80'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-primary" /> Quiz Settings</CardTitle>
          <CardDescription>Customize your quiz before generating</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SettingRow icon={ListOrdered} label="Number of Questions" tooltip="How many questions to generate">
            <div className="flex flex-wrap gap-2">
              {NUM_OPTIONS.map((n) => (
                <button key={n} onClick={() => setNumQuestions(n)} className={`h-10 w-12 rounded-xl border text-sm font-semibold transition-all ${numQuestions === n ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20' : theme === 'dark' ? 'border-slate-700 hover:border-violet-500/60 hover:bg-slate-800' : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50'}`}>
                  {n}
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow icon={Gauge} label="Difficulty" tooltip="Choose the challenge level">
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map((d) => (
                <button key={d} onClick={() => setDifficulty(d)} className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${difficulty === d ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20' : theme === 'dark' ? 'border-slate-700 hover:border-violet-500/60 hover:bg-slate-800' : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50'}`}>
                  {d}
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow icon={HelpCircle} label="Question Type" tooltip="Format of the questions">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Q_TYPES.map((q) => (
                <button key={q.value} onClick={() => setQuestionType(q.value)} className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${questionType === q.value ? 'border-primary bg-primary/5 shadow-sm' : theme === 'dark' ? 'border-slate-700 hover:border-violet-500/60 hover:bg-slate-800' : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50'}`}>
                  <q.icon className={`h-5 w-5 ${questionType === q.value ? 'text-primary' : theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-semibold">{q.label}</span>
                  <span className={`text-[10px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{q.desc}</span>
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow icon={Clock} label="Time Limit" tooltip="Minutes to complete (0 = no limit)">
            <div className="flex flex-wrap gap-2">
              {TIME_OPTIONS.map((t) => (
                <button key={t} onClick={() => setTimeLimit(t)} className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all ${timeLimit === t ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20' : theme === 'dark' ? 'border-slate-700 hover:border-violet-500/60 hover:bg-slate-800' : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50'}`}>
                  {t === 0 ? 'No limit' : `${t} min`}
                </button>
              ))}
            </div>
          </SettingRow>

          <div className="grid gap-3 sm:grid-cols-3">
            <ToggleRow icon={Gauge} label="Adaptive Difficulty" desc="Adjusts as you answer" checked={adaptive} onChange={setAdaptive} />
            <ToggleRow icon={Lightbulb} label="Show Explanations" desc="Reveal answers after submit" checked={showExplanations} onChange={setShowExplanations} />
            <ToggleRow icon={Shuffle} label="Randomize Questions" desc="Shuffle question order" checked={randomize} onChange={setRandomize} />
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 z-30">
        <Card className="border-primary/30 shadow-xl shadow-primary/10">
          <CardContent className="flex flex-col items-center justify-between gap-4 p-4 sm:flex-row">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{getTopicLabel() || 'No source selected'}</Badge>
              <Badge variant="outline">{numQuestions} Q</Badge>
              <Badge variant="outline">{difficulty}</Badge>
              <Badge variant="outline">{questionType}</Badge>
              {timeLimit > 0 && <Badge variant="outline">{timeLimit} min</Badge>}
            </div>
            <Button size="lg" onClick={handleGenerate} disabled={!canGenerate()} className="h-12 w-full rounded-xl text-base shadow-lg shadow-primary/30 sm:w-auto">
              {generating ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating…</>) : (<><Wand2 className="mr-2 h-5 w-5" /> Generate Quiz <ArrowRight className="ml-1 h-4 w-4" /></>)}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SettingRow({ icon: Icon, label, tooltip, children }: { icon: any; label: string; tooltip: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm font-semibold">{label}</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground/60 hover:text-muted-foreground"><HelpCircle className="h-3.5 w-3.5" /></button>
            </TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ icon: Icon, label, desc, checked, onChange }: { icon: any; label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-[11px] text-muted-foreground">{desc}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function animateProgress(target: number, duration: number, set: (n: number) => void): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      set(Math.round(target * p));
      if (p < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}
