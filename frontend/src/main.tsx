import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './hooks/use-auth.tsx';
import { ThemeModeProvider } from './hooks/use-theme-mode.tsx';
import { suppressConsoleWarnings } from './lib/console-utils';
import './index.css';

// Suppress non-critical console warnings
suppressConsoleWarnings();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeModeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeModeProvider>
  </StrictMode>
);
