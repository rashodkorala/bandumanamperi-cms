# Security Implementation Guide

This document outlines the comprehensive security measures implemented in the Bandumanamperi CMS to protect your data and ensure secure access control.

## 🔒 Security Overview

The CMS implements a **multi-layered security approach**:

1. **Middleware-based Route Protection**
2. **Server-Side Authentication Verification**
3. **API Route Authentication**
4. **Row-Level Security (RLS) Policies**
5. **Storage Bucket Policies**

---

## 1. Middleware Protection

### What It Does
- Intercepts all requests before they reach your pages
- Verifies user authentication status
- Redirects unauthenticated users to login
- Protects the `/protected/*` routes

### Implementation
**File**: `middleware.ts` (root level)

```typescript
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}
```

### Protected Routes
- `/protected/*` - All admin/CMS routes
- Automatically redirects to `/auth/login` with return URL

### Public Routes
- `/` - Homepage
- `/auth/*` - Authentication pages
- `/artworks/*` - Public artwork pages
- `/docs/*` - Documentation
- `/api/artworks/*` - Public API endpoints

---

## 2. Server Actions Authentication

### What It Does
- Verifies authentication before executing any data modification
- Uses centralized `requireAuth()` helper
- Throws errors if user is not authenticated

### Implementation
All server actions in `lib/actions/` now use:

```typescript
import { requireAuth } from "@/lib/auth/verify-auth"

export async function createArtwork(artwork: ArtworkInsert) {
  // Verify authentication - throws error if not authenticated
  await requireAuth()
  
  // Continue with operation...
}
```

### Protected Actions
✅ **Artworks**: create, update, delete
✅ **Pages**: create, update, delete
✅ **Blogs**: create, update, delete
✅ **Performances**: create, update, delete
✅ **Media**: create, update, delete, get
✅ **Exhibitions**: add, update, delete

---

## 3. API Route Protection

### What It Does
- Verifies authentication for API endpoints
- Supports both cookie-based and Bearer token authentication
- Returns 401 Unauthorized for unauthenticated requests

### Implementation
**File**: `lib/auth/verify-auth.ts`

```typescript
export async function verifyApiAuth(request: Request): Promise<AuthResult> {
  // Checks Authorization header or falls back to cookies
}
```

### Protected API Routes
✅ `/api/analyze-photo` - AI photo analysis
✅ `/api/generate-project-content` - AI content generation
✅ `/api/generate-project-from-questions` - AI project generation

### Usage Example
```typescript
export async function POST(request: NextRequest) {
  const { user, error } = await verifyApiAuth(request)
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  // Continue...
}
```

---

## 4. Row-Level Security (RLS) Policies

### What It Does
- Database-level security enforcement
- Ensures users can only access/modify their own data
- Public users can only view published content

### Implementation
**File**: `database-rls-enhanced-security.sql`

Run this SQL script in your Supabase SQL Editor to apply enhanced RLS policies.

### Policy Summary

#### Artworks Table
- ✅ **Public**: Can view published artworks only
- ✅ **Authenticated**: Can view all, create, update, delete artworks

#### Pages Table
- ✅ **Public**: Can view published pages only
- ✅ **Authenticated**: Can only view/modify their own pages (user_id check)

#### Blogs Table
- ✅ **Public**: Can view published blogs only
- ✅ **Authenticated**: Can only view/modify their own blogs (user_id check)

#### Performances Table
- ✅ **Public**: Can view published performances only
- ✅ **Authenticated**: Can view all, create, update, delete performances

#### Media Table
- ✅ **Authenticated**: Can only view/modify their own media (user_id check)
- ❌ **Public**: No access

### Applying RLS Policies

```bash
# In Supabase SQL Editor, run:
cat database-rls-enhanced-security.sql
```

---

## 5. Storage Bucket Security

### What It Does
- Controls who can upload, update, delete, and view files
- Separate policies for each storage bucket

### Bucket Policies

#### Artworks Bucket
- ✅ **Authenticated**: Can upload, update, delete images
- ✅ **Public**: Can view images (read-only)

#### Pages Bucket
- ✅ **Authenticated**: Can upload, update, delete files
- ✅ **Public**: Can view files (read-only)

#### Performances Bucket
- ✅ **Authenticated**: Can upload, update, delete files
- ✅ **Public**: Can view files (read-only)

---

## 🛡️ Security Best Practices

### 1. Environment Variables
Keep these secure and never commit to version control:

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
POSTHOG_PERSONAL_API_KEY=your_posthog_key
```

### 2. Password Requirements
- Minimum 8 characters
- Enforced by Supabase Auth

### 3. Session Management
- Sessions are automatically refreshed by middleware
- Expired sessions redirect to login
- Session cookies are HTTP-only and secure

### 4. CORS & API Security
- API routes verify authentication
- No public write access to database
- All mutations require authentication

---

## 🔍 Security Checklist

Use this checklist to verify your security implementation:

### Middleware
- [ ] `middleware.ts` exists at root level
- [ ] Middleware is configured with proper matcher
- [ ] Protected routes redirect to login

### Server Actions
- [ ] All create/update/delete actions use `requireAuth()`
- [ ] Auth helper is imported from `@/lib/auth/verify-auth`
- [ ] Actions throw errors for unauthorized access

### API Routes
- [ ] All API routes use `verifyApiAuth()`
- [ ] Unauthorized requests return 401 status
- [ ] API keys are stored in environment variables

### Database (RLS)
- [ ] RLS is enabled on all tables
- [ ] Public policies only allow viewing published content
- [ ] User-owned content uses `user_id = auth.uid()` checks
- [ ] Storage buckets have proper policies

### Environment
- [ ] `.env.local` is in `.gitignore`
- [ ] All secrets are stored in environment variables
- [ ] Production environment variables are set in hosting platform

---

## 🚨 Common Security Issues & Fixes

### Issue: Users can access other users' data
**Fix**: Ensure RLS policies use `user_id = auth.uid()` checks

```sql
CREATE POLICY "Users can view their own pages"
ON pages FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

### Issue: Unauthenticated API access
**Fix**: Add `verifyApiAuth()` to API route handlers

```typescript
const { user, error } = await verifyApiAuth(request)
if (error || !user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
```

### Issue: Server actions bypass authentication
**Fix**: Add `requireAuth()` at the start of server actions

```typescript
export async function createArtwork(artwork: ArtworkInsert) {
  await requireAuth() // Add this line
  // ... rest of function
}
```

---

## 📝 Testing Security

### Test Authentication
1. Log out of the application
2. Try to access `/protected/dashboard`
3. Should redirect to `/auth/login`

### Test API Protection
```bash
# Should return 401 Unauthorized
curl -X POST http://localhost:3000/api/analyze-photo \
  -H "Content-Type: application/json" \
  -d '{"file": "test"}'
```

### Test RLS Policies
1. Create content as User A
2. Log in as User B
3. Try to modify User A's content
4. Should fail or not be visible

---

## 🔄 Updating Security

When adding new features:

1. **New Server Action**: Add `requireAuth()` at the start
2. **New API Route**: Add `verifyApiAuth()` check
3. **New Table**: Enable RLS and create policies
4. **New Storage Bucket**: Create upload/view policies

---

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)

---

## 🆘 Support

If you encounter security issues:

1. Check this guide first
2. Review the error messages
3. Verify environment variables are set
4. Check Supabase dashboard for RLS policy errors
5. Review browser console for authentication errors

---

**Last Updated**: December 2024
**Security Level**: Production-Ready ✅


