import { useEffect, useMemo, useRef, useState } from 'react';
import { Send, Sparkles, X, Loader2, ShieldAlert } from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import chatbotImage from '../../../assets/chatbot_img.png';

function RobotGlyph({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <img
      src={chatbotImage}
      alt="QuizBot"
      className={`${className} object-cover rounded-full`}
    />
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
      const fallbackText = response.data?.success === false && response.data?.message ? response.data.message : botText;

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          text: fallbackText,
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
            className="flex h-16 w-16 items-center justify-center rounded-full border border-brand-200 bg-white/90 p-1 shadow-[0_12px_28px_rgba(59,130,246,0.20)] backdrop-blur-sm transition hover:scale-[1.02] hover:bg-white"
          >
            <RobotGlyph className="h-12 w-12" />
          </button>
        )}

        {open && (
          <div className="w-[min(92vw,420px)] overflow-hidden rounded-[26px] border border-slate-200 bg-white/95 shadow-[0_22px_60px_rgba(15,23,42,0.15)] backdrop-blur-sm dark:border-ink-800 dark:bg-ink-900/95">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-ink-800 dark:bg-ink-900">
              <div className="flex items-center gap-2">
                <div className="overflow-hidden rounded-full border border-brand-200 bg-brand-50 p-0.5">
                  <img src={chatbotImage} alt="QuizBot" className="h-8 w-8 rounded-full object-cover" />
                </div>
              </div>
              <button
                type="button"
                aria-label="Close assistant"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 dark:text-ink-300 dark:hover:bg-ink-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-ink-800 dark:bg-ink-950/60">
              <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-ink-300">
                {apiReady === false ? (
                  <ShieldAlert className="h-3.5 w-3.5 text-warning-500" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                )}
                <span>{guestNotice}</span>
              </div>
            </div>

            <div className="max-h-[58vh] min-h-[290px] overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_40%)] px-3 py-3 sm:max-h-[440px]" ref={scrollRef}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-2 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-700 dark:bg-ink-800 dark:text-ink-200'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 bg-white p-3 dark:border-ink-800 dark:bg-ink-900">
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
                  className="min-h-[42px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-brand-500 dark:border-ink-700 dark:bg-ink-950 dark:text-ink-100 disabled:cursor-not-allowed disabled:opacity-50"
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
