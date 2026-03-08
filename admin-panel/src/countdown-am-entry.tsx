import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CountdownPage } from './pages/CountdownPage';
import './countdown-am.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CountdownPage fixedLang="arm" />
  </StrictMode>
);
