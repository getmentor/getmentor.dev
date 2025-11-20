/**
 * Next.js frontend logger with file-based logging
 * Logs are sent to console (for local debugging) and written to file
 * Grafana Alloy tails log files directly for collection
 */

import winston from 'winston'

const { combine, timestamp, json, errors, printf } = winston.format

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
  const logDir = process.env.LOG_DIR || '/app/logs'

  // Add file transport for all logs
  transports.push(
    new winston.transports.File({
      filename: `${logDir}/frontend.log`,
      level: process.env.LOG_LEVEL || 'info',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true,
    })
  )

  // Add separate file for errors
  transports.push(
    new winston.transports.File({
      filename: `${logDir}/frontend-error.log`,
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true,
    })
  )
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
// 404 errors are logged as warnings (not critical errors)
export const logError = (error, context = {}) => {
  const message = error.message
  const logData = {
    error: error.name,
    stack: error.stack,
    ...context,
  }

  // Log 404 errors as warnings since they're expected during cache refresh
  if (message && message.includes('404')) {
    logger.warn(message, logData)
  } else {
    logger.error(message, logData)
  }
}

export default logger
