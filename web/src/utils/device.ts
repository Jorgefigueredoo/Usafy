/** Parte da User-Agent Client Hints API (Chromium); ainda fora do lib.dom do TypeScript. */
interface NavigatorWithUAData extends Navigator {
  userAgentData?: { mobile: boolean };
}

const MOBILE_USER_AGENT = /Android|iPhone|iPad|iPod|Mobile/i;

/**
 * Celular ou tablet. O DevTools do Chrome, no modo dispositivo, troca o user agent e o tipo de
 * ponteiro — por isso o app também abre no notebook durante o desenvolvimento (recarregue a
 * página depois de ligar o modo dispositivo).
 */
export function isMobileDevice(): boolean {
  const { userAgentData, userAgent, maxTouchPoints } = navigator as NavigatorWithUAData;

  if (userAgentData?.mobile || MOBILE_USER_AGENT.test(userAgent)) return true;

  // iPad no iPadOS 13+ se apresenta como Mac; tablets Android podem omitir "Mobile".
  // Notebooks com tela touch continuam de fora: o ponteiro principal deles é o mouse.
  return maxTouchPoints > 0 && window.matchMedia('(pointer: coarse)').matches;
}
