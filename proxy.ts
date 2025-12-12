import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { hasEnvVars } from "@/lib/utils";
import { NextResponse } from "next/server";

/**
 * Proxy middleware function that handles authentication and session management.
 * This is the entry point for all requests and ensures users are authenticated
 * before accessing protected routes.
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip authentication check if env vars are not set (development)
  if (!hasEnvVars) {
    return await updateSession(request);
  }

  // Explicit authentication check for protected routes BEFORE session update
  if (pathname.startsWith("/protected")) {
    // Create Supabase client to verify authentication
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // Cookie setting will be handled by updateSession
          },
        },
      },
    );

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // If not authenticated, redirect to login immediately
    if (authError || !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Update session (handles cookie refresh and other route protections)
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
