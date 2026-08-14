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
    setInput('');
    setLoading(true);

    try {
      // Call backend API to get response from Gemini
      const response = await fetch('/api/v1/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: input,
          conversation_id: `chat_${Date.now()}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Sorry, I couldn\'t process that. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: '❌ Sorry, I encountered an error. Please check your connection and try again.',
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
          'fixed bottom-20 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 lg:bottom-8',
          theme === 'dark'
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:shadow-blue-500/50'
            : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:shadow-purple-400/50'
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open chat"
      >
        {isOpen ? (
          <motion.div
            initial={{ rotate: -90 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.2 }}
          >
            <X size={24} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ rotate: 90 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MessageCircle size={24} />
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
              'fixed bottom-32 right-6 z-50 w-96 max-h-[500px] rounded-2xl shadow-2xl border flex flex-col lg:bottom-24',
              theme === 'dark'
                ? 'border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800'
                : 'border-slate-200/50 bg-gradient-to-br from-white via-blue-50 to-slate-50'
            )}
          >
            {/* Header */}
            <div
              className={cn(
                'border-b p-4',
                theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200/50'
              )}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                  <span className="text-sm font-bold text-white">AI</span>
                </div>
                <div>
                  <h3 className={cn(
                    'font-semibold',
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  )}>
                    QuizBot
                  </h3>
                  <p className={cn(
                    'text-xs',
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  )}>
                    Powered by Gemini AI
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
                      'max-w-xs rounded-lg px-4 py-2 text-sm',
                      message.sender === 'user'
                        ? theme === 'dark'
                          ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                          : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                        : theme === 'dark'
                          ? 'bg-slate-800/70 text-slate-100'
                          : 'bg-white text-slate-900 border border-slate-200'
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
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={loading}
                className={cn(
                  'flex-1 rounded-lg border px-3 py-2 text-sm outline-none transition-all',
                  theme === 'dark'
                    ? 'border-slate-700 bg-slate-800 text-white placeholder-slate-400 focus:border-blue-500 focus:bg-slate-800/80'
                    : 'border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-slate-50',
                  loading && 'opacity-50 cursor-not-allowed'
                )}
              />
              <motion.button
                type="submit"
                disabled={loading || !input.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                  !loading && !input.trim() && 'opacity-50'
                )}
              >
                <Send size={18} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
