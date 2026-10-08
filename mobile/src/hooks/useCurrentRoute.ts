import { useContext } from 'react';

import { RouteContext, type RouteContextValue } from './routeContext';

export function useCurrentRoute(): RouteContextValue {
  const context = useContext(RouteContext);
  if (!context) throw new Error('useCurrentRoute precisa estar dentro de <RouteProvider>.');
  return context;
}
