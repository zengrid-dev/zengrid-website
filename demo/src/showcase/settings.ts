export type GridTheme =
  | 'light' | 'dark' | 'material' | 'github'
  | 'nord' | 'dracula' | 'one-dark' | 'solarized';

export interface Settings {
  gridTheme: GridTheme;
  showRoadmap: boolean;
}

const KEY = 'zengrid-showcase-settings';
const DEFAULTS: Settings = { gridTheme: 'light', showRoadmap: false };

type Listener = (s: Settings) => void;
const listeners = new Set<Listener>();
let state: Settings = load();

function load(): Settings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return { ...DEFAULTS };
  }
}

export function getSettings(): Settings {
  return state;
}

export function setSettings(patch: Partial<Settings>): void {
  state = { ...state, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage may be unavailable */
  }
  listeners.forEach((fn) => fn(state));
}

export function onSettings(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
