import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import { App } from '@/App';
import { MobileOnly } from '@/components/layout';
import { LocationProvider, RouteProvider } from '@/hooks';
import { applyCssVariables } from '@/theme';

import './index.css';

// Antes do primeiro render, para os CSS Modules já encontrarem os tokens.
applyCssVariables();

const container = document.getElementById('root');
if (!container) throw new Error('Elemento #root não encontrado em index.html');

createRoot(container).render(
  <StrictMode>
    <MobileOnly>
      <BrowserRouter>
        <LocationProvider>
          <RouteProvider>
            <App />
          </RouteProvider>
        </LocationProvider>
      </BrowserRouter>
    </MobileOnly>
  </StrictMode>,
);
