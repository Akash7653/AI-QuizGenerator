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
import { filterSuggestions, generateQuiz } from '@/lib/quizEngine';
import type { Difficulty, QuestionType, QuizConfig, QuizQuestion, SourceType } from '@/types';

interface Props {
  onGenerate: (config: QuizConfig, questions: QuizQuestion[]) => void;
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

export function CreateQuiz({ onGenerate }: Props) {
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

  const suggestions = topic ? filterSuggestions(topic) : filterSuggestions('');

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
    // Simulate upload
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
    if (tab === 'topic') return topic.trim().length > 0;
    if (tab === 'pdf') return pdfStage === 'ready';
    if (tab === 'text') return pastedText.trim().length > 20;
    if (tab === 'url') return url.trim().length > 5;
    return false;
  };

  const getTopicLabel = (): string => {
    if (tab === 'topic') return topic.trim();
    if (tab === 'pdf') return fileName ?? 'Uploaded PDF';
    if (tab === 'text') return 'Pasted Text';
    if (tab === 'url') return 'Article URL';
    return '';
  };

  const handleGenerate = async () => {
    if (!canGenerate()) return;
    setGenerating(true);
    // Simulate AI generation latency
    await new Promise((r) => setTimeout(r, 1100));
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
    const questions = generateQuiz(config);
    setGenerating(false);
    onGenerate(config, questions);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Create a New Quiz</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">Choose a source — type a topic, upload a PDF, paste text, or enter an article URL.</p>
      </motion.div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="grid w-full grid-cols-4 rounded-xl">
          <TabsTrigger value="topic" className="rounded-lg"><Search className="mr-1.5 h-4 w-4" /> Topic</TabsTrigger>
          <TabsTrigger value="pdf" className="rounded-lg"><FileText className="mr-1.5 h-4 w-4" /> PDF</TabsTrigger>
          <TabsTrigger value="text" className="rounded-lg"><Type className="mr-1.5 h-4 w-4" /> Text</TabsTrigger>
          <TabsTrigger value="url" className="rounded-lg"><Link2 className="mr-1.5 h-4 w-4" /> URL</TabsTrigger>
        </TabsList>

        {/* Topic tab */}
        <TabsContent value="topic" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5 text-primary" /> Search a Topic</CardTitle>
              <CardDescription>What do you want to learn?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={topic}
                    onChange={(e) => { setTopic(e.target.value); setShowSuggest(true); setActiveSuggest(-1); }}
                    onFocus={() => setShowSuggest(true)}
                    onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
                    onKeyDown={handleTopicKey}
                    placeholder="What do you want to learn?"
                    className="h-12 rounded-xl pl-10 text-base"
                  />
                </div>
                <AnimatePresence>
                  {showSuggest && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
                    >
                      {suggestions.map((s, i) => (
                        <button
                          key={s}
                          onMouseDown={() => { setTopic(s); setShowSuggest(false); }}
                          className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors ${i === activeSuggest ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}`}
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
                {filterSuggestions('').slice(0, 6).map((s) => (
                  <button key={s} onClick={() => setTopic(s)} className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                    {s}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PDF tab */}
        <TabsContent value="pdf" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Upload a PDF</CardTitle>
              <CardDescription>We'll extract the text and generate questions based only on your document.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-accent/30'}`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FileUp className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Drag and drop your PDF here</p>
                  <p className="text-xs text-muted-foreground">or click to browse — PDF files only</p>
                </div>
                <Button type="button" variant="outline" className="mt-1" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  <Upload className="mr-2 h-4 w-4" /> Upload PDF
                </Button>
              </div>

              <AnimatePresence>
                {fileName && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="max-w-[200px] truncate text-sm font-medium sm:max-w-xs">{fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {pdfStage === 'ready' ? 'Text extracted — ready to generate' : pdfStage === 'extracting' ? 'Extracting text…' : 'Uploading…'}
                          </p>
                        </div>
                      </div>
                      {pdfStage === 'ready' ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setFileName(null); setPdfStage('idle'); setPdfProgress(0); }}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {pdfStage !== 'idle' && pdfStage !== 'ready' && (
                      <div className="space-y-1">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${pdfProgress}%` }} transition={{ duration: 0.3 }} />
                        </div>
                        <p className="text-xs text-muted-foreground">{pdfStage === 'uploading' ? 'Uploading file…' : 'Extracting text with PyMuPDF…'} {pdfProgress}%</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Text tab */}
        <TabsContent value="text" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Type className="h-5 w-5 text-primary" /> Paste Text</CardTitle>
              <CardDescription>Paste notes or an article and we'll build a quiz from it.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your study notes or article text here…"
                className="min-h-[180px] rounded-xl"
              />
              <p className="mt-2 text-xs text-muted-foreground">{pastedText.trim().length} characters</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* URL tab */}
        <TabsContent value="url" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5 text-primary" /> Article URL</CardTitle>
              <CardDescription>Enter a link to an article and we'll fetch the content.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="h-12 rounded-xl pl-10 text-base"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-primary" /> Quiz Settings</CardTitle>
          <CardDescription>Customize your quiz before generating</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Number of questions */}
          <SettingRow icon={ListOrdered} label="Number of Questions" tooltip="How many questions to generate">
            <div className="flex flex-wrap gap-2">
              {NUM_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setNumQuestions(n)}
                  className={`h-10 w-12 rounded-xl border text-sm font-semibold transition-all ${numQuestions === n ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'border-border hover:border-primary/40 hover:bg-accent/40'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </SettingRow>

          {/* Difficulty */}
          <SettingRow icon={Gauge} label="Difficulty" tooltip="Choose the challenge level">
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${difficulty === d ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'border-border hover:border-primary/40 hover:bg-accent/40'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </SettingRow>

          {/* Question type */}
          <SettingRow icon={HelpCircle} label="Question Type" tooltip="Format of the questions">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Q_TYPES.map((q) => (
                <button
                  key={q.value}
                  onClick={() => setQuestionType(q.value)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${questionType === q.value ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/40 hover:bg-accent/40'}`}
                >
                  <q.icon className={`h-5 w-5 ${questionType === q.value ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-xs font-semibold">{q.label}</span>
                  <span className="text-[10px] text-muted-foreground">{q.desc}</span>
                </button>
              ))}
            </div>
          </SettingRow>

          {/* Time limit */}
          <SettingRow icon={Clock} label="Time Limit" tooltip="Minutes to complete (0 = no limit)">
            <div className="flex flex-wrap gap-2">
              {TIME_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeLimit(t)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all ${timeLimit === t ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'border-border hover:border-primary/40 hover:bg-accent/40'}`}
                >
                  {t === 0 ? 'No limit' : `${t} min`}
                </button>
              ))}
            </div>
          </SettingRow>

          {/* Toggles */}
          <div className="grid gap-3 sm:grid-cols-3">
            <ToggleRow icon={Gauge} label="Adaptive Difficulty" desc="Adjusts as you answer" checked={adaptive} onChange={setAdaptive} />
            <ToggleRow icon={Lightbulb} label="Show Explanations" desc="Reveal answers after submit" checked={showExplanations} onChange={setShowExplanations} />
            <ToggleRow icon={Shuffle} label="Randomize Questions" desc="Shuffle question order" checked={randomize} onChange={setRandomize} />
          </div>
        </CardContent>
      </Card>

      {/* Generate */}
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
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={!canGenerate()}
              className="h-12 w-full rounded-xl text-base shadow-lg shadow-primary/30 sm:w-auto"
            >
              {generating ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating…</>
              ) : (
                <><Wand2 className="mr-2 h-5 w-5" /> Generate Quiz <ArrowRight className="ml-1 h-4 w-4" /></>
              )}
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
