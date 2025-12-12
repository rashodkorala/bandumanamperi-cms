import { NextRequest, NextResponse } from "next/server"
import { getAnalyticsSummary } from "@/lib/actions/analytics"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    const startDate = startDateParam ? new Date(startDateParam) : undefined
    const endDate = endDateParam ? new Date(endDateParam) : undefined

    const analytics = await getAnalyticsSummary(startDate, endDate)

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Analytics summary API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics summary" },
      { status: 500 }
    )
  }
}

