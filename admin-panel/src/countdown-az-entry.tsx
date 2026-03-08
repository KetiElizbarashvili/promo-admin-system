import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CountdownPage } from './pages/CountdownPage';
import './countdown-az.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CountdownPage fixedLang="aze" />
  </StrictMode>
);
