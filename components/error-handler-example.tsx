"use client"

/**
 * EXAMPLE: How to integrate error reporting into your forms
 * 
 * This file shows how to use the error reporting system in your existing components.
 * You can delete this file after understanding the pattern.
 */

import { useState } from "react"
import { toast } from "sonner"
import { useErrorReport } from "@/hooks/use-error-report"
import { ErrorReportDialog } from "@/components/error-report-dialog"
import { Button } from "@/components/ui/button"
import { createArtwork } from "@/lib/actions/artworks"
import { AlertCircle } from "lucide-react"

export function ExampleFormWithErrorReporting() {
  const [isLoading, setIsLoading] = useState(false)
  const { isOpen, error, reportError, closeDialog } = useErrorReport()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Your normal form submission
      await createArtwork({
        title: "Test Artwork",
        // ... other fields
      })
      
      toast.success("Artwork created successfully")
    } catch (err) {
      console.error("Error creating artwork:", err)
      
      // Show user-friendly error message
      const errorMessage = err instanceof Error ? err.message : "Failed to create artwork"
      toast.error(errorMessage, {
        action: {
          label: "Report Error",
          onClick: () => reportError(err, {
            operation: "createArtwork",
            formData: { title: "Test Artwork" }, // Include relevant context
          }),
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* Your form fields */}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Artwork"}
        </Button>
      </form>

      {/* Error Report Dialog */}
      {error && (
        <ErrorReportDialog
          open={isOpen}
          onOpenChange={closeDialog}
          error={error}
        />
      )}
    </>
  )
}

/**
 * Alternative approach: Add a global error report button
 * This can be used to let users report any issues they encounter
 */
export function GlobalErrorReportButton() {
  const { isOpen, error, reportError, closeDialog } = useErrorReport()

  const handleReportIssue = () => {
    reportError(
      new Error("User reported an issue"),
      {
        type: "user_feedback",
        url: window.location.href,
        message: "User manually reported an issue",
      }
    )
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReportIssue}
        className="text-muted-foreground"
      >
        <AlertCircle className="h-4 w-4 mr-2" />
        Report an Issue
      </Button>

      {error && (
        <ErrorReportDialog
          open={isOpen}
          onOpenChange={closeDialog}
          error={error}
        />
      )}
    </>
  )
}

