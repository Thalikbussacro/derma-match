import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './features/auth/AuthProvider';
import { queryClient } from './lib/queryClient';
import App from './App';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Elemento #root não encontrado.');
}

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
