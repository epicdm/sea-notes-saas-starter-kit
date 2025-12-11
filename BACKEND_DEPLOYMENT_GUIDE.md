# Epic Voice AI Backend - DigitalOcean App Platform Deployment Guide

This guide walks through deploying the Flask backend to DigitalOcean App Platform to retire the old droplet (134.199.197.42).

## Prerequisites

- DigitalOcean account with App Platform access
- GitHub repository: `epicdm/sea-notes-saas-starter-kit`
- PostgreSQL database: `epic-voice-db` (already migrated)
- LiveKit Cloud account with API credentials
- OpenAI API key
- Clerk authentication keys (optional)

## Deployment Steps

### 1. Create App from GitHub

1. Go to [DigitalOcean App Platform Console](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Select "GitHub" as source
4. Choose repository: `epicdm/sea-notes-saas-starter-kit`
5. Select branch: `main`
6. Select source directory: `backend`
7. Enable "Autodeploy" for automatic deployments on push

### 2. Configure Environment Variables

Add the following environment variables in the App Platform console:

#### Required Variables:

```bash
# Database (use connection string from epic-voice-db database settings in DO console)
DATABASE_URL=<copy-from-digitalocean-database-connection-string>

# Flask Secret
SECRET_KEY=<generate-random-secret>

# LiveKit Credentials
LIVEKIT_URL=<your-livekit-url>
LIVEKIT_API_KEY=<your-livekit-key>
LIVEKIT_API_SECRET=<your-livekit-secret>

# OpenAI
OPENAI_API_KEY=<your-openai-key>

# Application URL
NEXT_PUBLIC_APP_URL=https://ai.epic.dm

# Port (auto-configured)
PORT=8080
```

#### Optional Variables (if using Clerk):

```bash
CLERK_SECRET_KEY=<your-clerk-secret>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-public-key>
```

### 3. Configure Build & Runtime Settings

The app.yaml file is already configured with:

- **Build Command**: Automatic (pip install -r requirements.txt)
- **Run Command**: `gunicorn --bind 0.0.0.0:8080 --workers 2 --timeout 120 app:app`
- **Health Check**: `/health` endpoint
- **HTTP Port**: 8080
- **Instance Size**: basic-xxs ($5/month)
- **Region**: NYC (same as database)

### 4. Deploy

1. Review all settings
2. Click "Create Resources"
3. Wait for initial deployment (~5-7 minutes)
4. Monitor build logs for any errors

### 5. Verify Deployment

Once deployed, test the backend:

```bash
# Health check
curl https://<app-url>.ondigitalocean.app/health

# Expected response:
{
  "status": "healthy",
  "service": "livekit-backend"
}
```

### 6. Update Frontend API Configuration

Update the frontend to point to the new backend URL:

1. In Vercel environment variables, add:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://<app-url>.ondigitalocean.app
   ```

2. Or use a custom domain for the backend:
   - Add domain in DO App Platform settings
   - Update DNS A record
   - Update frontend env var

### 7. Test End-to-End Integration

Test the full stack:

1. **Frontend**: https://ai.epic.dm
2. **Backend API**: https://<backend-url>/health
3. **Database**: Already connected via DATABASE_URL

Verify:
- ✅ User authentication works
- ✅ API endpoints respond correctly
- ✅ Database queries execute successfully
- ✅ LiveKit integration functions

### 8. Retire Old Droplet

Once everything is working:

1. Backup any remaining data from droplet 134.199.197.42
2. Take a final snapshot (optional)
3. Power off the droplet
4. Delete the droplet to stop billing

## Architecture After Migration

```
┌─────────────────────┐
│   Vercel (Frontend) │
│    ai.epic.dm       │
└──────────┬──────────┘
           │ HTTPS
           ▼
┌─────────────────────────────┐
│  DO App Platform (Backend)  │
│  epic-voice-backend         │
│  Flask + Gunicorn           │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ DO Managed PostgreSQL       │
│ epic-voice-db (18)          │
│ 15 users, 48 tables         │
└─────────────────────────────┘
```

## Cost Breakdown

| Component | Cost/Month |
|-----------|------------|
| Frontend (Vercel) | $0 (hobby tier) |
| Backend (DO App Platform) | $5 (basic-xxs) |
| Database (DO PostgreSQL) | $15 (basic node) |
| **Total** | **$20/month** |

**Savings**: ~$28/month from retiring the $48/month droplet!

## Monitoring & Logs

- **App Logs**: DigitalOcean App Platform → Runtime Logs tab
- **Build Logs**: DigitalOcean App Platform → Build Logs tab
- **Database Metrics**: DigitalOcean Databases → epic-voice-db → Insights
- **Application Metrics**: DO App Platform → Insights tab

## Troubleshooting

### Build Fails

- Check `requirements.txt` for compatibility issues
- Verify Python version in `runtime.txt` (3.12.3)
- Review build logs for missing dependencies

### Health Check Fails

- Ensure `/health` endpoint is accessible
- Check if app is binding to `0.0.0.0:8080`
- Verify PORT environment variable is set to 8080

### Database Connection Issues

- Verify DATABASE_URL format includes `?sslmode=require`
- Check database firewall allows App Platform IPs
- Ensure database is in same region (NYC)

### API Endpoints Return 500 Errors

- Check runtime logs for Python exceptions
- Verify all required environment variables are set
- Test database connection with migrations

## Support

- **Documentation**: [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- **Backend Code**: `/backend` directory in repository
- **Issues**: GitHub Issues in repository

---

**Last Updated**: December 11, 2025
**Deployment Status**: Ready for deployment
**Estimated Migration Time**: 30 minutes
