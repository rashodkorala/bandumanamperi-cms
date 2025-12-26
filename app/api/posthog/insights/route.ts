import { NextResponse } from "next/server"
import { listPostHogInsights } from "@/lib/actions/posthog-analytics"

export async function GET() {
  try {
    const insights = await listPostHogInsights()

    return NextResponse.json(insights)
  } catch (error) {
    console.error("Error in PostHog insights API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

