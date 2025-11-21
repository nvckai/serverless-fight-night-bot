# Vercel Migration Guide

This guide walks you through migrating the Discord bot from Cloudflare Workers to Vercel Functions.

## Changes Made

### 1. **vercel.json** - Vercel Configuration
The `vercel.json` file contains the build configuration for Vercel:

```json
{
  "buildCommand": "bun dressed build",
  "outputDirectory": ".dressed"
}
```

This tells Vercel to:
- Run `bun dressed build` to compile your Discord bot commands and components
- Output the compiled files to the `.dressed` directory

### 2. **api/bot.ts** - Discord Interactions Handler
The main API route that handles all Discord interactions (commands, components, events):

```typescript
export const POST = (req: Request) => {
  // Handles Discord interactions from your bot's interactions endpoint
};
```

**Endpoint:** `https://your-project.vercel.app/api/bot`

Set this URL as your Discord application's Interactions Endpoint URL in the [Discord Developer Portal](https://discord.com/developers/applications).

### 3. **api/cron.ts** - Scheduled Notifications
Handles hourly notifications for fight events using Vercel Cron:

```typescript
export const POST = async (req: Request) => {
  // Executes the notifier that posts fight alerts to guilds
};
```

**Endpoint:** `https://your-project.vercel.app/api/cron`

### 4. **package.json** - Build Script
Updated with a standard `build` script for Vercel:

```json
{
  "scripts": {
    "build": "bun dressed build"
  }
}
```

## Deployment Steps

### 1. Prepare Environment Variables
Set these environment variables in Vercel (Project Settings → Environment Variables):

- `DISCORD_APP_ID` - Your Discord bot's application ID
- `DISCORD_PUBLIC_KEY` - Your Discord bot's public key
- `DISCORD_TOKEN` - Your Discord bot's token
- `ESPN_USER_AGENT` - (Optional) User agent for ESPN API requests
- `TZ` - Timezone (e.g., `America/New_York`)
- `RUN_AT` - Hour to run notifications (0-23, based on TZ)
- `VERCEL_CRON_SECRET` - A secret token for cron requests (generate a random string)

> **Important:** Never commit these values. Use Vercel's environment variable management.

### 2. Deploy to Vercel

#### Option A: GitHub Integration (Recommended)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New..." → "Project"
4. Import your repository
5. Vercel will auto-detect the configuration from `vercel.json`
6. Click "Deploy"

#### Option B: CLI Deployment
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy to production
vercel --prod
```

### 3. Configure Discord Application

After deployment, update your Discord bot's Interactions Endpoint URL:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to "General Information"
4. Set **Interactions Endpoint URL** to: `https://your-project.vercel.app/api/bot`
5. Click "Save Changes"

Discord will send a verification request - if configured correctly, it will succeed.

### 4. Set Up Cron Job (For Notifications)

Add a `vercel.json` cron configuration to schedule notifications:

**Option A: Using Vercel dashboard**
1. Go to Project Settings → Cron Jobs
2. Add a new cron job:
   - **Path:** `/api/cron`
   - **Schedule:** `0 * * * *` (every hour)
   - **Secret:** Use the `VERCEL_CRON_SECRET` you set

**Option B: Using vercel.json**
```json
{
  "buildCommand": "bun dressed build",
  "outputDirectory": ".dressed",
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 * * * *"
    }
  ]
}
```

Note: Standard cron scheduling on Vercel runs once per hour. The bot checks the `RUN_AT` environment variable to determine if it should send notifications.

## Migration Differences from Cloudflare Workers

### What Changed

| Feature | Cloudflare | Vercel |
|---------|-----------|--------|
| **KV Storage** | `FIGHT_NIGHT_SETTINGS` KV binding | Requires external database/storage (TODO) |
| **Scheduled Events** | Defined in `wrangler.jsonc` crons | Vercel Crons (manual setup needed) |
| **Environment Setup** | Automatic through wrangler | Manual through Vercel dashboard |
| **Request Context** | `ctx` parameter (waitUntil, etc.) | Uses standard Node.js/Edge Runtime |

### KV Storage Migration

Cloudflare Workers KV is no longer available. You have two options:

**Option 1: Use Vercel KV (Recommended)**
1. Go to Vercel → Storage → Create KV Store
2. Connect it to your project
3. Update imports in code from `FIGHT_NIGHT_SETTINGS` to use the new KV client

**Option 2: Use External Database**
- PostgreSQL, MongoDB, or other databases
- Update `src/services/guild-settings.ts` to connect to your database

### Scheduled Events Migration

**Before (Cloudflare):**
```jsonc
"triggers": {
  "crons": ["0 * * * *"]
}
```

**After (Vercel):**
- Set up manually in Vercel dashboard or `vercel.json`
- Crons execute at the top of every hour
- The bot internally checks `RUN_AT` to decide when to send notifications

## Troubleshooting

### Discord verification fails
- Ensure `/api/bot` is correctly handling the verification request
- Check that `DISCORD_PUBLIC_KEY` is set correctly in environment variables

### Notifications not sending
- Verify `/api/cron` is configured correctly
- Check `VERCEL_CRON_SECRET` matches between cron config and environment
- Review Vercel Function logs for errors

### Build fails
- Ensure `bun` is available (default on Vercel)
- Check that `dress build` command works locally: `bun dressed build`

## Rollback to Cloudflare

If you need to revert:
1. Keep the `wrangler.jsonc` configuration
2. Delete `vercel.json` and `/api` directory
3. Run `wrangler deploy`

## Next Steps

1. **Add external storage** for guild settings (currently Cloudflare KV)
2. **Set up monitoring** with Vercel's analytics
3. **Configure error tracking** (e.g., Sentry)
4. **Document your bot** for other developers

## References

- [Vercel Functions Documentation](https://vercel.com/docs/functions)
- [Vercel Crons](https://vercel.com/docs/crons)
- [Dressed Framework](https://dressed.sh)
- [Discord Interactions](https://discord.com/developers/docs/interactions/receiving-and-responding)
