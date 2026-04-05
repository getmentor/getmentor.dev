import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import Router from 'next/router'
import { reportError } from '@/lib/report-error'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidMount(): void {
    // Reset error state after navigation completes so users can leave a
    // crashing page. Using routeChangeComplete (not Start) avoids resetting
    // while the broken page is still mounted, which would re-trigger the error.
    Router.events.on('routeChangeComplete', this.handleRouteChange)
  }

  componentWillUnmount(): void {
    Router.events.off('routeChangeComplete', this.handleRouteChange)
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    reportError(error, {
      componentStack: errorInfo.componentStack || '',
    })
  }

  handleRouteChange = (): void => {
    if (this.state.hasError) {
      this.setState({ hasError: false })
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Ошибка</h1>
            <p className="text-gray-600 mb-6">Произошла ошибка. Попробуйте обновить страницу.</p>
            <button
              type="button"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              onClick={() => this.setState({ hasError: false })}
            >
              Попробовать снова
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
