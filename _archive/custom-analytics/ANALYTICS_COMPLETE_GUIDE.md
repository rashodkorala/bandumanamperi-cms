# Complete Analytics Guide

You now have **TWO analytics systems** in your CMS:

1. **Built-in Analytics** (Supabase-based) - Tracks data you collect
2. **PostHog Analytics** (PostHog-based) - Shows PostHog product analytics

---

## Current Issue: Built-in Analytics Error ⚠️

You're getting this error:
```
Analytics summary error: {}
```

### Fix (2 minutes):

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor**
3. Copy contents of `database-schema-analytics.sql`
4. Paste and **Run**
5. Refresh your CMS

**See:** `RUN_ANALYTICS_MIGRATION.md` for detailed steps.

---

## Analytics System 1: Built-in Analytics

**Location:** `/protected/analytics` (Overview)

**What it shows:**
- Pageviews you track yourself
- Artwork views
- Unique visitors
- Device breakdown
- Top pages

**Data source:** Your own Supabase database

**Setup required:**
1. ✅ Run analytics migration (to fix current error)
2. ✅ Add tracking scripts to your frontend websites

**Docs:** `ANALYTICS_SETUP.md`

### When to use:
- You want full control over tracking
- You want to store data in your own database
- You want custom tracking logic
- You want to track across multiple sites you own

---

## Analytics System 2: PostHog Analytics

**Location:** `/protected/analytics/posthog` 

**What it shows:**
- Events tracked by PostHog
- User behavior analytics
- Product analytics
- Feature flags
- A/B test results

**Data source:** PostHog cloud

**Setup required:**
1. ✅ Add PostHog credentials to `.env.local`
2. ✅ PostHog must be installed on your frontend (you said you did this ✅)

**Docs:** 
- `POSTHOG_QUICKSTART.md` (Quick setup)
- `POSTHOG_SETUP.md` (Detailed guide)
- `POSTHOG_ADVANCED.md` (Advanced features)

### When to use:
- You already have PostHog on your frontend
- You want product analytics (user flows, funnels, etc.)
- You want feature flags and A/B testing
- You want powerful analytics tools without building them

---

## Comparison

| Feature | Built-in Analytics | PostHog Analytics |
|---------|-------------------|-------------------|
| **Data Storage** | Your Supabase DB | PostHog Cloud |
| **Setup Complexity** | Medium | Easy |
| **Control** | Full control | Limited to PostHog API |
| **Cost** | Free (your DB) | Free tier + paid plans |
| **Features** | Basic tracking | Advanced product analytics |
| **Customization** | Fully customizable | Limited to PostHog features |
| **Privacy** | You control everything | PostHog handles data |

---

## Recommended Setup

### Option A: Use Both (Recommended)

**Built-in for:** Basic website analytics, custom tracking
**PostHog for:** Product analytics, user behavior, experiments

**Setup:**
1. Fix built-in analytics (run migration)
2. Add PostHog credentials
3. Use both dashboards as needed

### Option B: PostHog Only

**If you prefer:** Skip built-in analytics, just use PostHog

**Setup:**
1. Just add PostHog credentials
2. Use `/protected/analytics/posthog` only
3. Can hide built-in analytics from sidebar if needed

### Option C: Built-in Only

**If you prefer:** Full control, no external services

**Setup:**
1. Fix built-in analytics (run migration)
2. Add tracking scripts to frontend
3. Can remove PostHog integration if desired

---

## Quick Start: Fix Current Error

### Step 1: Fix Built-in Analytics (2 min)

```bash
# 1. Open Supabase SQL Editor
# 2. Run: database-schema-analytics.sql
# 3. Done!
```

See: `RUN_ANALYTICS_MIGRATION.md`

### Step 2: Add PostHog (5 min)

Add to `.env.local`:
```bash
POSTHOG_PROJECT_ID=12345
POSTHOG_PERSONAL_API_KEY=phx_xxxxx
```

See: `POSTHOG_QUICKSTART.md`

