import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader } from 'lucide-react';
import { useThemeMode } from '@/hooks/use-theme-mode';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function Chatbot() {
  const { theme } = useThemeMode();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 Hi! I\'m QuizBot, your AI learning assistant powered by Gemini. I can help you with study tips, quiz preparation, and answer your questions about any topic.',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInputText = input;
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/v1/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: userInputText,
          conversation_id: `chat_${Date.now()}`,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail = data?.detail || data?.error || data?.message || 'Failed to get response';
        throw new Error(detail);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Sorry, I couldn\'t process that. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const messageText = error instanceof Error
        ? error.message
        : '❌ Sorry, I encountered an error. Please check your connection and try again.';

      let friendlyMessage = '';
      if (messageText.includes('Not authenticated')) {
        friendlyMessage = '🔐 You need to sign in again before using the AI chat.';
      } else if (messageText.includes('API key') || messageText.includes('Gemini')) {
        friendlyMessage = '🧠 QuizGen — Your AI-Powered Quiz Platform\n\nQuizGen helps you create personalized quizzes instantly from:\n\n📚 Topics: Search any subject (Physics, Python, Machine Learning, etc.)\n📄 PDFs: Upload your study notes and textbooks\n📝 Text: Paste articles or study materials\n🔗 URLs: Share links to any article\n\n✨ Smart Features:\n• AI-generated questions with multiple formats\n• Adaptive difficulty levels\n• Progress tracking & analytics\n• Detailed explanations for every answer\n• Weak topic detection\n• Personalized learning paths\n\n🚀 Get Started: Click "Create Quiz" to generate your first quiz!\n\n💡 Pro Tip: Use the Dashboard to track your learning progress and get recommendations.';
      } else {
        friendlyMessage = '❌ Network error detected. Please check your connection and try again.';
      }

      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: friendlyMessage,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-20 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-200 lg:bottom-8 font-bold',
          theme === 'dark'
            ? 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white hover:shadow-purple-500/60'
            : 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white hover:shadow-purple-500/50'
        )}
        whileHover={{ scale: 1.15, rotate: 5 }}
        whileTap={{ scale: 0.88 }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        aria-label="Open chat"
      >
        {isOpen ? (
          <motion.div
            initial={{ rotate: -90, scale: 0.5 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <X size={24} strokeWidth={2.5} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ rotate: 90, scale: 0.5 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <MessageCircle size={24} strokeWidth={1.8} />
          </motion.div>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'fixed bottom-32 right-6 z-50 w-96 max-h-[500px] rounded-2xl shadow-2xl border flex flex-col lg:bottom-24 pointer-events-auto',
              theme === 'dark'
                ? 'border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800'
                : 'border-slate-200/50 bg-gradient-to-br from-white via-blue-50 to-slate-50'
            )}
          >
            {/* Header */}
            <div
              className={cn(
                'border-b p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10',
                theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200/50'
              )}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 font-bold shadow-lg"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                >
                  <span className="text-xs font-black text-white">✨</span>
                </motion.div>
                <div>
                  <h3 className={cn(
                    'font-bold',
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  )}>
                    QuizBot
                  </h3>
                  <p className={cn(
                    'text-xs font-medium',
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  )}>
                    AI Learning Assistant
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div
              className={cn(
                'flex-1 overflow-y-auto p-4 space-y-3',
                theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-50'
              )}
            >
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex gap-2 animate-fadeIn',
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-xs rounded-xl px-4 py-3 text-sm font-medium leading-relaxed whitespace-pre-wrap',
                      message.sender === 'user'
                        ? theme === 'dark'
                          ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-400/20'
                        : theme === 'dark'
                          ? 'bg-slate-800/80 text-slate-100 border border-slate-700/50 shadow-lg shadow-slate-900/20'
                          : 'bg-white text-slate-900 border border-slate-200/60 shadow-lg shadow-slate-200/20'
                    )}
                  >
                    {message.text}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2"
                >
                  <div
                    className={cn(
                      'rounded-lg px-4 py-2',
                      theme === 'dark' ? 'bg-slate-800/70' : 'bg-white border border-slate-200'
                    )}
                  >
                    <Loader className="h-4 w-4 animate-spin" />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSendMessage}
              className={cn(
                'border-t p-3 flex gap-2',
                theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200/50'
              )}
            >
              <motion.input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={loading}
                whileFocus={{ scale: 1.02 }}
                className={cn(
                  'flex-1 rounded-lg border px-3 py-2 text-sm outline-none transition-all font-medium',
                  theme === 'dark'
                    ? 'border-slate-700 bg-slate-800/70 text-white placeholder-slate-400 focus:border-blue-500 focus:bg-slate-800 focus:shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                    : 'border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-slate-50 focus:shadow-[0_0_12px_rgba(59,130,246,0.2)]',
                  loading && 'opacity-50 cursor-not-allowed'
                )}
              />
              <motion.button
                type="submit"
                disabled={loading || !input.trim()}
                whileHover={{ scale: 1.08, rotate: 5 }}
                whileTap={{ scale: 0.92 }}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white transition-all font-bold shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed',
                  !loading && !input.trim() && 'opacity-50'
                )}
              >
                <Send size={18} strokeWidth={2} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
