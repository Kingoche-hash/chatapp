import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import AuthProvider from './context/AuthProvider.jsx';
import SocketProvider from './context/socketProvider.jsx';
import PresenceProvider from './context/PresenceProvider.jsx';
import TypingProvider from './context/TypingProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <PresenceProvider>
            <TypingProvider>
              <App />
            </TypingProvider>
          </PresenceProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);