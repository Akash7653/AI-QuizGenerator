import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquareText, Send, Sparkles, X, Bot, Loader2, ShieldAlert } from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

function RobotGlyph({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" role="img">
      <path d="M18 20h28a8 8 0 0 1 8 8v18a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8V28a8 8 0 0 1 8-8Z" fill="currentColor" opacity="0.14" />
      <rect x="20" y="22" width="24" height="20" rx="6" fill="currentColor" opacity="0.92" />
      <circle cx="27.5" cy="31" r="2.2" fill="#fff" />
      <circle cx="36.5" cy="31" r="2.2" fill="#fff" />
      <path d="M28 38c1.8 2 6.2 2 8 0" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <rect x="25" y="45" width="14" height="7" rx="3.5" fill="currentColor" opacity="0.8" />
      <path d="M15 28h-6M49 28h6M19 48l-8 8M45 48l8 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

const fallbackBotReply =
  'The AI assistant is temporarily unavailable. Please make sure the Gemini API key is configured on the backend and try again in a moment.';

export function ChatbotWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      text: 'Hi! I can help with study planning, quiz strategy, and quick topic explanations.',
      sender: 'bot',
    },
  ]);
  const [sending, setSending] = useState(false);
  const [apiReady, setApiReady] = useState<boolean | null>(null);
  const [apiMessage, setApiMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const verifyApi = async () => {
      try {
        const response = await api.get('/chatbot/health');
        if (cancelled) return;
        const configured = response.data?.configured === true && response.data?.status !== 'unhealthy';
        setApiReady(configured);
        setApiMessage(
          configured
            ? 'AI assistant is available.'
            : (response.data?.message || fallbackBotReply),
        );
      } catch (error) {
        if (cancelled) return;
        setApiReady(false);
        setApiMessage(fallbackBotReply);
      }
    };

    void verifyApi();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const guestNotice = useMemo(() => {
    if (!user) {
      return 'Sign in to use the AI study assistant.';
    }

    return apiReady === false ? apiMessage : 'AI assistant is ready.';
  }, [apiMessage, apiReady, user]);

  const sendMessage = async () => {
    if (!user || !input.trim() || sending || apiReady === false) {
      if (apiReady === false) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            text: fallbackBotReply,
            sender: 'bot',
          },
        ]);
      }
      return;
    }

    const content = input.trim();
    setInput('');
    setSending(true);

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, text: content, sender: 'user' },
    ]);

    try {
      const response = await api.post('/chatbot/message', {
        message: content,
        conversation_id: `chat-${user.id}-${Date.now()}`,
      });

      const botText = response.data?.response || response.data?.message || fallbackBotReply;
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          text: botText,
          sender: 'bot',
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          text: fallbackBotReply,
          sender: 'bot',
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-3 z-40 sm:bottom-5 sm:right-5">
      <div className="relative">
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open AI assistant"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-500"
          >
            <RobotGlyph className="h-8 w-8" />
          </button>
        )}

        {open && (
          <div className="w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-2xl dark:border-ink-800 dark:bg-ink-900">
            <div className="flex items-center justify-between border-b border-ink-200 bg-brand-600 px-4 py-3 text-white dark:border-ink-800">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-white/15 p-1.5">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">QuizBot</p>
                  <p className="text-[10px] text-brand-100">Study assistant</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close assistant"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-white/90 transition hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b border-ink-200 bg-ink-50 px-3 py-2 dark:border-ink-800 dark:bg-ink-950/60">
              <div className="flex items-center gap-2 text-[11px] text-ink-600 dark:text-ink-300">
                {apiReady === false ? (
                  <ShieldAlert className="h-3.5 w-3.5 text-warning-500" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                )}
                <span>{guestNotice}</span>
              </div>
            </div>

            <div className="max-h-[55vh] min-h-[260px] overflow-y-auto px-3 py-3 sm:max-h-[420px]" ref={scrollRef}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-2 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                      message.sender === 'user'
                        ? 'bg-brand-600 text-white'
                        : 'bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-ink-200 p-3 dark:border-ink-800">
              <div className="flex gap-2">
                <textarea
                  value={input}
                  rows={1}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                  placeholder={apiReady === false ? 'AI is unavailable right now' : 'Ask about your next quiz...'}
                  disabled={sending || apiReady === false}
                  className="min-h-[42px] flex-1 resize-none rounded-xl border border-ink-200 bg-ink-50 px-3 py-2 text-sm text-ink-800 outline-none transition focus:border-brand-500 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => void sendMessage()}
                  disabled={sending || !input.trim() || apiReady === false}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-brand-300"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
