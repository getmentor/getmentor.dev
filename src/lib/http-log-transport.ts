/**
 * Custom Winston transport that batches logs and ships them to Go API
 * Logs are buffered and sent in batches every 5 seconds or when 50 logs are collected
 */

import Transport from 'winston-transport'

interface LogEntry {
  timestamp: string
  level: string
  message: string
  context?: Record<string, unknown>
}

interface HttpLogTransportOptions extends Transport.TransportStreamOptions {
  goApiUrl?: string
  batchSize?: number
  flushInterval?: number
}

class HttpLogTransport extends Transport {
  private goApiUrl: string
  private batchSize: number
  private flushInterval: number
  private buffer: LogEntry[]
  private timer: ReturnType<typeof setInterval> | null
  private isFlushing: boolean

  constructor(opts: HttpLogTransportOptions = {}) {
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

  log(info: Record<string, unknown>, callback: () => void): void {
    setImmediate(() => {
      this.emit('logged', info)
    })

    // Add log to buffer
    this.buffer.push({
      timestamp: info.timestamp as string,
      level: info.level as string,
      message: info.message as string,
      context: this.extractContext(info),
    })

    // Check if we should flush immediately
    if (this.buffer.length >= this.batchSize) {
      void this.flush()
    }

    callback()
  }

  private extractContext(info: Record<string, unknown>): Record<string, unknown> | undefined {
    const context = { ...info }
    // Remove standard fields
    delete context.timestamp
    delete context.level
    delete context.message
    delete context[Symbol.for('level') as unknown as string]
    delete context[Symbol.for('message') as unknown as string]
    delete context[Symbol.for('splat') as unknown as string]

    return Object.keys(context).length > 0 ? context : undefined
  }

  private startTimer(): void {
    if (this.timer) {
      clearInterval(this.timer)
    }

    this.timer = setInterval(() => {
      if (this.buffer.length > 0) {
        void this.flush()
      }
    }, this.flushInterval)

    // Don't let the timer prevent Node.js from exiting
    if (this.timer.unref) {
      this.timer.unref()
    }
  }

  async flush(): Promise<void> {
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error shipping logs to Go API:', errorMessage)
      // Re-add logs to buffer on error (but don't let it grow unbounded)
      if (this.buffer.length < 500) {
        this.buffer.unshift(...logsToSend)
      }
    } finally {
      this.isFlushing = false
    }
  }

  close(): void {
    // Flush remaining logs before closing
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    // Flush synchronously if possible
    if (this.buffer.length > 0) {
      void this.flush()
    }
  }
}

export default HttpLogTransport
