# Error Reporting System - User Guide

## Overview

Users can now report errors directly from the CMS when they encounter issues. This helps you quickly identify and fix problems by getting detailed error information from users.

## Features Added

### 1. **Error Report API** (`app/api/report-error/route.ts`)
- Receives error reports from users
- Captures user context (URL, user agent, user ID, etc.)
- Logs errors to console (can be extended to email/Slack/database)
- Returns success/failure status

### 2. **Error Report Dialog** (`components/error-report-dialog.tsx`)
- User-friendly modal for reporting errors
- Allows users to describe what they were doing
- Shows error details (copyable)
- Submits reports to the API

### 3. **Error Boundary** (`components/error-boundary.tsx`)
- Catches React runtime errors
- Shows user-friendly error page
- Allows users to retry or report the error
- Automatically logs errors to the API

### 4. **Error Report Hook** (`hooks/use-error-report.ts`)
- Easy integration into forms and components
- Manages error report dialog state
- Prepares error data for reporting

## How It Works

### For Users

When a user encounters an error:

1. **They see a clear error message** via toast notification
2. **They get a "Report Error" button** in the toast or error page
3. **Clicking "Report Error"** opens a dialog where they can:
   - Add context about what they were doing
   - See the technical error details
   - Copy error details to clipboard
   - Send the report to you

### For You (Developer)

When a user reports an error:

1. **Error is logged to console** with full details
2. **You can extend the API** to:
   - Send emails to yourself
   - Post to Slack/Discord
   - Store in a database
   - Send to error tracking services (Sentry, Bugsnag, etc.)

## Integration Examples

### 1. In Forms (Recommended)

Add error reporting to your form submission handlers:

```tsx
import { useErrorReport } from "@/hooks/use-error-report"
import { ErrorReportDialog } from "@/components/error-report-dialog"
import { toast } from "sonner"

export function ArtworkForm() {
  const { isOpen, error, reportError, closeDialog } = useErrorReport()

  const handleSubmit = async (e) => {
    try {
      await createArtwork(data)
      toast.success("Artwork created successfully")
    } catch (err) {
      // Show error with report button
      toast.error(
        err instanceof Error ? err.message : "Failed to create artwork",
        {
          action: {
            label: "Report Error",
            onClick: () => reportError(err, {
              operation: "createArtwork",
              formData: data,
            }),
          },
        }
      )
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* Your form fields */}
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
```

### 2. Global Error Boundary (Already Added)

The error boundary is already added to your protected area layout and will automatically:
- Catch runtime React errors
- Display a friendly error page
- Allow users to report the error
- Log errors automatically

### 3. Manual Error Reporting

Add a "Report Issue" button anywhere in your UI:

```tsx
import { useErrorReport } from "@/hooks/use-error-report"
import { ErrorReportDialog } from "@/components/error-report-dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export function ReportIssueButton() {
  const { isOpen, error, reportError, closeDialog } = useErrorReport()

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => reportError(
          new Error("User reported an issue"),
          { type: "user_feedback" }
        )}
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
```

## Error Report Format

When a user reports an error, you receive:

```json
{
  "errorMessage": "Failed to upload file",
  "errorStack": "Error: Failed to upload file\n    at ...",
  "errorType": "upload_error",
  "userMessage": "I was trying to upload a large image when this happened",
  "context": {
    "url": "https://yourdomain.com/protected/artworks",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "userAgent": "Mozilla/5.0...",
    "userId": "user-id-here",
    "userEmail": "user@example.com",
    "operation": "createArtwork",
    "formData": { ... }
  }
}
```

## Setting Up Email Notifications (Optional)

To receive error reports via email, update `app/api/report-error/route.ts`:

### Option 1: Using Resend

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// In the POST handler:
await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: 'you@yourdomain.com',
  subject: `Error Report: ${body.errorType}`,
  html: `
    <h2>Error Report</h2>
    <p><strong>Message:</strong> ${body.errorMessage}</p>
    <p><strong>User:</strong> ${user?.email || 'Anonymous'}</p>
    <p><strong>URL:</strong> ${body.context.url}</p>
    <p><strong>User Message:</strong> ${body.userMessage || 'None'}</p>
    <pre>${body.errorStack}</pre>
  `
})
```

### Option 2: Using SendGrid

```typescript
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

await sgMail.send({
  to: 'you@yourdomain.com',
  from: 'noreply@yourdomain.com',
  subject: `Error Report: ${body.errorType}`,
  text: `
    Error: ${body.errorMessage}
    User: ${user?.email || 'Anonymous'}
    ${body.errorStack}
  `
})
```

## Setting Up Slack Notifications (Optional)

To post errors to Slack:

```typescript
// In app/api/report-error/route.ts
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL

