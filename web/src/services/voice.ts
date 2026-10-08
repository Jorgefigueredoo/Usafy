/**
 * Fala em pt-BR com a síntese de voz do próprio navegador (Web Speech API), sem biblioteca
 * nem rede. No iOS a primeira fala precisa partir de um toque do usuário: por isso o aviso
 * de início da navegação é disparado no clique de "Iniciar navegação".
 */

const LANGUAGE = 'pt-BR';
/** Um pouco mais rápido que o normal: instruções curtas, ditas com o trânsito em volta. */
const SPEECH_RATE = 1.05;

export function isVoiceSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Voz em português, se o aparelho tiver uma (a lista pode chegar depois da primeira chamada). */
function portugueseVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((voice) => voice.lang === LANGUAGE) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith('pt')) ??
    null
  );
}

export interface SpeakOptions {
  /** Corta o que estiver sendo dito: para avisos que perdem o sentido se chegarem atrasados. */
  interrupt?: boolean;
}

export function speak(text: string, { interrupt = false }: SpeakOptions = {}): void {
  if (!isVoiceSupported() || !text.trim()) return;
  const synth = window.speechSynthesis;
  if (interrupt) synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANGUAGE;
  utterance.rate = SPEECH_RATE;
  const voice = portugueseVoice();
  if (voice) utterance.voice = voice;
  synth.speak(utterance);
}

export function stopSpeaking(): void {
  if (isVoiceSupported()) window.speechSynthesis.cancel();
}

const METERS_IN_KM = 1000;

/** Distância como se fala: "300 metros", "1 quilômetro", "1,5 quilômetros". */
export function spokenDistance(meters: number): string {
  if (meters < METERS_IN_KM) {
    // De 50 em 50 m: "Em 350 metros" soa natural; "Em 347 metros", não.
    const rounded = Math.max(50, Math.round(meters / 50) * 50);
    return `${rounded} metros`;
  }
  const km = Math.round((meters / METERS_IN_KM) * 10) / 10;
  const text = String(km).replace('.', ',');
  return km === 1 ? '1 quilômetro' : `${text} quilômetros`;
}

/** "Vire à direita na Rua X" → "vire à direita na Rua X", para encaixar depois de "Em 300 metros,". */
export function lowerFirst(text: string): string {
  return text.charAt(0).toLocaleLowerCase('pt-BR') + text.slice(1);
}

/** Tempo como se fala: "1 minuto", "17 minutos", "1 hora e 5 minutos". */
export function spokenDuration(minutes: number): string {
  const total = Math.max(1, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  const minutesText = rest === 1 ? '1 minuto' : `${rest} minutos`;
  if (hours === 0) return minutesText;
  const hoursText = hours === 1 ? '1 hora' : `${hours} horas`;
  return rest === 0 ? hoursText : `${hoursText} e ${minutesText}`;
}
