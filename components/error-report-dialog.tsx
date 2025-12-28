"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Send, Copy, Check } from "lucide-react"

interface ErrorReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  error: {
    message: string
    stack?: string
    type?: string
    context?: Record<string, any>
  }
}

export function ErrorReportDialog({
  open,
  onOpenChange,
  error,
}: ErrorReportDialogProps) {
  const [userMessage, setUserMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  const errorDetails = `Error: ${error.message}\n\n${
    error.stack ? `Stack Trace:\n${error.stack}\n\n` : ""
  }Context:\n${JSON.stringify(error.context || {}, null, 2)}`

  const handleCopyError = () => {
    navigator.clipboard.writeText(errorDetails)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("Error details copied to clipboard")
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/report-error", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          errorMessage: error.message,
          errorStack: error.stack,
          errorType: error.type || "runtime_error",
          userMessage: userMessage.trim() || undefined,
          context: {
            url: window.location.href,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            ...error.context,
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Error report sent successfully. Thank you for your feedback!")
        setUserMessage("")
        onOpenChange(false)
      } else {
        toast.error("Failed to send error report. Please try again or copy the error details.")
      }
    } catch (err) {
      console.error("Failed to submit error report:", err)
      toast.error("Failed to send error report. Please copy the error details and email them.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            <DialogTitle>Report Error</DialogTitle>
          </div>
          <DialogDescription>
            Help us improve by reporting this error. You can add additional details about what you were doing when the error occurred.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          <div>
            <Label htmlFor="userMessage">What were you trying to do? (Optional)</Label>
            <Textarea
              id="userMessage"
              placeholder="Example: I was trying to upload a large image file when this error occurred..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              className="mt-2 min-h-[100px]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Error Details</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyError}
                className="h-8"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-lg border overflow-auto max-h-[300px]">
              <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                {errorDetails}
              </pre>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyError}
              disabled={isSubmitting}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Details
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Sending..." : "Send Report"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

