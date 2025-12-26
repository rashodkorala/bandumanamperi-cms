# PostHog Analytics Integration

This guide explains how to integrate PostHog analytics data into your CMS for visualization.

## Overview

PostHog is a powerful product analytics platform that you've installed on your frontend. This integration brings that data into your CMS dashboard for easy visualization and monitoring.

## Prerequisites

1. PostHog account at [posthog.com](https://posthog.com)
2. PostHog installed on your frontend (you've already done this ✅)
3. PostHog Project ID
4. PostHog Personal API Key

## Setup Steps

### Step 1: Get Your PostHog Credentials

1. **Get Project ID:**
   - Go to PostHog Dashboard
   - Click on **Settings** (gear icon) → **Project**
   - Copy your **Project ID** (it's a number like `12345`)

2. **Create Personal API Key:**
   - Go to PostHog Dashboard
   - Click on your profile picture → **Personal API Keys**
   - Click **+ Create Personal API Key**
   - Give it a name like "CMS Integration"
   - Copy the generated API key (starts with `phx_`)

### Step 2: Add Credentials to Environment Variables

Add these to your `.env.local` file:

```bash
# PostHog Configuration
POSTHOG_PROJECT_ID=12345
POSTHOG_PERSONAL_API_KEY=phx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: If you're self-hosting PostHog
# POSTHOG_HOST=https://your-posthog-instance.com
```

### Step 3: Restart Your Development Server

```bash
# Stop your dev server (Ctrl+C)
# Then restart it
pnpm dev
```

### Step 4: Access PostHog Analytics

Navigate to: `http://localhost:3000/protected/analytics/posthog`

You should now see:
- Total Events tracked
- Unique Users
- Daily/Monthly Active Users
- Top Events breakdown
- Your saved PostHog insights

## Features

### 1. Analytics Dashboard

The PostHog analytics page (`/protected/analytics/posthog`) displays:

- **Total Events**: All events tracked in the last 30 days
- **Unique Users**: Number of distinct users
- **Daily Active Users (DAU)**: Users active today
- **Monthly Active Users (MAU)**: Users active in the last 30 days
- **Top Events**: Most frequently triggered events
- **Saved Insights**: Your PostHog insights

### 2. API Endpoints

Two API endpoints are available for fetching PostHog data:

#### Get Summary
```bash
GET /api/posthog/summary?dateFrom=-30d&dateTo=now
```

Returns:
```json
{
  "totalEvents": 1234,
  "uniqueUsers": 567,
  "topEvents": [
    { "event": "$pageview", "count": 890 },
    { "event": "button_clicked", "count": 123 }
  ],
  "dailyActiveUsers": 45,
  "weeklyActiveUsers": 123,
  "monthlyActiveUsers": 567
}
```

#### List Insights
```bash
GET /api/posthog/insights
```

Returns an array of your saved PostHog insights.

### 3. Server Actions

You can use these server actions in your components:

```typescript
import {
  getPostHogSummary,
  listPostHogInsights,
  getPostHogInsight,
  getPostHogEvents,
} from "@/lib/actions/posthog-analytics"

// Get analytics summary
const summary = await getPostHogSummary("-30d", "now")

// List all insights
const insights = await listPostHogInsights()

// Get specific insight
const insight = await getPostHogInsight("insight_id")

// Get events
const events = await getPostHogEvents(100, "$pageview")
```

## Navigation

The analytics section now has two views:

1. **Overview** (`/protected/analytics`) - Your custom Supabase-based analytics
2. **PostHog** (`/protected/analytics/posthog`) - PostHog analytics data

Access them from the sidebar under **Analytics**.

## Common Events to Track

Here are some common events you might want to track on your frontend:

### Pageviews
```javascript
posthog.capture('$pageview', {
  path: window.location.pathname
})
```

### Button Clicks
```javascript
posthog.capture('button_clicked', {
  button_name: 'Contact',
  page: '/about'
})
```

### Artwork Views
```javascript
posthog.capture('artwork_viewed', {
  artwork_id: '123',
  artwork_title: 'Sunset Painting'
})
```

### Form Submissions
```javascript
posthog.capture('form_submitted', {
  form_name: 'contact_form',
  success: true
})
```

## Advanced Usage

### Creating Custom Insights in PostHog

1. Go to PostHog Dashboard → **Insights**
2. Click **+ New Insight**
3. Configure your chart (Trends, Funnels, Retention, etc.)
4. Save the insight
5. It will automatically appear in your CMS dashboard

### Querying Specific Date Ranges

```typescript
// Last 7 days
const summary = await getPostHogSummary("-7d", "now")

// Last month
const summary = await getPostHogSummary("-1m", "now")

// Custom date range
const summary = await getPostHogSummary("2024-01-01", "2024-01-31")
```

### Filtering Events

```typescript
// Get only pageview events
const pageviews = await getPostHogEvents(100, "$pageview")

// Get custom events
const buttonClicks = await getPostHogEvents(100, "button_clicked")
```

## Troubleshooting

### "PostHog Not Configured" Message

**Problem**: You see a message saying PostHog is not configured.

**Solution**:
1. Check that `POSTHOG_PROJECT_ID` and `POSTHOG_PERSONAL_API_KEY` are in `.env.local`
2. Restart your dev server
3. Verify the credentials are correct

### API Errors

**Problem**: Getting 401 or 403 errors.

**Solution**:
1. Verify your Personal API Key is correct
2. Make sure the API key has the necessary permissions
3. Check that your project ID is correct

### No Data Showing

**Problem**: Dashboard shows 0 for all metrics.

**Solution**:
1. Verify PostHog is properly installed on your frontend
2. Check that events are being captured in PostHog dashboard
3. Wait a few minutes for data to sync
4. Try adjusting the date range

### CORS Issues

**Problem**: API requests failing due to CORS.

**Solution**: The API routes are server-side, so CORS shouldn't be an issue. If you're calling them from client-side code, make sure to use the server actions instead.

## Data Privacy

- All PostHog data stays in your PostHog account
- The CMS only fetches data via API (no data is stored in CMS database)
- API keys are stored securely in environment variables
- Data is cached for 5 minutes to reduce API calls

## Next Steps

1. **Create Custom Insights**: Build insights in PostHog that are specific to your needs
2. **Set Up Dashboards**: Create PostHog dashboards and access them via the integration
3. **Add More Events**: Track more user interactions on your frontend
4. **Set Up Alerts**: Use PostHog's alert features to get notified of important events
5. **Implement Funnels**: Track user journeys through your site

## Resources

- [PostHog Documentation](https://posthog.com/docs)
- [PostHog API Reference](https://posthog.com/docs/api)
- [PostHog Events Reference](https://posthog.com/docs/data/events)
- [Creating Insights](https://posthog.com/docs/user-guides/insights)

## Support

If you need help:
1. Check the PostHog documentation
2. Review the troubleshooting section above
3. Check the browser console for errors
4. Verify your API credentials

---

**Note**: The integration uses PostHog's REST API with caching to minimize API calls. Data is refreshed every 5 minutes.

