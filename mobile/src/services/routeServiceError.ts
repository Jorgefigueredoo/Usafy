/** Erro com mensagem já pronta para exibir ao usuário. */
export class RouteServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RouteServiceError';
  }
}
