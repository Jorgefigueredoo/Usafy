import { createContext } from 'react';

import type { Route } from '@/types';

export interface RouteContextValue {
  route: Route | null;
  setRoute: (route: Route | null) => void;
}

export const RouteContext = createContext<RouteContextValue | null>(null);
