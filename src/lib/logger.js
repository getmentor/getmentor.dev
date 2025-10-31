import winston from 'winston'
import path from 'path'
import fs from 'fs'

const { combine, timestamp, json, errors, printf } = winston.format

// Custom format for console output in development
const consoleFormat = printf(({ level, message, timestamp, service, ...metadata }) => {
  let msg = `${timestamp} [${level}] [${service}]: ${message}`
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`
  }
  return msg
})

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }), // Log stack traces for errors
    timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
    json() // JSON format for structured logging
  ),
  defaultMeta: {
    service: 'getmentor-nextjs',
    environment: process.env.NODE_ENV || 'development',
    hostname: process.env.HOSTNAME || 'localhost',
  },
  transports: [],
})

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), consoleFormat),
    })
  )
}

// Add file transport for production (will be picked up by Grafana Agent)
// Only add file transports if we're in a runtime environment (not during build)
if (process.env.NODE_ENV === 'production' && typeof window === 'undefined' && process.env.NEXT_PHASE !== 'phase-production-build') {
  const logDir = process.env.LOG_DIR || '/app/logs'

  // Ensure log directory exists
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }

    // Main application logs
    logger.add(
      new winston.transports.File({
        filename: path.join(logDir, 'app.log'),
        maxsize: 10485760, // 10MB
        maxFiles: 5,
      })
    )

    // Error logs
    logger.add(
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        maxsize: 10485760, // 10MB
        maxFiles: 5,
      })
    )
  } catch (error) {
    // If we can't create log files, just log to console
    console.warn('Could not initialize file logging:', error.message)
  }

  // Also output to console for Docker logs
  logger.add(
    new winston.transports.Console({
      format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), consoleFormat),
    })
  )
}

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

// Helper for logging API calls
export const logApiCall = (service, operation, status, duration, metadata = {}) => {
  logger.info('API call', {
    service,
    operation,
    status,
    duration_ms: duration,
    ...metadata,
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
