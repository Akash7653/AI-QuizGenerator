import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { ChatbotWidget } from '@/components/chatbot/ChatbotWidget';

export function GlobalLayout() {
  const location = useLocation();
  const isQuizInProgress = /^\/quiz\/[^/]+$/.test(location.pathname);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.hash]);

  return (
    <>
      <Outlet />
      <MobileBottomNav />
      {!isQuizInProgress && <ChatbotWidget />}
    </>
  );
}
