# Analytics Setup Guide

This guide explains how to set up analytics tracking for your personal websites (www.rashodkorala.com and photos.rashodkorala.com).

## Overview

The CMS includes a built-in analytics system that can track page views and events from multiple frontend websites. All data is collected in your CMS database and displayed on the dashboard.

## Setup Steps

### 1. Run Database Migration

Run the analytics schema SQL in your Supabase SQL Editor:

```sql
-- See database-schema-analytics.sql
```

This creates:
- `analytics` table for storing events
- Row Level Security policies
- Indexes for fast queries
- Summary function for dashboard data

### 2. Configure CORS (if needed)

If your frontends are on different domains, you may need to configure CORS in `next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: '/api/analytics/track',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' }, // Or specific domains
        { key: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        { key: 'Access-Control-Allow-Credentials', value: 'true' },
      ],
    },
  ]
}
```

### 3. Add Tracking Script to Your Websites

#### Option A: Using the Provided Script

1. Host the `analytics.js` file from `/public/analytics.js` on your CMS domain
2. Add this to your frontend websites (www.rashodkorala.com and photos.rashodkorala.com):

```html
<!-- Add before closing </body> tag -->
<script src="https://your-cms-domain.com/analytics.js"></script>
<script>
  window.CMSAnalytics.init({
    apiUrl: 'https://your-cms-domain.com/api/analytics/track',
    domain: 'www.rashodkorala.com' // Use 'photos.rashodkorala.com' for photos site
  });
</script>
```

#### Option B: Custom Implementation

If you prefer to implement tracking yourself, send POST requests to `/api/analytics/track`:

```javascript
// Track page view
fetch('https://your-cms-domain.com/api/analytics/track', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important: includes auth cookies
  body: JSON.stringify({
    eventType: 'pageview',
    domain: 'www.rashodkorala.com',
    path: window.location.pathname,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    deviceType: 'desktop', // or 'mobile', 'tablet'
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    sessionId: 'unique-session-id', // Generate and persist
  }),
});
```

### 4. Authentication Setup

The analytics API supports two authentication methods:

#### Option A: API Key (Recommended for External Sites)

1. Add to your `.env.local`:
```env
ANALYTICS_API_KEY=your-secret-key-here
ANALYTICS_USER_ID=your-supabase-user-id
```

2. Get your user ID from Supabase Dashboard → Authentication → Users

3. Update the tracking script initialization:
```html
<script>
  window.CMSAnalytics.init({
    apiUrl: 'https://your-cms-domain.com/api/analytics/track',
    domain: 'www.rashodkorala.com',
    apiKey: 'your-secret-key-here', // From .env.local
    userId: 'your-user-id' // Optional if ANALYTICS_USER_ID is set
  });
</script>
```

#### Option B: Session-Based (For CMS Internal)

If tracking from within the CMS, session cookies are automatically used. No additional setup needed.

## What Gets Tracked

- **Page Views**: Automatic tracking on page load and navigation
- **Custom Events**: Track button clicks, form submissions, etc.
- **Device Information**: Desktop, mobile, tablet
- **Browser & OS**: Detected from user agent
- **Screen Size**: For responsive design insights
- **Referrer**: Where visitors came from
- **Session ID**: To track unique visitors

## Dashboard Features

The dashboard shows:

1. **Total Projects**: Count of all your projects
2. **Total Photos**: Count of all your photos
3. **Total Pageviews**: Last 30 days across all domains
4. **Unique Visitors**: Last 30 days (based on session IDs)
5. **Pageviews Chart**: Daily pageviews over time
6. **Top Pages**: Most visited pages
7. **Top Domains**: Traffic breakdown by domain
8. **Device Breakdown**: Desktop vs mobile vs tablet

## Example Integration

### For www.rashodkorala.com

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Personal Website</title>
</head>
<body>
  <!-- Your website content -->
  
  <!-- Analytics tracking -->
  <script src="https://your-cms-domain.com/analytics.js"></script>
  <script>
    window.CMSAnalytics.init({
      apiUrl: 'https://your-cms-domain.com/api/analytics/track',
      domain: 'www.rashodkorala.com'
    });
  </script>
</body>
</html>
```

### For photos.rashodkorala.com

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Photography Portfolio</title>
</head>
<body>
  <!-- Your photos website content -->
  
  <!-- Analytics tracking -->
  <script src="https://your-cms-domain.com/analytics.js"></script>
  <script>
    window.CMSAnalytics.init({
      apiUrl: 'https://your-cms-domain.com/api/analytics/track',
      domain: 'photos.rashodkorala.com'
    });
  </script>
</body>
</html>
```

## Custom Events

Track custom events (button clicks, form submissions, etc.):

```javascript
// Track a button click
window.CMSAnalytics.trackEvent('button_click', {
  buttonName: 'Contact Me',
  page: '/about'
}, {
  apiUrl: 'https://your-cms-domain.com/api/analytics/track',
  domain: 'www.rashodkorala.com'
});
```

## Privacy Considerations

- IP addresses are hashed before storage
- No personally identifiable information is collected
- Session IDs are stored in browser sessionStorage (cleared on browser close)
- You can add GDPR compliance features if needed

## Troubleshooting

### No data showing in dashboard

1. Check that the analytics table exists and has data:
   ```sql
   SELECT COUNT(*) FROM analytics;
   ```

2. Verify the API endpoint is accessible:
   ```bash
   curl -X POST https://your-cms-domain.com/api/analytics/track \
     -H "Content-Type: application/json" \
     -d '{"eventType":"pageview","domain":"test.com","path":"/"}'
   ```

3. Check browser console for errors
4. Verify authentication is working

### CORS errors

- Add your frontend domains to CORS configuration
- Ensure `credentials: 'include'` is set in fetch requests

### Authentication issues

- Verify Supabase auth is set up on frontend sites
- Check that cookies are being sent with requests
- Consider using API key authentication as alternative

## Data Retention

Analytics data is stored indefinitely. You can add cleanup jobs to remove old data:

```sql
-- Delete analytics older than 1 year
DELETE FROM analytics 
WHERE created_at < NOW() - INTERVAL '1 year';
```

## Next Steps

1. Run the database migration
2. Add tracking scripts to your websites
3. Test tracking by visiting your sites
4. Check the dashboard to see data appear
5. Customize tracking for your specific needs

