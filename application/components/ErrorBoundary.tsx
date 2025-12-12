import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // In production, you would send this to an error tracking service like Sentry
    // Sentry.captureException(error, { extra: errorInfo });
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              
              <h1 className="text-2xl mb-2">Something went wrong</h1>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                We're sorry, but something unexpected happened. Our team has been notified and we're working on a fix.
              </p>

              {/* Error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-2">
                    View error details (Development only)
                  </summary>
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 overflow-auto max-h-64">
                    <div className="text-sm mb-2">
                      <strong className="text-red-600 dark:text-red-400">Error:</strong>{' '}
                      <code className="text-xs">{this.state.error.message}</code>
                    </div>
                    {this.state.error.stack && (
                      <pre className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div className="mt-2">
                        <strong className="text-xs text-slate-600 dark:text-slate-400">Component Stack:</strong>
                        <pre className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleReset} variant="outline">
                  Try Again
                </Button>
                <Button onClick={this.handleReload} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
                <Button onClick={this.handleGoHome} className="gap-2">
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
                Error ID: {Date.now().toString(36)}
              </p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
