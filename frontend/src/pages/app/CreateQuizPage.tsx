import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  FileText, StickyNote, Type, Link2, Upload, X, Sparkles,
  Settings2, Clock, AlertCircle, Shuffle, BookOpen, Target,
  CheckCircle2, FileCheck2,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { quizService } from '@/services/quizService';
import type { InputSource, QuizConfig, Difficulty, QuestionType } from '@/types';

const inputTabs: { id: InputSource; label: string; icon: typeof FileText; desc: string }[] = [
  { id: 'pdf', label: 'Upload PDF', icon: FileText, desc: 'Drag and drop or browse' },
  { id: 'topic', label: 'Enter Topic', icon: Type, desc: 'Type a subject' },
  { id: 'text', label: 'Paste Text', icon: StickyNote, desc: 'Paste your notes' },
  { id: 'url', label: 'Article URL', icon: Link2, desc: 'Paste a link' },
];

const difficulties: { id: Difficulty; label: string }[] = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
  { id: 'adaptive', label: 'Adaptive' },
];

const questionTypes: { id: QuestionType; label: string }[] = [
  { id: 'mcq', label: 'MCQ' },
  { id: 'truefalse', label: 'True/False' },
  { id: 'shortanswer', label: 'Short Answer' },
  { id: 'mixed', label: 'Mixed' },
];

