import { NextResponse } from "next/server"
import { getPostHogSummary } from "@/lib/actions/posthog-analytics"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get("dateFrom") || "-30d"
    const dateTo = searchParams.get("dateTo") || "now"

    const summary = await getPostHogSummary(dateFrom, dateTo)

    if (!summary) {
      return NextResponse.json(
        { error: "Failed to fetch PostHog summary. Check your credentials." },
        { status: 500 }
      )
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Error in PostHog summary API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

