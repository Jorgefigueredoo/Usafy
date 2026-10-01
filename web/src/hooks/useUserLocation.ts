import { useContext } from 'react';

import { LocationContext, type UserLocationValue } from './locationContext';

export function useUserLocation(): UserLocationValue {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useUserLocation precisa estar dentro de <LocationProvider>.');
  return context;
}
