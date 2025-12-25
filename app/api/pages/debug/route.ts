import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get all pages (regardless of status) for debugging
    const { data: allPages, error } = await supabase
      .from("pages")
      .select("id, title, slug, status, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      total: allPages?.length || 0,
      pages: allPages || [],
      message: "This debug endpoint shows ALL pages regardless of status"
    })
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

