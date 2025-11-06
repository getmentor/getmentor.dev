/**
 * Next.js frontend logger with HTTP log shipping
 * Logs are sent to console (for local debugging) and also shipped to Go API
 * Go API writes them to file for Grafana Alloy collection
 */

import winston from 'winston'
import HttpLogTransport from './http-log-transport.js'

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
    service: 'getmentor-frontend',
    environment: process.env.NODE_ENV || 'development',
    hostname: process.env.HOSTNAME || 'localhost',
  },
  transports: [
    // Always output to console (stdout/stderr) for immediate debugging
    new winston.transports.Console({
      format:
        process.env.NODE_ENV !== 'production'
          ? combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), consoleFormat)
          : undefined, // JSON format in production
    }),
    // Ship logs to Go API for centralized collection by Grafana Alloy
    // Only enable in server-side context (not in browser)
    ...(typeof window === 'undefined'
      ? [
          new HttpLogTransport({
            level: process.env.LOG_LEVEL || 'info',
            goApiUrl: process.env.GO_API_URL || 'http://localhost:8081',
            batchSize: 50, // Send after 50 logs
            flushInterval: 5000, // Or every 5 seconds
          }),
        ]
      : []),
  ],
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
