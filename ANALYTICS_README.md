# Analytics with PostHog

This CMS uses **PostHog** for all analytics needs.

## Quick Setup (5 minutes)

### 1. Get PostHog Credentials

Go to [PostHog Dashboard](https://app.posthog.com):

- **Project ID**: Settings → Project → Copy "Project ID"
- **API Key**: Profile → Personal API Keys → Create new key

### 2. Add to `.env.local`

```bash
POSTHOG_PROJECT_ID=12345
POSTHOG_PERSONAL_API_KEY=phx_xxxxxxxxxxxxxxxxxxxxx
```

### 3. Restart Dev Server

```bash
pnpm dev
```

### 4. View Analytics

Navigate to: **http://localhost:3000/protected/analytics**

## What You'll See

- **Total Events** - All events tracked by PostHog
- **Unique Users** - Number of distinct users
- **Daily/Monthly Active Users** - Engagement metrics
- **Top Events** - Most frequent events
- **Saved Insights** - Your PostHog dashboards/charts

## Documentation

- **`POSTHOG_QUICKSTART.md`** - Quick 5-minute setup guide
- **`POSTHOG_SETUP.md`** - Detailed setup instructions
- **`POSTHOG_ADVANCED.md`** - Advanced features (funnels, feature flags, experiments)

## Common PostHog Events

Track these on your frontend:

```javascript
// Pageviews (automatic)
posthog.capture('$pageview')

// Custom events
posthog.capture('artwork_viewed', {
  artwork_id: '123',
  artwork_title: 'Sunset Painting'
})

posthog.capture('button_clicked', {
  button_name: 'Contact',
  page: '/about'
})

// User identification
posthog.identify('user_id', {
  email: 'user@example.com',
  name: 'John Doe'
})
```

## Features Available

✅ **Events Tracking** - Track any user interaction
✅ **User Analytics** - Unique users, sessions, cohorts
✅ **Insights** - Pre-built charts and visualizations
✅ **Dashboards** - Collections of insights
✅ **Funnels** - Track user journeys
✅ **Feature Flags** - A/B testing and gradual rollouts
✅ **Session Recording** - Watch user sessions
✅ **Heatmaps** - See where users click

## Accessing PostHog Dashboard

You can access PostHog directly at: [https://app.posthog.com](https://app.posthog.com)

Your CMS pulls data from PostHog and displays it in a clean interface.

## Need Help?

1. Check the documentation files listed above
2. Visit [PostHog Docs](https://posthog.com/docs)
3. PostHog has great community support on their [Slack](https://posthog.com/slack)

## Custom Analytics (Archived)

If you need the old custom analytics system, see `_archive/custom-analytics/README.md`

---

**That's it!** Just add your credentials and you're ready to track and analyze your data with PostHog. 🚀