export function CreateQuizPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<InputSource>('topic');
  const [topic, setTopic] = useState('');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [genStage, setGenStage] = useState(0);
  const suggestedTopics = ['Data Structures', 'Python', 'Machine Learning', 'JavaScript', 'World History', 'Biology'];

  const [config, setConfig] = useState<QuizConfig>({
    numQuestions: 10,
    difficulty: 'medium',
    questionType: 'mcq',
    timeLimit: 15,
    negativeMarking: false,
    explanationsEnabled: true,
    randomizeQuestions: false,
  });

  const stages = [
    { label: 'Reading content', icon: BookOpen },
    { label: 'Understanding topics', icon: Sparkles },
    { label: 'Extracting concepts', icon: Target },
    { label: 'Generating questions', icon: FileCheck2 },
    { label: 'Validating questions', icon: CheckCircle2 },
    { label: 'Preparing quiz', icon: Settings2 },
  ];

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile({ name: droppedFile.name, size: droppedFile.size });
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((p) => {
          if (p >= 100) { clearInterval(interval); return 100; }
          return p + 10;
        });
      }, 100);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile({ name: selected.name, size: selected.size });
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((p) => {
          if (p >= 100) { clearInterval(interval); return 100; }
          return p + 10;
        });
      }, 100);
    }
  };

  const canGenerate = () => {
    switch (activeTab) {
      case 'pdf': return file !== null && uploadProgress === 100;
      case 'topic': return topic.trim().length > 0;
      case 'text': return text.trim().length > 20;
      case 'url': return url.trim().startsWith('http');
    }
  };

  const getSourceLabel = () => {
    switch (activeTab) {
      case 'pdf': return file?.name || 'PDF';
      case 'topic': return topic;
      case 'text': return 'Pasted text';
      case 'url': return url;
    }
  };

  useEffect(() => {
    if (generating) {
      sessionStorage.setItem('quizgen_generating', '1');
      return () => sessionStorage.removeItem('quizgen_generating');
    }
    sessionStorage.removeItem('quizgen_generating');
  }, [generating]);

  const handleGenerate = async () => {
    if (!canGenerate()) {
      toast.error('Please provide your input source first');
      return;
    }
    setGenerating(true);
    setGenStage(0);

    // Animate through stages
    for (let i = 0; i < stages.length; i++) {
      setGenStage(i);
      await new Promise((r) => setTimeout(r, 800));
    }

    try {
      const quiz = await quizService.generateQuiz(
        activeTab,
        getSourceLabel(),
        topic || 'General',
        config,
      );
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      toast.success('Quiz generated successfully!');
      navigate(`/quiz/${quiz.id}`);
    } catch {
      toast.error('Failed to generate quiz. Please try again.');
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-ink-50 dark:bg-ink-950 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-6 sm:p-8"
          >
            <div className="relative w-24 h-24 mx-auto mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-4 border-brand-200 dark:border-brand-900"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-2 rounded-full border-4 border-transparent border-t-brand-600"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-brand-600 dark:text-brand-400" />
              </div>
            </div>

            <h2 className="text-2xl font-extrabold text-center text-ink-900 dark:text-white mb-2">AI is analyzing your content...</h2>
            <p className="text-center text-ink-500 dark:text-ink-400 mb-8">This usually takes a few seconds</p>

            <div className="space-y-3 text-left">
              {stages.map((stage, i) => {
                const status = i < genStage ? 'done' : i === genStage ? 'active' : 'pending';
                return (
                  <motion.div
                    key={stage.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: status === 'pending' ? 0.4 : 1, x: 0 }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      status === 'active' ? 'bg-brand-50 dark:bg-brand-900/30' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      status === 'done' ? 'bg-success-500 text-white' :
                      status === 'active' ? 'bg-brand-600 text-white' :
                      'bg-ink-100 dark:bg-ink-800 text-ink-400'
                    }`}>
                      {status === 'done' ? <CheckCircle2 className="w-5 h-5" /> :
                       status === 'active' ? <stage.icon className="w-4 h-4 animate-pulse" /> :
                       <stage.icon className="w-4 h-4" />}
                    </div>
                    <span className={`text-sm font-medium ${
                      status === 'done' ? 'text-ink-600 dark:text-ink-400' :
                      status === 'active' ? 'text-brand-700 dark:text-brand-300' :
                      'text-ink-400'
                    }`}>{stage.label}</span>
                    {status === 'active' && (
                      <div className="ml-auto flex gap-1">
                        {[0, 1, 2].map((d) => (
                          <motion.div
                            key={d}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                            className="w-1.5 h-1.5 rounded-full bg-brand-500"
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-xs text-ink-500 mb-1">
                <span>Progress</span>
                <span>{Math.round(((genStage + 1) / stages.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-brand-500 to-brand-700 rounded-full"
                  animate={{ width: `${((genStage + 1) / stages.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-5 sm:p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-ink-900 dark:text-white">Quiz Preview</h3>
                <span className="chip bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300">{config.questionType.toUpperCase()}</span>
              </div>

              <div className="rounded-2xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900/60 p-4 mb-5">
                <p className="text-xs uppercase tracking-wide text-ink-500 mb-2">Source</p>
                <p className="text-sm font-semibold text-ink-800 dark:text-ink-200 break-words">{getSourceLabel()}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-500">Questions</span>
                  <span className="font-bold text-ink-800 dark:text-ink-200">{config.numQuestions}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-500">Difficulty</span>
                  <span className="font-bold text-ink-800 dark:text-ink-200">{config.difficulty}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-500">Time limit</span>
                  <span className="font-bold text-ink-800 dark:text-ink-200">{config.timeLimit} min</span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/30 dark:to-brand-800/20 p-4 border border-brand-200 dark:border-brand-800">
              <p className="text-xs uppercase tracking-wide text-brand-700 dark:text-brand-300 mb-2">Sample question</p>
              <p className="text-sm leading-relaxed text-ink-700 dark:text-ink-200">
                {topic || 'Your selected topic'} will be turned into a curated quiz with mixed difficulty and explanation-based answers.
              </p>
            </div>
          </motion.aside>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <PageHeader
        title="Create a New Quiz"
        subtitle="Choose your input source and configure quiz settings"
        icon={<Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400" />}
      />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input section */}
        <div className="lg:col-span-3 space-y-4">
          {/* Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {inputTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  activeTab === tab.id
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                    : 'border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 hover:border-brand-300'
                }`}
              >
                <tab.icon className="w-5 h-5 mx-auto mb-1.5" />
                <p className="text-xs font-semibold">{tab.label}</p>
              </button>
            ))}
          </div>

          {/* Input content */}
          <div className="card p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'pdf' && (
                  <div>
                    {file ? (
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-ink-50 dark:bg-ink-800/50">
                        <div className="w-12 h-12 rounded-xl bg-error-100 dark:bg-error-900/30 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-error-600 dark:text-error-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-ink-900 dark:text-white truncate">{file.name}</p>
                          <p className="text-xs text-ink-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          {uploadProgress < 100 ? (
                            <div className="mt-2 h-1.5 bg-ink-200 dark:bg-ink-700 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                            </div>
                          ) : (
                            <p className="text-xs text-success-600 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Uploaded</p>
                          )}
                        </div>
                        <button onClick={() => { setFile(null); setUploadProgress(0); }} className="p-2 rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        onDrop={handleFileDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="flex flex-col items-center justify-center border-2 border-dashed border-ink-300 dark:border-ink-700 rounded-2xl py-12 px-4 cursor-pointer hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-colors"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-4">
                          <Upload className="w-7 h-7 text-brand-600 dark:text-brand-400" />
                        </div>
                        <p className="text-sm font-semibold text-ink-900 dark:text-white">Drag and drop your PDF here</p>
                        <p className="text-xs text-ink-500 mt-1">or click to browse · Max 10MB</p>
                        <input type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
                      </label>
                    )}
                  </div>
                )}

                {activeTab === 'topic' && (
                  <div>
                    <label className="label">Topic or Subject</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Machine Learning, Data Structures, World War II..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />

                    <div className="mt-4 flex flex-wrap gap-2">
                      {suggestedTopics.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => setTopic(suggestion)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                            topic === suggestion
                              ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-900/30 dark:text-brand-300'
                              : 'border-ink-200 text-ink-600 hover:border-brand-300 hover:text-brand-600 dark:border-ink-700 dark:text-ink-300 dark:hover:border-brand-400 dark:hover:text-brand-300'
                          }`}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>

                    <p className="text-xs text-ink-500 mt-2">Our AI will generate questions based on this topic.</p>
                  </div>
                )}

                {activeTab === 'text' && (
                  <div>
                    <label className="label">Paste your text or notes</label>
                    <textarea
                      className="input min-h-[200px] resize-y"
                      placeholder="Paste your study material, lecture notes, or any text content here..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                    <p className="text-xs text-ink-500 mt-2">{text.length} characters · Minimum 20 required</p>
                  </div>
                )}

                {activeTab === 'url' && (
                  <div>
                    <label className="label">Article URL</label>
                    <input
                      type="url"
                      className="input"
                      placeholder="https://example.com/article"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                    <p className="text-xs text-ink-500 mt-2">We'll extract content from the article and generate questions.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Config section */}
        <div className="lg:col-span-2">
          <div className="card p-6 sticky top-20">
            <div className="flex items-center gap-2 mb-5">
              <Settings2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h3 className="font-bold text-ink-900 dark:text-white">Quiz Configuration</h3>
            </div>

            <div className="space-y-5">
              {/* Number of questions */}
              <div>
                <label className="label">Number of Questions: <span className="text-brand-600 font-bold">{config.numQuestions}</span></label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="5"
                  value={config.numQuestions}
                  onChange={(e) => setConfig({ ...config, numQuestions: parseInt(e.target.value) })}
                  className="w-full accent-brand-600"
                />
                <div className="flex justify-between text-xs text-ink-400 mt-1">
                  <span>5</span><span>10</span><span>15</span><span>20</span>
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="label">Difficulty</label>
                <div className="grid grid-cols-2 gap-2">
                  {difficulties.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setConfig({ ...config, difficulty: d.id })}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                        config.difficulty === d.id
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                          : 'border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 hover:border-brand-300'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question type */}
              <div>
                <label className="label">Question Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {questionTypes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setConfig({ ...config, questionType: t.id })}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                        config.questionType === t.id
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                          : 'border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 hover:border-brand-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time limit */}
              <div>
                <label className="label flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Time Limit (minutes)</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  className="input"
                  value={config.timeLimit}
                  onChange={(e) => setConfig({ ...config, timeLimit: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-ink-400 mt-1">Set to 0 for no time limit</p>
              </div>

              {/* Toggles */}
              <div className="space-y-2.5">
                {[
                  { key: 'negativeMarking' as const, label: 'Negative marking', icon: AlertCircle },
                  { key: 'explanationsEnabled' as const, label: 'Show explanations', icon: BookOpen },
                  { key: 'randomizeQuestions' as const, label: 'Randomize questions', icon: Shuffle },
                ].map((toggle) => (
                  <label key={toggle.key} className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-ink-700 dark:text-ink-300 flex items-center gap-2">
                      <toggle.icon className="w-4 h-4 text-ink-400" /> {toggle.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, [toggle.key]: !config[toggle.key] })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        config[toggle.key] ? 'bg-brand-600' : 'bg-ink-200 dark:bg-ink-700'
                      }`}
                    >
                      <motion.div
                        animate={{ x: config[toggle.key] ? 22 : 2 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                      />
                    </button>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!canGenerate()}
              className="btn-primary w-full py-3 mt-6 text-base"
            >
              <Sparkles className="w-5 h-5" /> Generate Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
