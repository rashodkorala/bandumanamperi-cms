# Archived: Custom Analytics System

This folder contains the original custom analytics system that was replaced by PostHog.

## Why Archived?

We decided to use PostHog exclusively for analytics instead of maintaining a custom system.

## What's Here

- `database-schema-analytics.sql` - Supabase database schema for custom analytics
- `analytics.ts` - Server actions for fetching analytics data
- `index.tsx` - React component for displaying custom analytics
- `chart-area-interactive.tsx` - Chart component
- Various documentation files

## If You Want to Restore It

1. Copy files back to their original locations:
   - `analytics.ts` → `lib/actions/`
   - `index.tsx` → `components/analytics/`
   - `chart-area-interactive.tsx` → `components/`
   - `database-schema-analytics.sql` → project root

2. Run the SQL migration in Supabase

3. Create `app/protected/analytics/custom/page.tsx` to use it

4. Update sidebar to add the link

## Recommendation

**Use PostHog instead!** It's more powerful and requires less maintenance.

See: `POSTHOG_QUICKSTART.md` in the project root.

