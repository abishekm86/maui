import { Component, JSX } from 'preact'

export interface ErrorBoundaryProps {
  children: any
  errorFallback?: JSX.Element
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return this.props.errorFallback || <div>Uncaught Error: {this.state.error.message}</div>
    }

    return this.props.children
  }
}
