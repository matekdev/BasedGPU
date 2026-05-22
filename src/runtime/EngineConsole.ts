export type EngineLogLevel = "info" | "warn" | "error";

export type EngineLogEntry = {
  id: number;
  level: EngineLogLevel;
  message: string;
  timestamp: Date;
  source?: string;
  data?: unknown;
};

type EngineConsoleListener = (entries: EngineLogEntry[]) => void;

const maxEntries = 500;
const listeners = new Set<EngineConsoleListener>();
let entries: EngineLogEntry[] = [];
let nextEntryId = 1;

function emit(level: EngineLogLevel, message: string, source?: string, data?: unknown) {
  const entry = {
    id: nextEntryId,
    level,
    message,
    timestamp: new Date(),
    source,
    data,
  };

  nextEntryId += 1;
  entries = [...entries, entry].slice(-maxEntries);
  notifyListeners();
  writeToBrowserConsole(entry);
  return entry;
}

function notifyListeners() {
  for (const listener of listeners) {
    listener(entries);
  }
}

function writeToBrowserConsole(entry: EngineLogEntry) {
  const prefix = entry.source ? `[${entry.source}]` : "[Engine]";
  const args = entry.data === undefined
    ? [prefix, entry.message]
    : [prefix, entry.message, entry.data];

  if (entry.level === "error") {
    console.error(...args);
    return;
  }

  if (entry.level === "warn") {
    console.warn(...args);
    return;
  }

  console.info(...args);
}

export const engineConsole = {
  info: (message: string, source?: string, data?: unknown) => emit("info", message, source, data),
  warn: (message: string, source?: string, data?: unknown) => emit("warn", message, source, data),
  error: (message: string, source?: string, data?: unknown) => emit("error", message, source, data),
  log: (message: string, source?: string, data?: unknown) => emit("info", message, source, data),
  clear: () => {
    entries = [];
    notifyListeners();
  },
  getEntries: () => entries,
  subscribe: (listener: EngineConsoleListener) => {
    listeners.add(listener);
    listener(entries);
    return () => listeners.delete(listener);
  },
};
