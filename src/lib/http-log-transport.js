/**
 * Custom Winston transport that batches logs and ships them to Go API
 * Logs are buffered and sent in batches every 5 seconds or when 50 logs are collected
 */

import Transport from 'winston-transport'

class HttpLogTransport extends Transport {
  constructor(opts = {}) {
    super(opts)

    this.goApiUrl = opts.goApiUrl || process.env.GO_API_URL || 'http://localhost:8081'
    this.batchSize = opts.batchSize || 50
    this.flushInterval = opts.flushInterval || 5000 // 5 seconds
    this.buffer = []
    this.timer = null
    this.isFlushing = false

    // Start the flush timer
    this.startTimer()
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info)
    })

    // Add log to buffer
    this.buffer.push({
      timestamp: info.timestamp,
      level: info.level,
      message: info.message,
      context: this.extractContext(info),
    })

    // Check if we should flush immediately
    if (this.buffer.length >= this.batchSize) {
      this.flush()
    }

    callback()
  }

  extractContext(info) {
    const context = { ...info }
    // Remove standard fields
    delete context.timestamp
    delete context.level
    delete context.message
    delete context[Symbol.for('level')]
    delete context[Symbol.for('message')]
    delete context[Symbol.for('splat')]

    return Object.keys(context).length > 0 ? context : undefined
  }

  startTimer() {
    if (this.timer) {
      clearInterval(this.timer)
    }

    this.timer = setInterval(() => {
      if (this.buffer.length > 0) {
        this.flush()
      }
    }, this.flushInterval)

    // Don't let the timer prevent Node.js from exiting
    if (this.timer.unref) {
      this.timer.unref()
    }
  }

  async flush() {
    if (this.isFlushing || this.buffer.length === 0) {
      return
    }

    this.isFlushing = true
    const logsToSend = this.buffer.splice(0, this.batchSize)

    try {
      const response = await fetch(`${this.goApiUrl}/api/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: logsToSend }),
        // Add a timeout to prevent hanging
        signal: AbortSignal.timeout(5000),
      })

      if (!response.ok) {
        console.error(`Failed to ship logs to Go API: ${response.status} ${response.statusText}`)
        // Re-add logs to buffer if failed (but don't let it grow unbounded)
        if (this.buffer.length < 500) {
          this.buffer.unshift(...logsToSend)
        }
      }
    } catch (error) {
      console.error('Error shipping logs to Go API:', error.message)
      // Re-add logs to buffer on error (but don't let it grow unbounded)
      if (this.buffer.length < 500) {
        this.buffer.unshift(...logsToSend)
      }
    } finally {
      this.isFlushing = false
    }
  }

  close() {
    // Flush remaining logs before closing
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    // Flush synchronously if possible
    if (this.buffer.length > 0) {
      this.flush()
    }
  }
}

export default HttpLogTransport
