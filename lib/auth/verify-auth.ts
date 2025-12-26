/**
 * Authentication verification utilities
 * Provides consistent auth checks across server actions and API routes
 */

import { createClient } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"

export interface AuthResult {
  user: User | null
  error: string | null
}

/**
 * Verify that a user is authenticated
 * @returns AuthResult with user if authenticated, or error if not
 */
export async function verifyAuth(): Promise<AuthResult> {
  const supabase = await createClient()
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error("Auth verification error:", error)
    return { user: null, error: "Authentication failed" }
  }

  if (!user) {
    return { user: null, error: "Unauthorized: You must be logged in" }
  }

  return { user, error: null }
}

/**
 * Require authentication - throws error if not authenticated
 * Use this in server actions where you want to fail fast
 */
export async function requireAuth(): Promise<User> {
  const { user, error } = await verifyAuth()
  
  if (error || !user) {
    throw new Error(error || "Unauthorized")
  }
  
  return user
}

/**
 * Check if user has admin privileges
 * Currently checks if user is authenticated (can be extended with role checks)
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  
  // TODO: Add role-based checks here if you implement user roles
  // Example:
  // const { data: profile } = await supabase
  //   .from('profiles')
  //   .select('role')
  //   .eq('id', user.id)
  //   .single()
  // 
  // if (profile?.role !== 'admin') {
  //   throw new Error('Forbidden: Admin access required')
  // }
  
  return user
}

/**
 * Verify API request authentication
 * Use this in API route handlers
 */
export async function verifyApiAuth(request: Request): Promise<AuthResult> {
  // Check for Authorization header
  const authHeader = request.headers.get("Authorization")
  
  if (!authHeader?.startsWith("Bearer ")) {
    // Fall back to cookie-based auth
    return verifyAuth()
  }
  
  // If using Bearer token, verify it
  const token = authHeader.substring(7)
  const supabase = await createClient()
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    return { user: null, error: "Invalid or expired token" }
  }
  
  return { user, error: null }
}


