import { useEffect } from 'react';

/**
 * Mantém a tela acesa enquanto `active` for verdadeiro (Screen Wake Lock API).
 * O navegador solta o bloqueio quando a aba fica oculta, então pedimos de novo ao voltar.
 * Em navegadores sem suporte, simplesmente não faz nada.
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let disposed = false;

    const acquire = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (disposed) await lock.release();
        else sentinel = lock;
      } catch {
        // Bateria fraca ou política do navegador: segue sem manter a tela acesa.
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void acquire();
    };

    void acquire();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      void sentinel?.release();
    };
  }, [active]);
}
