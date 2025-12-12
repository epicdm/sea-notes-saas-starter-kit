'use client'

import { useEffect } from 'react'
import { Button } from '@heroui/react'
import { AlertCircle, RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-error/10 mb-6">
            <AlertCircle className="h-16 w-16 text-error" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Something Went Wrong
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          We encountered an unexpected error while processing your request.
          Don't worry, our team has been notified and we're working on it.
        </p>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-muted/50 rounded-lg text-left max-w-xl mx-auto">
            <p className="text-sm font-semibold text-foreground mb-2">Error Details:</p>
            <p className="text-sm text-muted-foreground font-mono break-words">
              {error.message || 'Unknown error'}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            color="primary"
            size="lg"
            onClick={reset}
            className="w-full sm:w-auto"
          >
            <RefreshCcw className="mr-2 h-5 w-5" />
            Try Again
          </Button>

          <Link href="/">
            <Button variant="bordered" size="lg" className="w-full sm:w-auto">
              <Home className="mr-2 h-5 w-5" />
              Go to Home
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            If this problem persists, please contact our support team.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/docs"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Documentation
            </Link>
            <Link
              href="/dashboard/settings"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
