# PostHog Integration - Quick Start

Get PostHog analytics data in your CMS in 5 minutes! 🚀

## What You'll Get

- ✅ Total events and unique users
- ✅ Daily/Monthly active users
- ✅ Top events breakdown
- ✅ Your PostHog insights displayed in CMS
- ✅ Clean analytics dashboard

## Setup (5 Minutes)

### 1. Get PostHog Credentials

Go to [PostHog Dashboard](https://app.posthog.com):

**Project ID:**
- Settings → Project → Copy "Project ID"

**API Key:**
- Profile → Personal API Keys → Create new key
- **Important:** Make sure it has **read** permissions
- Copy the key (starts with `phx_`)

### 2. Add to `.env.local`

```bash
POSTHOG_PROJECT_ID=12345
POSTHOG_PERSONAL_API_KEY=phx_xxxxxxxxxxxxxxxxxxxxx
```

### 3. Restart Dev Server

```bash
# Ctrl+C to stop
pnpm dev
```

### 4. View Analytics

Navigate to: **http://localhost:3000/protected/analytics/posthog**

## What's Been Added

### Files Created

1. **`lib/actions/posthog-analytics.ts`** - Server actions to fetch PostHog data
2. **`components/analytics/posthog-analytics.tsx`** - React component to display data
3. **`app/protected/analytics/posthog/page.tsx`** - Analytics page
4. **`app/api/posthog/summary/route.ts`** - API endpoint for summary data
5. **`app/api/posthog/insights/route.ts`** - API endpoint for insights

### Navigation Updated

The sidebar now has:
- Analytics → Overview (your existing analytics)
- Analytics → PostHog (new PostHog data)

## Next Steps

### 1. View Your Data

Visit `/protected/analytics/posthog` to see:
- Total events tracked
- Unique users
- Top events
- Active users stats

### 2. Create Custom Insights

In PostHog dashboard:
1. Go to **Insights**
2. Create new charts/funnels
3. They'll automatically appear in your CMS

### 3. Track More Events

On your frontend:

```javascript
// Track pageviews (automatic with PostHog)
posthog.capture('$pageview')

// Track custom events
posthog.capture('artwork_viewed', {
  artwork_id: '123',
  artwork_name: 'Sunset'
})

// Track user properties
posthog.identify('user_id', {
  email: 'user@example.com',
  plan: 'pro'
})
```

## API Usage

### In Components

```typescript
import { getPostHogSummary } from "@/lib/actions/posthog-analytics"

const summary = await getPostHogSummary("-7d", "now")
console.log(summary.totalEvents)
```

### Via API

```bash
# Get summary
curl http://localhost:3000/api/posthog/summary

# Get insights
curl http://localhost:3000/api/posthog/insights
```

## Troubleshooting

### "PostHog Not Configured"

✅ Check `.env.local` has both variables  
✅ Restart dev server  
✅ Verify credentials are correct

### No Data Showing

✅ Check PostHog is tracking events on your frontend  
✅ Visit PostHog dashboard to confirm events exist  
✅ Wait a few minutes for data to sync

### API Errors

✅ Verify Project ID is correct  
✅ Check API key has necessary permissions  
✅ Look at browser console for detailed errors

## Documentation

- **`POSTHOG_SETUP.md`** - Detailed setup guide
- **`POSTHOG_ADVANCED.md`** - Advanced features (funnels, feature flags, etc.)

## Example Events to Track

```javascript
// Page views
posthog.capture('$pageview', { path: '/about' })

// Button clicks
posthog.capture('button_clicked', { button: 'contact' })

// Artwork interactions
posthog.capture('artwork_viewed', { id: '123' })
posthog.capture('artwork_liked', { id: '123' })
posthog.capture('artwork_shared', { id: '123' })

// User actions
posthog.capture('search_performed', { query: 'landscape' })
posthog.capture('filter_applied', { filter: 'paintings' })
```

## What's Next?

1. ✅ **View PostHog data in CMS** - You're all set!
2. 🎯 **Create custom insights** - Build charts in PostHog
3. 🚀 **Track more events** - Add tracking to your frontend
4. 📊 **Build dashboards** - Combine insights into dashboards
5. 🎨 **Customize display** - Edit the components to match your needs

## Support

Need help? Check:
- `POSTHOG_SETUP.md` for detailed setup
- `POSTHOG_ADVANCED.md` for advanced features
- [PostHog Docs](https://posthog.com/docs)

---

**You're done!** 🎉 Your PostHog data is now integrated into your CMS.

