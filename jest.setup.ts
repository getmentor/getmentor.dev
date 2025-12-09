import '@testing-library/jest-dom'

// Polyfill setImmediate for environments where it's missing (jsdom)
if (typeof global.setImmediate === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(global as any).setImmediate = (fn: (...args: unknown[]) => void, ...args: unknown[]) =>
    setTimeout(fn, 0, ...args)
}
