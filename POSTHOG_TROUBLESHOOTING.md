# PostHog Troubleshooting

Common issues and solutions when integrating PostHog analytics.

## Error: "PostHog API error: Forbidden"

### Symptom
You see an error in your terminal:
```
Error fetching PostHog insights: Error: PostHog API error: Forbidden
```

### Cause
Your Personal API Key doesn't have the correct permissions.

### Solution

#### 1. Check API Key Permissions

1. Go to [PostHog Dashboard](https://app.posthog.com)
2. Click your **profile picture** → **Personal API Keys**
3. Find your API key or create a new one
4. Make sure it has these scopes:
   - ✅ **Read insights** (required)
   - ✅ **Read events** (required)
   - ✅ **Read feature flags** (optional, for advanced features)

#### 2. Create New API Key with Correct Permissions

1. Go to **Personal API Keys**
2. Click **+ Create Personal API Key**
3. Give it a name: "CMS Integration"
4. Select scopes:
   - ✅ `project:read` (or specific read permissions)
   - ✅ `insights:read`
   - ✅ `events:read`
5. Click **Create Key**
6. Copy the key (starts with `phx_`)

#### 3. Update `.env.local`

Replace the old key with the new one:

```bash
POSTHOG_PERSONAL_API_KEY=phx_your_new_key_here
```

#### 4. Restart Dev Server

```bash
# Stop server (Ctrl+C)
pnpm dev
```

#### 5. Test

Visit: `http://localhost:3000/protected/analytics`

Should work now! ✅

---

## Error: "PostHog Not Configured"

### Symptom
You see a message on the analytics page saying PostHog is not configured.

### Cause
Environment variables are missing or not loaded.

### Solution

#### 1. Check `.env.local` Exists

Make sure you have a `.env.local` file in your project root:

```bash
ls -la .env.local
```

#### 2. Check Variables Are Set

Open `.env.local` and verify:

```bash
POSTHOG_PROJECT_ID=12345
POSTHOG_PERSONAL_API_KEY=phx_xxxxxxxxxxxxx
```

**Don't use quotes** around the values.

#### 3. Restart Dev Server

Environment variables are only loaded on startup:

```bash
# Stop server (Ctrl+C)
pnpm dev
```

---

## No Events Showing

### Symptom
Analytics page loads but shows 0 events, 0 users, etc.

### Possible Causes & Solutions

#### 1. PostHog Not Installed on Frontend

**Check:** Is PostHog actually tracking events on your frontend?

**Solution:**
```bash
# Install PostHog on your frontend
pnpm add posthog-js
```

```javascript
// In your frontend app
import posthog from 'posthog-js'

posthog.init('YOUR_POSTHOG_PROJECT_API_KEY', {
  api_host: 'https://app.posthog.com'
})
```

#### 2. Wrong Project ID

**Check:** Is the Project ID in `.env.local` correct?

**Solution:**
1. Go to PostHog Dashboard → Settings → Project
2. Copy the Project ID (just the number)
3. Update `.env.local`
4. Restart dev server

#### 3. New Project / No Data Yet

**Check:** Did you just create the PostHog project?

**Solution:** It's normal! Start tracking events on your frontend and they'll appear here.

---

## Error: "Invalid Project ID"

### Symptom
API errors mention invalid project ID.

### Solution

#### 1. Get Correct Project ID

1. Go to [PostHog Dashboard](https://app.posthog.com)
2. Click **Settings** → **Project**
3. Look for **Project ID** (it's a number like `12345`)
4. Copy **just the number**, nothing else

#### 2. Update `.env.local`

```bash
POSTHOG_PROJECT_ID=12345
```

**Don't use quotes!**

#### 3. Restart Server

```bash
pnpm dev
```

---

## Events Appear in PostHog but Not in CMS

### Symptom
PostHog dashboard shows events, but your CMS shows 0.

### Cause
API credentials might be for a different project.

### Solution

#### 1. Verify Project Match

Make sure the Project ID in `.env.local` matches the project in PostHog where you see events.

#### 2. Check API Key Project Access

1. Go to PostHog Dashboard
2. Check which projects your API key has access to
3. Make sure it includes the project you're trying to access

---

## Self-Hosted PostHog

### If You're Self-Hosting PostHog

Add this to `.env.local`:

```bash
POSTHOG_HOST=https://your-posthog-instance.com
POSTHOG_PROJECT_ID=12345
POSTHOG_PERSONAL_API_KEY=phx_xxxxx
```

Replace `https://your-posthog-instance.com` with your PostHog URL.

---

## Rate Limiting

### Symptom
Intermittent errors or slow loading.

### Cause
PostHog has API rate limits.

### Solution
The integration already caches data for 5 minutes. If you need longer caching:

Edit `lib/actions/posthog-analytics.ts`:

```typescript
next: { revalidate: 600 }, // Cache for 10 minutes
```

---

## Network Errors

### Symptom
`fetch failed` or network errors.

### Possible Causes

#### 1. Firewall Blocking PostHog
- Check your network allows connections to `app.posthog.com`
- Try from a different network

#### 2. PostHog Down
- Check [PostHog Status](https://status.posthog.com)

#### 3. VPN/Proxy Issues
- Try disabling VPN temporarily
- Configure proxy if needed

---

## Still Having Issues?

### 1. Check Server Logs

Look at your terminal for detailed error messages:

```bash
# Look for lines like:
PostHog API error: 403 Forbidden
Check your POSTHOG_PERSONAL_API_KEY has 'read' permissions
```

### 2. Test API Key Manually

```bash
curl -H "Authorization: Bearer phx_your_key" \
  https://app.posthog.com/api/projects/YOUR_PROJECT_ID/events?limit=1
```

Should return JSON with events.

### 3. Verify Environment Variables Loaded

Add this temporarily to `app/protected/analytics/page.tsx`:

```typescript
console.log('PostHog Project ID:', process.env.POSTHOG_PROJECT_ID)
console.log('API Key present:', !!process.env.POSTHOG_PERSONAL_API_KEY)
```

Check the terminal output.

### 4. Clear Next.js Cache

```bash
rm -rf .next
pnpm dev
```

### 5. Get Help

- [PostHog Docs](https://posthog.com/docs)
- [PostHog Community Slack](https://posthog.com/slack)
- [PostHog GitHub Issues](https://github.com/PostHog/posthog/issues)

---

## Common Mistakes

❌ **Using quotes in .env.local:**
```bash
POSTHOG_PROJECT_ID="12345"  # Wrong!
```

✅ **No quotes:**
```bash
POSTHOG_PROJECT_ID=12345  # Correct!
```

---

❌ **Using wrong API key:**
- Don't use the frontend project API key
- Use a Personal API Key with read permissions

---

❌ **Not restarting server:**
- Always restart after changing `.env.local`

---

## Quick Checklist

When things aren't working, check:

- [ ] `.env.local` exists in project root
- [ ] Project ID is correct (just the number)
- [ ] API key is correct (starts with `phx_`)
- [ ] API key has read permissions
- [ ] No quotes around values in `.env.local`
- [ ] Dev server restarted after changes
- [ ] PostHog is tracking events (check PostHog dashboard)
- [ ] Network allows connections to PostHog

---

**Still stuck?** Check the detailed logs in your terminal - they usually point to the exact issue!

