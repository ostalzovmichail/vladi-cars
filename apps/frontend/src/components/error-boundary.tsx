import { Component, type ErrorInfo, type ReactNode } from 'react'
import { logger } from '../lib/logger'
import styles from './error-boundary.module.css'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error('ErrorBoundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className={styles.wrap}>
          <h2 className={styles.title}>
            Что-то пошло не так
          </h2>
          <p className={styles.text}>
            {this.state.error?.message || 'Произошла непредвиденная ошибка'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className={styles.retryBtn}
          >
            Попробовать снова
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
