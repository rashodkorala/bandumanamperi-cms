# Quick Guide: Adding Error Reporting to Your Forms

## 🎯 What You Need to Do

You have two options to add error reporting to your existing forms:

### **Option 1: Add "Report Error" Button to Toast (Recommended)**

This is the easiest and least intrusive way. Just update your existing try-catch blocks.

#### Before:
```tsx
try {
  await createArtwork(data)
  toast.success("Artwork created successfully")
} catch (error) {
  toast.error(
    error instanceof Error ? error.message : "Failed to save artwork"
  )
}
```

#### After:
```tsx
import { useErrorReport } from "@/hooks/use-error-report"
import { ErrorReportDialog } from "@/components/error-report-dialog"

export function ArtworkForm() {
  const { isOpen, error, reportError, closeDialog } = useErrorReport()
  
  // ... existing code ...

  try {
    await createArtwork(data)
    toast.success("Artwork created successfully")
  } catch (err) {
    toast.error(
      err instanceof Error ? err.message : "Failed to save artwork",
      {
        action: {
          label: "Report Error",
          onClick: () => reportError(err, {
            operation: "createArtwork",
            formData: data, // Optional: include relevant context
          }),
        },
      }
    )
  }

  // Add this at the end of your component JSX
  return (
    <>
      {/* Your existing form JSX */}
      
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
```

### **Option 2: Nothing - It Already Works!**

The error boundary is already added to your protected layout, so:
- ✅ Runtime React errors are automatically caught
- ✅ Users see a friendly error page with "Report Error" button
- ✅ Errors are automatically logged to your API

## 📝 Files You Need to Update

Update these form files to add the "Report Error" button:

1. ✅ `components/artworks/artwork-form.tsx`
2. ✅ `components/pages/page-form.tsx`
3. ✅ `components/blogs/blog-form.tsx`
4. ✅ `components/media/media-form.tsx`
5. ✅ `components/performances/performance-form.tsx`

## 🔍 Example: Full Integration

Here's a complete example for one of your forms:

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useErrorReport } from "@/hooks/use-error-report"
import { ErrorReportDialog } from "@/components/error-report-dialog"
import { createArtwork } from "@/lib/actions/artworks"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function ArtworkForm({ open, onOpenChange }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({})
  
  // Add error reporting hook
  const { isOpen, error, reportError, closeDialog } = useErrorReport()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createArtwork(formData)
      toast.success("Artwork created successfully")
      onOpenChange(false)
      router.refresh()
    } catch (err) {
      console.error("Error saving artwork:", err)
      
      // Updated: Add "Report Error" button to toast
      toast.error(
        err instanceof Error ? err.message : "Failed to save artwork",
        {
          action: {
            label: "Report Error",
            onClick: () => reportError(err, {
              operation: "createArtwork",
              formData: formData,
            }),
          },
        }
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            {/* Your form fields */}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add error report dialog */}
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
```

## ⚡ Quick Copy-Paste

### 1. Add to imports:
```tsx
import { useErrorReport } from "@/hooks/use-error-report"
import { ErrorReportDialog } from "@/components/error-report-dialog"
```

### 2. Add to component:
```tsx
const { isOpen, error, reportError, closeDialog } = useErrorReport()
```

### 3. Update catch block:
```tsx
catch (err) {
  console.error("Error:", err)
  toast.error(
    err instanceof Error ? err.message : "Failed",
    {
      action: {
        label: "Report Error",
        onClick: () => reportError(err, { operation: "operationName" }),
      },
    }
  )
}
```

### 4. Add before return's closing tag:
```tsx
{error && (
  <ErrorReportDialog
    open={isOpen}
    onOpenChange={closeDialog}
    error={error}
  />
)}
```

## 🎨 What Users Will See

### When Error Occurs:
```
┌─────────────────────────────────────┐
│ ❌ Failed to create artwork.        │
│    Artwork title is required.       │
│                                     │
│                    [Report Error]   │
└─────────────────────────────────────┘
```

### When They Click "Report Error":
```
┌─────────────────────────────────────────┐
│ ⚠️ Report Error                         │
├─────────────────────────────────────────┤
│ What were you trying to do? (Optional)  │
│ ┌─────────────────────────────────────┐ │
│ │ [User can type context here]        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Error Details:              [Copy]      │
│ ┌─────────────────────────────────────┐ │
│ │ Error: Artwork title is required.   │ │
│ │                                     │ │
│ │ Stack Trace:                        │ │
│ │ ...                                 │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Cancel] [Copy Details] [Send Report]  │
└─────────────────────────────────────────┘
```

## 📧 Receiving Error Reports

Right now, errors are logged to your console. To receive them via email/Slack:

### Via Email (Resend):
```bash
pnpm add resend
```

In `app/api/report-error/route.ts`, add:
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: 'your-email@example.com',
  subject: `Error Report: ${body.errorType}`,
  html: `
    <h2>Error Report</h2>
    <p><strong>Error:</strong> ${body.errorMessage}</p>
    <p><strong>User:</strong> ${user?.email || 'Anonymous'}</p>
    <p><strong>User Said:</strong> ${body.userMessage || 'N/A'}</p>
    <pre>${body.errorStack}</pre>
  `
})
```

### Via Slack:
Add webhook URL to `.env.local`:
```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

In `app/api/report-error/route.ts`, add:
```typescript
await fetch(process.env.SLACK_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: `🚨 Error Report from ${user?.email || 'Anonymous'}`,
    blocks: [{
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Error:* ${body.errorMessage}\n*User Message:* ${body.userMessage || 'None'}`
      }
    }]
  })
})
```

## ✅ Testing

1. **Test upload error:**
   - Try uploading a file > 50MB
   - Should see error with "Report Error" button

2. **Test validation error:**
   - Submit form without required field
   - Should see error with "Report Error" button

3. **Test runtime error:**
   - Open browser console
   - Type: `throw new Error("Test")`
   - Should see error boundary page

## 🚀 Done!

That's it! You now have:
- ✅ User-friendly error messages
- ✅ Error reporting capability
- ✅ Automatic error catching (via boundary)
- ✅ Optional context from users
- ✅ Easy extensibility to email/Slack/database

Users can now help you debug issues by reporting errors with context! 🎉

