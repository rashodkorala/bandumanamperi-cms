"use client"

import { useState, useCallback } from "react"
import { prepareErrorReport } from "@/lib/utils/error-handler"

interface ErrorReportState {
  isOpen: boolean
  error: {
    message: string
    stack?: string
    type?: string
    context?: Record<string, any>
  } | null
}

export function useErrorReport() {
  const [state, setState] = useState<ErrorReportState>({
    isOpen: false,
    error: null,
  })

  const reportError = useCallback((error: unknown, additionalContext?: Record<string, any>) => {
    const errorReport = prepareErrorReport(error, additionalContext)
    setState({
      isOpen: true,
      error: errorReport,
    })
  }, [])

  const closeDialog = useCallback(() => {
    setState({
      isOpen: false,
      error: null,
    })
  }, [])

  return {
    isOpen: state.isOpen,
    error: state.error,
    reportError,
    closeDialog,
  }
}

