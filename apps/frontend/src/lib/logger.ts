const isProduction = import.meta.env.PROD

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  }

  if (isProduction) {
    const method = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'
    console[method](JSON.stringify(entry))
  } else {
    const prefix = `[${level.toUpperCase()}]`
    if (meta && Object.keys(meta).length > 0) {
      console.log(prefix, message, meta)
    } else {
      console.log(prefix, message)
    }
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),
}
