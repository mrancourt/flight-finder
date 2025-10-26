# 🚀 Quick Deploy to Render - TL;DR

## Easiest Way (5 Steps)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy on Render
- Go to https://render.com/
- Sign up (free) with GitHub
- Click **"New +"** → **"Blueprint"**
- Select your repository
- Render auto-detects `render.yaml` and creates both services!

### 3. Set Backend Environment Variable
- After deployment, go to `flights-api` service
- Environment → Add variable:
  - **FLIGHTS_CSV**: `/opt/render/project/src/flights.csv`

### 4. Upload flights.csv
Option A: Via Shell (easiest)
- Go to `flights-api` service
- Click **"Shell"** in sidebar
- Run: `cd /opt/render/project/src && ls -la`
- Upload flights.csv using the upload button

Option B: Add Persistent Disk (recommended)
- Go to `flights-api` service → Settings
- Add Disk: Mount path `/data`, size 1GB
- Update env var: `FLIGHTS_CSV=/data/flights.csv`
- Upload via shell to `/data/flights.csv`

### 5. Configure Frontend API URL
- Go to `flights-ui` service
- Environment → Add variable:
  - **VITE_API_URL**: `https://flights-api.onrender.com` (use your actual API URL)
- Click **"Manual Deploy"** → **"Deploy latest commit"**

## Done! 🎉

Your apps will be live at:
- **Frontend**: `https://flights-ui.onrender.com`
- **Backend**: `https://flights-api.onrender.com/docs`

## ⚠️ Free Tier Notes
- Services sleep after 15 min inactivity
- First request takes ~30-60s to wake up
- This is normal and expected on free tier

## Files Created for Deployment
- ✅ `render.yaml` - Defines both services
- ✅ `client/src/api.ts` - Updated to use env variables
- ✅ `client/.env.example` - Environment variable template
- ✅ `DEPLOYMENT.md` - Full deployment guide

## Need Help?
See `DEPLOYMENT.md` for detailed instructions and troubleshooting.

