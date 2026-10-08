// Jest não tem vi.stubGlobal: troca o global à mão e restaura depois.
const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
function stubGlobal(name: 'localStorage', value: Storage | undefined): void {
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
}
function unstubAllGlobals(): void {
  if (originalLocalStorage) Object.defineProperty(globalThis, 'localStorage', originalLocalStorage);
  else Reflect.deleteProperty(globalThis, 'localStorage');
}

/** localStorage em memória (o ambiente de teste é Node, sem navegador). */
function memoryStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, value),
  };
}

/** O módulo lê o storage ao ser importado: cada teste importa uma cópia nova. */
async function loadWith(stored?: unknown) {
  const initial: Record<string, string> =
    stored === undefined ? {} : { 'usafy:saved-places': JSON.stringify(stored) };
  stubGlobal('localStorage', memoryStorage(initial));
  jest.resetModules();
  return jest.requireActual<typeof import('./savedPlaces')>('./savedPlaces');
}

beforeEach(() => {
  unstubAllGlobals();
});

afterEach(() => {
  unstubAllGlobals();
});

describe('recentes', () => {
  it('guarda o mais recente primeiro, sem repetir o mesmo lugar', async () => {
    const places = await loadWith();
    places.addRecent({ text: 'RioMar Recife', coordinate: null });
    places.addRecent({ text: 'Marco Zero', coordinate: null });
    places.addRecent({ text: '  riomar recife ', coordinate: [-34.896, -8.085] });

    expect(places.getSavedPlaces().recents).toEqual([
      { text: '  riomar recife ', coordinate: [-34.896, -8.085] },
      { text: 'Marco Zero', coordinate: null },
    ]);
  });

  it('mantém no máximo 5', async () => {
    const places = await loadWith();
    for (const text of ['A', 'B', 'C', 'D', 'E', 'F']) places.addRecent({ text, coordinate: null });
    expect(places.getSavedPlaces().recents.map((place) => place.text)).toEqual(['F', 'E', 'D', 'C', 'B']);
  });

  it('ignora texto vazio e pode ser limpo', async () => {
    const places = await loadWith();
    places.addRecent({ text: '   ', coordinate: null });
    expect(places.getSavedPlaces().recents).toEqual([]);

    places.addRecent({ text: 'Pina', coordinate: null });
    places.clearRecents();
    expect(places.getSavedPlaces().recents).toEqual([]);
  });

  it('sobrevive a uma nova abertura do app', async () => {
    const first = await loadWith();
    first.addRecent({ text: 'Pina', coordinate: null });
    const saved = localStorage.getItem('usafy:saved-places');

    const reopened = await loadWith(saved ? JSON.parse(saved) : undefined);
    expect(reopened.getSavedPlaces().recents).toEqual([{ text: 'Pina', coordinate: null }]);
  });
});

describe('casa e trabalho', () => {
  it('define, troca e remove', async () => {
    const places = await loadWith();
    places.setFavorite('home', { text: 'Rua A, 10', coordinate: null });
    places.setFavorite('home', { text: 'Rua B, 20', coordinate: [-34.9, -8.1] });
    places.setFavorite('work', { text: 'Empresa', coordinate: null });
    expect(places.getSavedPlaces().favorites.home?.text).toBe('Rua B, 20');

    places.setFavorite('home', null);
    expect(places.getSavedPlaces().favorites).toEqual({ work: { text: 'Empresa', coordinate: null } });
  });

  it('avisa quem está ouvindo quando algo muda', async () => {
    const places = await loadWith();
    const listener = jest.fn();
    const unsubscribe = places.subscribeSavedPlaces(listener);
    places.setFavorite('work', { text: 'Empresa', coordinate: null });
    unsubscribe();
    places.setFavorite('work', null);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('dados guardados inválidos', () => {
  it('descarta o que não tem o formato esperado', async () => {
    const places = await loadWith({
      favorites: { home: { text: 'Casa', coordinate: ['x', 1] }, work: { text: '' }, gym: { text: 'Academia' } },
      recents: [{ text: 'Pina', coordinate: [-34.88, -8.08] }, 'lixo', { coordinate: [1, 2] }, null],
    });
    expect(places.getSavedPlaces()).toEqual({
      favorites: { home: { text: 'Casa', coordinate: null } },
      recents: [{ text: 'Pina', coordinate: [-34.88, -8.08] }],
    });
  });

  it('JSON corrompido vira lista vazia, sem quebrar o app', async () => {
    stubGlobal('localStorage', memoryStorage({ 'usafy:saved-places': '{quebrado' }));
    jest.resetModules();
    const places = jest.requireActual<typeof import('./savedPlaces')>('./savedPlaces');
    expect(places.getSavedPlaces()).toEqual({ favorites: {}, recents: [] });
  });

  it('sem armazenamento disponível, funciona só em memória', async () => {
    stubGlobal('localStorage', undefined);
    jest.resetModules();
    const places = jest.requireActual<typeof import('./savedPlaces')>('./savedPlaces');
    places.addRecent({ text: 'Pina', coordinate: null });
    expect(places.getSavedPlaces().recents).toHaveLength(1);
  });
});
