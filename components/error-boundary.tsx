"use client"

import React, { Component, ReactNode } from "react"
import { AlertTriangle, RefreshCw, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  showReportDialog: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showReportDialog: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    // Call optional error handler
    this.props.onError?.(error, errorInfo)

    // Log error for monitoring
    this.logError(error, errorInfo)
  }

  logError = async (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      await fetch("/api/report-error", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          errorMessage: error.message,
          errorStack: error.stack,
          errorType: "react_error_boundary",
          context: {
            url: window.location.href,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            componentStack: errorInfo.componentStack,
          },
        }),
      })
    } catch (err) {
      console.error("Failed to log error:", err)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showReportDialog: false,
    })
  }

  handleReportError = () => {
    this.setState({ showReportDialog: true })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <CardTitle>Something went wrong</CardTitle>
              </div>
              <CardDescription>
                An unexpected error occurred. You can try refreshing the page or report this error to help us fix it.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="bg-muted p-4 rounded-lg border">
                <p className="text-sm font-semibold mb-2">Error Details:</p>
                <p className="text-sm text-muted-foreground font-mono break-words">
                  {this.state.error?.message || "Unknown error"}
                </p>
              </div>
              
              {this.state.error?.stack && (
                <details className="mt-4">
                  <summary className="text-sm font-medium cursor-pointer hover:underline">
                    View technical details
                  </summary>
                  <div className="mt-2 bg-muted p-4 rounded-lg border overflow-auto max-h-[300px]">
                    <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                      {this.state.error.stack}
                      {this.state.errorInfo?.componentStack && (
                        <>
                          {"\n\nComponent Stack:"}
                          {this.state.errorInfo.componentStack}
                        </>
                      )}
                    </pre>
                  </div>
                </details>
              )}
            </CardContent>

            <CardFooter className="flex gap-2 flex-col sm:flex-row">
              <Button
                onClick={this.handleReset}
                className="w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto"
              >
                Refresh Page
              </Button>
              <Button
                variant="outline"
                onClick={this.handleReportError}
                className="w-full sm:w-auto"
              >
                <Send className="h-4 w-4 mr-2" />
                Report Error
              </Button>
            </CardFooter>
          </Card>

          {/* Error Report Dialog would be rendered here if needed */}
          {this.state.showReportDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="max-w-2xl w-full">
                <CardHeader>
                  <CardTitle>Report Error</CardTitle>
                  <CardDescription>
                    Copy the error details below and send them to support.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg border overflow-auto max-h-[400px]">
                    <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                      {`Error: ${this.state.error?.message}\n\n${this.state.error?.stack || ""}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack || ""}`}
                    </pre>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => this.setState({ showReportDialog: false })}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      const errorDetails = `Error: ${this.state.error?.message}\n\n${this.state.error?.stack || ""}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack || ""}`
                      navigator.clipboard.writeText(errorDetails)
                      alert("Error details copied to clipboard!")
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

