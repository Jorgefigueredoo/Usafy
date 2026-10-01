import { Navigate, useNavigate } from 'react-router';

import { Header } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { useCurrentRoute } from '@/hooks';
import { paths } from '@/paths';

import styles from './MapPage.module.css';
import { RiskLegend } from './RiskLegend';
import { RouteMap } from './RouteMap';
import { RouteSummaryCard } from './RouteSummaryCard';

export default function MapPage() {
  const navigate = useNavigate();
  const { route } = useCurrentRoute();

  if (!route) return <Navigate to={paths.home} replace />;

  return (
    <div className={styles.page}>
      <div className={styles.mapArea}>
        <RouteMap route={route} />
        <Header
          floating
          onBack={() => navigate(paths.home)}
          backLabel="Voltar para a busca"
          className={styles.header}
        />
      </div>

      <section className={styles.panel} aria-label="Resumo da rota">
        <RouteSummaryCard route={route} />
        <RiskLegend />
        <Button
          label="Ver detalhes"
          trailingIcon="chevronRight"
          fullWidth
          onClick={() => navigate(paths.routeDetails)}
        />
        <Text variant="caption" tone="secondary" align="center">
          Níveis de risco simulados nesta versão de testes.
        </Text>
      </section>
    </div>
  );
}
