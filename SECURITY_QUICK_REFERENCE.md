# Security Quick Reference Card

## 🚀 Quick Start

### 1. Apply Database Security (REQUIRED)
```bash
# In Supabase SQL Editor, run:
database-rls-enhanced-security.sql
```

### 2. Verify Environment Variables
```bash
# Check .env.local has:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 3. Test Security
```bash
# Start dev server
pnpm dev

# Test protected route (should redirect to login)
http://localhost:3000/protected/dashboard

# Test API (should return 401)
curl -X POST http://localhost:3000/api/analyze-photo
```

---

## 📝 Adding New Features

### New Server Action
```typescript
import { requireAuth } from "@/lib/auth/verify-auth"

export async function myNewAction(data: MyData) {
  await requireAuth() // Add this first!
  const supabase = await createClient()
  // ... your code
}
```

### New API Route
```typescript
import { verifyApiAuth } from "@/lib/auth/verify-auth"

export async function POST(request: NextRequest) {
  const { user, error } = await verifyApiAuth(request)
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  // ... your code
}
```

### New Database Table
```sql
-- Enable RLS
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view their own data"
ON my_table FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own data"
ON my_table FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
```

---

## 🔍 Troubleshooting

### "Unauthorized" Error
1. Check if user is logged in
2. Verify session hasn't expired
3. Check browser console for auth errors
4. Verify middleware.ts is at root level

### API Returns 401
1. Check if Authorization header is present
2. Verify API key in .env.local
3. Check verifyApiAuth() is called
4. Test with logged-in session

### RLS Policy Error
1. Verify RLS is enabled on table
2. Check policy uses correct user_id
3. Test in Supabase SQL Editor
4. Check auth.uid() returns user ID

### Can't Access Own Content
1. Verify user_id column exists
2. Check user_id is set on insert
3. Verify RLS policy uses auth.uid()
4. Check Supabase logs for errors

---

## 📚 Documentation

- **Full Guide**: `SECURITY_GUIDE.md`
- **Implementation Summary**: `SECURITY_IMPLEMENTATION_SUMMARY.md`
- **RLS Policies**: `database-rls-enhanced-security.sql`

---

## ✅ Security Checklist

- [ ] middleware.ts exists at root
- [ ] All server actions use requireAuth()
- [ ] All API routes use verifyApiAuth()
- [ ] RLS policies applied in Supabase
- [ ] Storage policies configured
- [ ] Environment variables set
- [ ] Tested authentication flow
- [ ] Tested unauthorized access

---

## 🎯 Key Files

```
├── middleware.ts                        # Route protection
├── lib/auth/verify-auth.ts              # Auth helpers
├── lib/actions/*.ts                     # Server actions (all protected)
├── app/api/*/route.ts                   # API routes (all protected)
├── database-rls-enhanced-security.sql   # RLS policies
└── SECURITY_GUIDE.md                    # Full documentation
```

---

**Quick Help**: See `SECURITY_GUIDE.md` for detailed information


