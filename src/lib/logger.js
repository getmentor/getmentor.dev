/**
 * Next.js frontend logger with file-based logging
 * Logs are sent to console (for local debugging) and written to file
 * Grafana Alloy tails log files directly for collection
 */

import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

const { combine, timestamp, json, errors, printf } = winston.format

// Logger configuration
const LOGGER_CONFIG = {
  MAX_FILE_SIZE: '100m', // 100MB per file
  MAX_FILES: '7d', // Keep 7 days of logs
  DATE_PATTERN: 'YYYY-MM-DD',
}

// Custom format for console output in development
const consoleFormat = printf(({ level, message, timestamp, service, ...metadata }) => {
  let msg = `${timestamp} [${level}] [${service}]: ${message}`
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`
  }
  return msg
})

// Build transports array
const transports = [
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
    console.warn('Failed to initialize file logging, using console only:', error.message)
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
    service: process.env.O11Y_SERVICE_NAME || 'getmentor-frontend',
    environment: process.env.NODE_ENV || 'development',
    hostname: process.env.HOSTNAME || 'localhost',
  },
  transports,
})

// Helper methods for adding context to logs
export const createContextLogger = (context) => {
  return {
    debug: (message, meta = {}) => logger.debug(message, { ...context, ...meta }),
    info: (message, meta = {}) => logger.info(message, { ...context, ...meta }),
    warn: (message, meta = {}) => logger.warn(message, { ...context, ...meta }),
    error: (message, meta = {}) => logger.error(message, { ...context, ...meta }),
  }
}

// Helper for logging HTTP requests
export const logHttpRequest = (req, res, duration) => {
  logger.info('HTTP request', {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    duration_ms: duration,
    user_agent: req.headers['user-agent'],
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
  })
}

// Helper for logging errors
export const logError = (error, context = {}) => {
  logger.error(error.message, {
    error: error.name,
    stack: error.stack,
    ...context,
  })
}

export default logger
