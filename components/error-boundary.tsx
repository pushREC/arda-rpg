"use client"

import * as React from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * TICKET 18.3: Global Error Boundary
 *
 * A top-level crash handler that catches unhandled errors in the React tree
 * and provides a graceful recovery mechanism.
 *
 * When an error occurs:
 * - Displays a full-screen error message
 * - Provides a "Clear All Data and Restart" button
 * - Logs the error for debugging
 */

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for debugging
    console.error("[ErrorBoundary] System Integrity Failure:", error)
    console.error("[ErrorBoundary] Component Stack:", errorInfo.componentStack)

    this.setState({ errorInfo })
  }

  handleClearAndRestart = () => {
    // Clear all localStorage data
    if (typeof window !== "undefined") {
      localStorage.clear()
      // Redirect to home page
      window.location.href = "/"
    }
  }

  handleRetry = () => {
    // Reset error state and try to re-render
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[hsl(50,50%,90%)] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[hsl(50,80%,97%)] border-4 border-[hsl(0,60%,50%)] rounded-lg shadow-2xl p-8 text-center space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-[hsl(0,70%,95%)] border-4 border-[hsl(0,60%,50%)] flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-[hsl(0,60%,50%)]" />
              </div>
            </div>

            {/* Error Title */}
            <div>
              <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[hsl(0,60%,40%)] mb-2">
                System Integrity Failure
              </h1>
              <p className="text-[hsl(35,40%,40%)]">
                An unexpected error has occurred. Your adventure data may be corrupted.
              </p>
            </div>

            {/* Error Details (collapsible) */}
            {this.state.error && (
              <details className="text-left bg-[hsl(0,30%,95%)] rounded p-3 border border-[hsl(0,40%,80%)]">
                <summary className="text-sm font-medium text-[hsl(0,60%,40%)] cursor-pointer">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs text-[hsl(0,40%,30%)] overflow-auto max-h-32 whitespace-pre-wrap">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Try Again Button */}
              <Button
                onClick={this.handleRetry}
                variant="outline"
                className="w-full h-12 border-2 border-[hsl(35,40%,60%)] text-[hsl(25,50%,25%)] hover:bg-[hsl(45,60%,90%)] transition-all font-medium"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Try Again
              </Button>

              {/* Clear Data Button */}
              <Button
                onClick={this.handleClearAndRestart}
                className="w-full h-12 bg-[hsl(0,60%,50%)] hover:bg-[hsl(0,60%,45%)] text-white border-2 border-[hsl(0,60%,40%)] shadow-[2px_2px_0px_0px_hsl(0,60%,40%)] hover:shadow-[4px_4px_0px_0px_hsl(0,60%,40%)] hover:-translate-y-0.5 transition-all font-bold"
              >
                Clear All Data and Restart
              </Button>

              <p className="text-xs text-[hsl(35,40%,50%)]">
                This will delete all saved characters and progress.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
