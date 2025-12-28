import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "edge"

interface ErrorReport {
  errorMessage: string
  errorStack?: string
  errorType: string
  userMessage?: string
  context: {
    url: string
    timestamp: string
    userAgent: string
    userId?: string
    userEmail?: string
    operation?: string
    [key: string]: any
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ErrorReport

    // Get user info if authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Enhance context with user info
    const enhancedReport = {
      ...body,
      context: {
        ...body.context,
        userId: user?.id,
        userEmail: user?.email,
        timestamp: new Date().toISOString(),
      }
    }

    // Log the error (you can enhance this to send to external services)
    console.error("=== USER ERROR REPORT ===")
    console.error(JSON.stringify(enhancedReport, null, 2))
    console.error("========================")

    // TODO: Send to your preferred error tracking service
    // Examples:
    // - Send email notification
    // - Post to Sentry/Bugsnag
    // - Store in database
    // - Send to Slack/Discord webhook
    
    // Example: Send email using a service (you would need to set this up)
    // await sendErrorReportEmail(enhancedReport)

    // Example: Store in database for review
    // await supabase.from('error_reports').insert({
    //   error_message: body.errorMessage,
    //   error_stack: body.errorStack,
    //   error_type: body.errorType,
    //   user_message: body.userMessage,
    //   context: body.context,
    //   user_id: user?.id,
    //   created_at: new Date().toISOString()
    // })

    return NextResponse.json(
      { 
        success: true, 
        message: "Error report received. Thank you for your feedback!" 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Failed to process error report:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to submit error report" 
      },
      { status: 500 }
    )
  }
}

