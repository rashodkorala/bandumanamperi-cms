import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { AnalyticsEvent } from "@/lib/types/analytics"

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  })
}

// Simple hash function for IP addresses (privacy)
function hashIP(ip: string): string {
  // In production, use a proper hashing function
  // This is a simple example - you might want to use crypto.createHash
  return Buffer.from(ip).toString("base64").slice(0, 16)
}

// Detect device type from user agent
function detectDevice(userAgent: string): "desktop" | "mobile" | "tablet" | null {
  if (!userAgent) return null
  const ua = userAgent.toLowerCase()
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet"
  }
  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    )
  ) {
    return "mobile"
  }
  return "desktop"
}

// Extract browser name from user agent
function detectBrowser(userAgent: string): string | null {
  if (!userAgent) return null
  const ua = userAgent.toLowerCase()
  if (ua.includes("chrome") && !ua.includes("edg")) return "Chrome"
  if (ua.includes("firefox")) return "Firefox"
  if (ua.includes("safari") && !ua.includes("chrome")) return "Safari"
  if (ua.includes("edg")) return "Edge"
  if (ua.includes("opera") || ua.includes("opr")) return "Opera"
  return "Other"
}

// Extract OS from user agent
function detectOS(userAgent: string): string | null {
  if (!userAgent) return null
  const ua = userAgent.toLowerCase()
  if (ua.includes("windows")) return "Windows"
  if (ua.includes("mac os")) return "macOS"
  if (ua.includes("linux")) return "Linux"
  if (ua.includes("android")) return "Android"
  if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad")) return "iOS"
  return "Other"
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = (await request.json()) as AnalyticsEvent & { userId?: string }

    // Try to get user from session first (for CMS internal tracking)
    let user = null
    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser()

    if (sessionUser) {
      user = sessionUser
    } else {
      // If no session, try API key authentication for external sites
      const apiKey = request.headers.get("x-api-key")
      const expectedKey = process.env.ANALYTICS_API_KEY

      if (!apiKey || !expectedKey || apiKey !== expectedKey) {
        return NextResponse.json(
          { error: "Unauthorized - Invalid API key" },
          {
            status: 401,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Credentials": "true",
            },
          }
        )
      }

      // Get user ID from environment or request body
      const userId = body.userId || process.env.ANALYTICS_USER_ID

      if (!userId) {
        return NextResponse.json(
          { error: "User ID required. Set ANALYTICS_USER_ID in env or pass userId in request" },
          {
            status: 400,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Credentials": "true",
            },
          }
        )
      }

      // Create a user object with the ID (we'll use this for the insert)
      user = { id: userId } as any
    }

    // Validate required fields
    if (!body.eventType || !body.domain || !body.path) {
      return NextResponse.json(
        { error: "Missing required fields: eventType, domain, path" },
        { status: 400 }
      )
    }

    // Get IP address from request
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown"

    // Get user agent
    const userAgent = request.headers.get("user-agent") || body.userAgent || null

    // Detect device, browser, OS
    const deviceType = body.deviceType || (userAgent ? detectDevice(userAgent) : null)
    const browser = body.browser || (userAgent ? detectBrowser(userAgent) : null)
    const os = body.os || (userAgent ? detectOS(userAgent) : null)

    // Insert analytics event
    const { error } = await supabase.from("analytics").insert({
      user_id: user.id,
      event_type: body.eventType,
      domain: body.domain,
      path: body.path,
      artwork_id: body.artworkId || null,
      referrer: body.referrer || null,
      user_agent: userAgent,
      ip_address: hashIP(ipAddress),
      country: body.country || null,
      city: body.city || null,
      device_type: deviceType,
      browser: browser,
      os: os,
      screen_width: body.screenWidth || null,
      screen_height: body.screenHeight || null,
      session_id: body.sessionId || null,
      metadata: body.metadata || null,
    })

    if (error) {
      console.error("Analytics insert error:", error)
      return NextResponse.json(
        { error: "Failed to track event" },
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
          },
        }
      )
    }

    return NextResponse.json(
      { success: true },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    )
  } catch (error) {
    console.error("Analytics tracking error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
