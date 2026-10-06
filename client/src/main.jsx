import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import AuthProvider from './context/AuthProvider.jsx';
import PresenceProvider from './context/PresenceProvider.jsx';
import SocketProvider from './context/SocketProvider.jsx';
import ToastProvider from './context/ToastProvider.jsx';
import TypingProvider from './context/TypingProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <SocketProvider>
              <PresenceProvider>
                <TypingProvider>
                  <App />
                </TypingProvider>
              </PresenceProvider>
            </SocketProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);