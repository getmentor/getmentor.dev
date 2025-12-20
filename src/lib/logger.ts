/**
 * Next.js frontend logger with file-based logging
 * Logs are sent to console (for local debugging) and written to file
 * Grafana Alloy tails log files directly for collection
 */

import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { trace } from '@opentelemetry/api'
import os from 'os'

const { combine, timestamp, json, errors, printf } = winston.format

// Logger configuration
const LOGGER_CONFIG = {
  MAX_FILE_SIZE: '100m', // 100MB per file
  MAX_FILES: '7d', // Keep 7 days of logs
  DATE_PATTERN: 'YYYY-MM-DD',
} as const

interface LogMetadata {
  service?: string
  trace_id?: string
  span_id?: string
  trace_flags?: string
  [key: string]: unknown
}

/**
 * Extract trace context from OpenTelemetry active span
 * Returns trace_id, span_id, and trace_flags if available
 */
export const getTraceContext = (): Pick<LogMetadata, 'trace_id' | 'span_id' | 'trace_flags'> => {
  const span = trace.getActiveSpan()
  if (!span) {
    return {}
  }

  const spanContext = span.spanContext()
  if (!spanContext || !spanContext.traceId) {
    return {}
  }

  return {
    trace_id: spanContext.traceId,
    span_id: spanContext.spanId,
    trace_flags: spanContext.traceFlags?.toString(16) || '00',
  }
}

// Custom format for console output in development
const consoleFormat = printf(
  ({ level, message, timestamp: ts, service, ...metadata }: winston.Logform.TransformableInfo) => {
    let msg = `${ts} [${level}] [${service}]: ${message}`
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`
    }
    return msg
  }
)

// Build transports array
const transports: winston.transport[] = [
  // Always output to console (stdout/stderr) for immediate debugging
  new winston.transports.Console({
    format:
      process.env.NODE_ENV !== 'production'
        ? combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), consoleFormat)
        : undefined, // JSON format in production
  }),
]

// Add file transport only in server-side context (not in browser)
if (typeof window === 'undefined') {
  // Use ./logs for local dev, /app/logs for production
  const logDir =
    process.env.LOG_DIR || (process.env.NODE_ENV === 'production' ? '/app/logs' : './logs')

  try {
    // Add daily rotating file transport for all logs
    transports.push(
      new DailyRotateFile({
        filename: `${logDir}/app-%DATE%.log`,
        datePattern: LOGGER_CONFIG.DATE_PATTERN,
        level: process.env.LOG_LEVEL || 'info',
        maxSize: LOGGER_CONFIG.MAX_FILE_SIZE,
        maxFiles: LOGGER_CONFIG.MAX_FILES,
        zippedArchive: true, // Compress old logs
        format: combine(timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }), json()),
      })
    )

    // Add separate rotating file for errors
    transports.push(
      new DailyRotateFile({
        filename: `${logDir}/error-%DATE%.log`,
        datePattern: LOGGER_CONFIG.DATE_PATTERN,
        level: 'error',
        maxSize: LOGGER_CONFIG.MAX_FILE_SIZE,
        maxFiles: LOGGER_CONFIG.MAX_FILES,
        zippedArchive: true, // Compress old logs
        format: combine(timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }), json()),
      })
    )
  } catch (error) {
    // If file transport fails (e.g., permission issues), just log to console
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.warn('Failed to initialize file logging, using console only:', errorMessage)
  }
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }), // Log stack traces for errors
    timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
    json() // JSON format for structured logging
  ),
  defaultMeta: {
    service: process.env.O11Y_FE_SERVICE_NAME || 'getmentor-frontend',
    environment: process.env.NODE_ENV || 'development',
    'host.name':
      process.env.HOSTNAME || (typeof window === 'undefined' ? os.hostname() : 'browser'),
  },
  transports,
})

export interface ContextLogger {
  debug: (message: string, meta?: LogMetadata) => void
  info: (message: string, meta?: LogMetadata) => void
  warn: (message: string, meta?: LogMetadata) => void
  error: (message: string, meta?: LogMetadata) => void
}

// Helper methods for adding context to logs
export const createContextLogger = (context: LogMetadata): ContextLogger => {
  return {
    debug: (message: string, meta: LogMetadata = {}) =>
      logger.debug(message, { ...context, ...meta, ...getTraceContext() }),
    info: (message: string, meta: LogMetadata = {}) =>
      logger.info(message, { ...context, ...meta, ...getTraceContext() }),
    warn: (message: string, meta: LogMetadata = {}) =>
      logger.warn(message, { ...context, ...meta, ...getTraceContext() }),
    error: (message: string, meta: LogMetadata = {}) =>
      logger.error(message, { ...context, ...meta, ...getTraceContext() }),
  }
}

interface HttpRequest {
  method?: string
  url?: string
  headers: {
    'user-agent'?: string
    'x-forwarded-for'?: string
  }
  socket?: {
    remoteAddress?: string
  }
}

interface HttpResponse {
  statusCode: number
}

// Helper for logging HTTP requests
export const logHttpRequest = (req: HttpRequest, res: HttpResponse, duration: number): void => {
  logger.info('HTTP request', {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    duration_ms: duration,
    user_agent: req.headers['user-agent'],
    ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
    ...getTraceContext(),
  })
}

// Helper for logging errors
export const logError = (error: Error, context: LogMetadata = {}): void => {
  logger.error(error.message, {
    error: error.name,
    stack: error.stack,
    ...context,
    ...getTraceContext(),
  })
}

export default logger
