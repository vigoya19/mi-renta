export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelOrder: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function currentLevel(): LogLevel {
  const raw = process.env.LOG_LEVEL || 'info';
  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error') {
    return raw;
  }
  return 'info';
}

function shouldLog(target: LogLevel): boolean {
  return levelOrder[target] >= levelOrder[currentLevel()];
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (!shouldLog(level)) {
    return;
  }
  const prefix = '[' + new Date().toISOString() + '] ' + level.toUpperCase() + ': ';
  if (meta && Object.keys(meta).length > 0) {
    // eslint-disable-next-line no-console
    console[level](prefix + message, meta);
  } else {
    // eslint-disable-next-line no-console
    console[level](prefix + message);
  }
}

export const logger = {
  debug: function (message: string, meta?: Record<string, unknown>): void {
    log('debug', message, meta);
  },
  info: function (message: string, meta?: Record<string, unknown>): void {
    log('info', message, meta);
  },
  warn: function (message: string, meta?: Record<string, unknown>): void {
    log('warn', message, meta);
  },
  error: function (message: string, meta?: Record<string, unknown>): void {
    log('error', message, meta);
  },
};
