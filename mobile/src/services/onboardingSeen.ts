const STORAGE_KEY = 'usafy:onboarding-seen';

/** O usuário já passou pelas boas-vindas neste aparelho (vai direto para a busca). */
export function hasSeenOnboarding(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    // Navegação privada ou armazenamento bloqueado: mostra as boas-vindas de novo.
    return false;
  }
}

export function markOnboardingSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // Sem armazenamento a tela volta a aparecer na próxima abertura; não impede o uso.
  }
}
