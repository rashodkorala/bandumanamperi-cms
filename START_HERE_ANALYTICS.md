# 🚀 Analytics Setup - Start Here

Your CMS now uses **PostHog** for all analytics!

## ✅ What Changed

- ❌ Removed custom analytics system (no more SQL errors!)
- ✅ PostHog is now your main analytics
- ✅ Clean, simple setup
- ✅ More powerful features

## 🎯 Quick Setup (5 Minutes)

### Step 1: Get PostHog Credentials

Go to [PostHog Dashboard](https://app.posthog.com):

1. **Project ID**: Settings → Project → Copy the number
2. **API Key**: Profile → Personal API Keys → Create new key (make sure it has **read** permissions)

### Step 2: Add to `.env.local`

```bash
POSTHOG_PROJECT_ID=12345
POSTHOG_PERSONAL_API_KEY=phx_xxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Restart Server

```bash
pnpm dev
```

### Step 4: View Analytics

Go to: **http://localhost:3000/protected/analytics**

## 🎉 That's It!

You'll see:
- ✅ Total Events
- ✅ Unique Users
- ✅ Daily/Monthly Active Users
- ✅ Top Events
- ✅ Your PostHog Insights

## 📚 Documentation

- **`ANALYTICS_README.md`** - Quick reference
- **`POSTHOG_QUICKSTART.md`** - Detailed setup
- **`POSTHOG_SETUP.md`** - Full guide
- **`POSTHOG_ADVANCED.md`** - Advanced features

## ❓ What About Custom Analytics?

All custom analytics files are archived in `_archive/custom-analytics/`

You don't need them anymore! PostHog does everything better.

## 🔧 Troubleshooting

### "PostHog Not Configured" Message

✅ Add credentials to `.env.local`
✅ Restart dev server
✅ Check credentials are correct

### No Data Showing

✅ Make sure PostHog is installed on your frontend
✅ Check PostHog dashboard to confirm events exist
✅ Wait a few minutes for data to sync

## 🚀 Next Steps

1. **Setup PostHog** (add credentials above)
2. **Track events** on your frontend
3. **Create insights** in PostHog dashboard
4. **View data** in your CMS

---

**Need help?** See `POSTHOG_QUICKSTART.md` for detailed instructions!

