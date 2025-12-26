# Quick Fix for PostHog 403 Error

You're getting `403 Forbidden` because your API key doesn't have the right permissions.

## Option 1: Test Your Connection (Recommended)

Run this in your terminal:

```bash
./test-posthog.sh
```

It will ask for your Project ID and API Key, then tell you exactly what's wrong.

## Option 2: Fix It Manually (5 minutes)

### Step 1: Create New API Key

1. Go to **[https://app.posthog.com](https://app.posthog.com)**
2. Click **Profile picture** (top right) → **Personal API Keys**
3. Click **+ Create Personal API Key**
4. Name it: **CMS Integration**
5. **CRITICAL - Select ALL these scopes:**
   - ✅ **Scopes for: Project**
     - ✅ Read project
   - ✅ **Scopes for: Event**
     - ✅ Read event
   - ✅ **Scopes for: Insight**
     - ✅ Read insight

6. Click **Create Key**
7. **Copy the key** (it starts with `phx_`)

### Step 2: Update .env.local

Open `.env.local` and replace these lines:

```bash
POSTHOG_PROJECT_ID=YOUR_PROJECT_ID_HERE
POSTHOG_PERSONAL_API_KEY=phx_THE_NEW_KEY_YOU_JUST_COPIED
```

**Make sure:**
- ✅ No quotes around values
- ✅ No spaces around `=`
- ✅ Project ID is just the number
- ✅ API key starts with `phx_`

### Step 3: Restart Everything

```bash
# Stop the dev server (Ctrl+C in terminal)

# Clear Next.js cache
rm -rf .next

# Start again
pnpm dev
```

### Step 4: Test

Go to: **http://localhost:3000/protected/analytics**

Should work now! ✅

---

## Still Not Working?

### Check 1: Verify Credentials Manually

Test your API key with curl:

```bash
curl -H "Authorization: Bearer phx_YOUR_KEY" \
  "https://app.posthog.com/api/projects/YOUR_PROJECT_ID/events?limit=1"
```

**Expected:** JSON response with events
**If 403:** API key still lacks permissions - create a new one
**If 401:** API key is invalid - double check you copied it correctly

### Check 2: Verify .env.local is Loaded

Add this temporarily to `app/protected/analytics/page.tsx` at the top:

```typescript
console.log('Project ID:', process.env.POSTHOG_PROJECT_ID)
console.log('API Key exists:', !!process.env.POSTHOG_PERSONAL_API_KEY)
```

**Expected in terminal:**
```
Project ID: 12345
API Key exists: true
```

**If false or undefined:** .env.local isn't being loaded - check filename and location

### Check 3: Common Mistakes

❌ **Wrong:**
```bash
POSTHOG_PROJECT_ID="12345"
POSTHOG_PERSONAL_API_KEY='phx_xxx'
```

✅ **Correct:**
```bash
POSTHOG_PROJECT_ID=12345
POSTHOG_PERSONAL_API_KEY=phx_xxx
```

---

❌ **Wrong:** Using the Frontend API key
✅ **Correct:** Using a Personal API Key with read scopes

---

❌ **Wrong:** Not restarting server after changing .env.local
✅ **Correct:** Always restart after env changes

---

## Understanding the Scopes

PostHog API keys have granular permissions. You need:

| Scope | What It Does | Required? |
|-------|--------------|-----------|
| `project:read` | Read project info | ✅ Yes |
| `event:read` | Read events data | ✅ Yes |
| `insight:read` | Read insights/charts | ✅ Yes |
| `feature_flag:read` | Read feature flags | ⚠️ Optional |

**Your old key probably has NO scopes or wrong scopes.**

---

## The Nuclear Option

If nothing works, start fresh:

1. **Delete** all PostHog API keys in dashboard
2. **Create ONE new key** with all read permissions
3. **Delete** `.env.local` 
4. **Create new** `.env.local` with just:
   ```bash
   POSTHOG_PROJECT_ID=12345
   POSTHOG_PERSONAL_API_KEY=phx_new_key
   ```
5. **Clear cache:** `rm -rf .next`
6. **Restart:** `pnpm dev`

---

## Need More Help?

- Run: `./test-posthog.sh` to diagnose
- Check: `POSTHOG_TROUBLESHOOTING.md` for detailed guide
- PostHog Docs: [posthog.com/docs/api](https://posthog.com/docs/api)

---

**Bottom line:** Create a NEW API key with the 3 read scopes, replace it in `.env.local`, restart server. That's it! 🚀