await fetch(SLACK_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: `🚨 Error Report`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Error:* ${body.errorMessage}\n*User:* ${user?.email || 'Anonymous'}\n*URL:* ${body.context.url}`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `\`\`\`${body.errorStack}\`\`\``
        }
      }
    ]
  })
})
```

## Storing Error Reports in Database (Optional)

Create a table for error reports:

```sql
-- Add to your Supabase SQL editor
CREATE TABLE error_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  error_message TEXT NOT NULL,
  error_stack TEXT,
  error_type TEXT NOT NULL,
  user_message TEXT,
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

-- Policy to allow inserts
CREATE POLICY "Users can insert error reports"
  ON error_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for you to view all reports
CREATE POLICY "Admins can view all error reports"
  ON error_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'your-admin-email@example.com'
    )
  );
```

Then in the API:

```typescript
await supabase.from('error_reports').insert({
  user_id: user?.id,
  error_message: body.errorMessage,
  error_stack: body.errorStack,
  error_type: body.errorType,
  user_message: body.userMessage,
  context: body.context,
})
```

## Integration with External Services

### Sentry

```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.captureException(new Error(body.errorMessage), {
  user: {
    id: user?.id,
    email: user?.email,
  },
  extra: body.context,
  tags: {
    errorType: body.errorType,
  },
})
```

### LogRocket

```typescript
import LogRocket from 'logrocket'

LogRocket.captureException(new Error(body.errorMessage), {
  tags: {
    errorType: body.errorType,
  },
  extra: body.context,
})
```

## Testing the Error Reporting

### Test Runtime Errors

1. Go to any form in the protected area
2. Open browser console and run:
   ```javascript
   throw new Error("Test error for reporting")
   ```
3. You should see the error boundary page with a "Report Error" button

### Test Form Errors

1. Try to create an artwork without a title
2. You should see a toast with "Report Error" button
3. Click it to open the error report dialog

### Test File Upload Errors

1. Try to upload a file that's too large (>50MB)
2. You should see an error with "Report Error" option

## User Experience Flow

```
User encounters error
        ↓
Error message displayed (toast)
        ↓
User clicks "Report Error" button
        ↓
Dialog opens with:
  - Text field for user description
  - Error details (visible)
  - Copy button
  - Send button
        ↓
User adds context (optional)
        ↓
User clicks "Send Report"
        ↓
Error report sent to API
        ↓
You receive notification
```

## What Users See

### 1. Toast Error with Report Button
```
❌ Failed to upload file. File is too large.
[Report Error] ←— Clickable button
```

### 2. Error Report Dialog
```
┌─────────────────────────────────────┐
│ Report Error                        │
├─────────────────────────────────────┤
│ What were you trying to do?         │
│ ┌─────────────────────────────────┐ │
│ │ I was uploading a 100MB image  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Error Details:          [Copy]      │
│ ┌─────────────────────────────────┐ │
│ │ Error: File too large           │ │
│ │ Maximum size is 50MB            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Cancel] [Copy Details] [Send]     │
└─────────────────────────────────────┘
```

### 3. Runtime Error Page (from Error Boundary)
```
⚠️ Something went wrong

An unexpected error occurred. You can try refreshing 
the page or report this error to help us fix it.

Error Details: [specific error message]
▼ View technical details

[Try Again] [Refresh Page] [Report Error]
```

## Best Practices

1. **Always provide context** when calling `reportError()`:
   ```typescript
   reportError(error, {
     operation: "createArtwork",
     attemptedAction: "upload image",
     fileSize: file.size,
   })
   ```

2. **Show user-friendly messages** first, then offer to report:
   ```typescript
   toast.error("Failed to upload. File might be too large.", {
     action: { label: "Report", onClick: () => reportError(error) }
   })
   ```

3. **Don't overwhelm users** - only show report button for unexpected errors

4. **Test error reporting** in development to ensure it works

## Monitoring & Analysis

Once you have error reports coming in, you can:

1. **Track common errors** to prioritize fixes
2. **Identify patterns** in user behavior that cause errors
3. **Improve error messages** based on user feedback
4. **Detect production issues** quickly

## Summary

✅ **Error boundary** catches React runtime errors
✅ **Error report dialog** lets users describe issues
✅ **API endpoint** receives and logs error reports
✅ **Toast notifications** include "Report Error" buttons
✅ **Easy integration** with existing forms
✅ **Extensible** to email, Slack, database, or external services

Users can now easily report any errors they encounter, giving you the information you need to fix issues quickly! 🎉

