import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { HomePage } from '@/pages/Home';
import { OnboardingPage } from '@/pages/Onboarding';
import { RouteDetailsPage } from '@/pages/RouteDetails';
import { paths } from '@/paths';

// O Mapbox GL é o maior pedaço do bundle; só baixa quando o mapa é aberto.
const MapPage = lazy(() => import('@/pages/Map'));

export function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path={paths.onboarding} element={<OnboardingPage />} />
        <Route path={paths.home} element={<HomePage />} />
        <Route path={paths.map} element={<MapPage />} />
        <Route path={paths.routeDetails} element={<RouteDetailsPage />} />
        <Route path="*" element={<Navigate to={paths.onboarding} replace />} />
      </Routes>
    </Suspense>
  );
}
