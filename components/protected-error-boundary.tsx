"use client"

import { ErrorBoundary } from "@/components/error-boundary"
import { ReactNode } from "react"

/**
 * Client-side error boundary wrapper for the protected area
 * This catches runtime errors and allows users to report them
 */
export function ProtectedErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Additional logging or tracking can be done here
        console.error("Protected area error:", error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