### Step 3: View Analytics

- Built-in: `http://localhost:3000/protected/analytics`
- PostHog: `http://localhost:3000/protected/analytics/posthog`

---

## Navigation

Both analytics pages are in the sidebar under **Analytics**:

```
Analytics
├── Overview    (Built-in - Supabase)
└── PostHog     (PostHog - Cloud)
```

---

## Data Flow

### Built-in Analytics

```
Your Frontend Website
       ↓
  (tracking script)
       ↓
Your CMS API (/api/analytics/track)
       ↓
Supabase Database (analytics table)
       ↓
CMS Dashboard (/protected/analytics)
```

### PostHog Analytics

```
Your Frontend Website
       ↓
  (PostHog SDK)
       ↓
PostHog Cloud
       ↓
       ↑
CMS API (/api/posthog/*)
       ↓
CMS Dashboard (/protected/analytics/posthog)
```

---

## Files Overview

### Built-in Analytics Files
```
database-schema-analytics.sql       # DB migration
lib/actions/analytics.ts           # Server actions
components/analytics/index.tsx     # React component
app/protected/analytics/page.tsx   # Analytics page
app/api/analytics/track/route.ts   # Tracking endpoint
```

### PostHog Analytics Files
```
lib/actions/posthog-analytics.ts           # Server actions
components/analytics/posthog-analytics.tsx # React component
app/protected/analytics/posthog/page.tsx   # PostHog page
app/api/posthog/summary/route.ts          # Summary endpoint
app/api/posthog/insights/route.ts         # Insights endpoint
```

---

## Documentation Index

| Document | Purpose |
|----------|---------|
| `ANALYTICS_COMPLETE_GUIDE.md` | **You are here** - Overview of both systems |
| `RUN_ANALYTICS_MIGRATION.md` | Fix the current error |
| `ANALYTICS_SETUP.md` | Built-in analytics detailed setup |
| `POSTHOG_QUICKSTART.md` | PostHog 5-minute setup |
| `POSTHOG_SETUP.md` | PostHog detailed setup |
| `POSTHOG_ADVANCED.md` | PostHog advanced features |

---

## Next Steps

1. **Fix the error** → Run analytics migration (2 min)
   - See: `RUN_ANALYTICS_MIGRATION.md`

2. **Add PostHog** → Add credentials to .env.local (5 min)
   - See: `POSTHOG_QUICKSTART.md`

3. **Start tracking** → Add tracking to your frontend
   - Built-in: See `ANALYTICS_SETUP.md`
   - PostHog: Already done if PostHog is installed ✅

4. **View data** → Check both dashboards
   - `/protected/analytics` - Built-in
   - `/protected/analytics/posthog` - PostHog

---

## FAQ

### Do I need both?

**No.** You can use just one:
- PostHog only: Simple, powerful, less control
- Built-in only: Full control, more setup
- Both: Best of both worlds (recommended)

### Which should I use?

**Start with PostHog** if:
- You already have it on your frontend ✅
- You want quick setup
- You want advanced analytics features

**Use Built-in if:**
- You want full control
- You want to store data yourself
- You have custom tracking needs

### Can I remove one?

**Yes!** 
- To remove PostHog page: Delete `app/protected/analytics/posthog/` folder
- To remove Built-in: Update sidebar, delete analytics components

### What about privacy?

**Built-in:** You control everything, data in your DB
**PostHog:** PostHog handles data (complies with GDPR)

Both can be configured to be privacy-friendly.

---

## Summary

✅ **Current status:**
- Built-in Analytics: ⚠️ Need to run migration
- PostHog Analytics: ✅ Ready (need credentials)

✅ **Next steps:**
1. Run migration → Fix error
2. Add PostHog credentials → Enable PostHog  
3. View both dashboards → See your data

✅ **Time needed:**
- Fix error: 2 minutes
- Setup PostHog: 5 minutes
- Total: ~7 minutes

---

**Questions?** Check the specific guides listed above!

