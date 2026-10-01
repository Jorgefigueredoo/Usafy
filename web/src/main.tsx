import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import { App } from '@/App';
import { RouteProvider } from '@/hooks';
import { applyCssVariables } from '@/theme';

import './index.css';

// Antes do primeiro render, para os CSS Modules já encontrarem os tokens.
applyCssVariables();

const container = document.getElementById('root');
if (!container) throw new Error('Elemento #root não encontrado em index.html');

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <RouteProvider>
        <App />
      </RouteProvider>
    </BrowserRouter>
  </StrictMode>,
);
