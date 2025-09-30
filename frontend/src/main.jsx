import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LanguageProvider } from '../src/context/LanguageContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from './components/ToastNotification.jsx';
import './index.css'
import 'flowbite';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>
)
