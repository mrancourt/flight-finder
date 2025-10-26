# Deploying Flight Finder to Render

This guide walks you through deploying both the backend API and frontend UI to Render.

## 🚀 Quick Deploy (Easiest Method)

### Option 1: Using Render Blueprint (Recommended)

1. **Push your code to GitHub** (if not already done)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy via Render Dashboard**
   - Go to [render.com](https://render.com) and sign up/login
   - Click **"New +"** → **"Blueprint"**
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml` and set up both services!

3. **Upload flights.csv**
   - After deployment, go to your `flights-api` service
   - Click **"Shell"** in the left sidebar
   - Upload `flights.csv` to the root directory, or set up persistent storage

---

## 📋 Manual Deployment (Alternative)

If you prefer to set up each service individually:

### Backend API Deployment

1. **Create Web Service**
   - Go to Render Dashboard → **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Configure:
     - **Name**: `flights-api`
     - **Region**: Oregon (or closest to you)
     - **Branch**: `main`
     - **Root Directory**: (leave empty)
     - **Environment**: `Python 3`
     - **Build Command**: `pip install -r server/requirements.txt`
     - **Start Command**: `cd server && uvicorn server:app --host 0.0.0.0 --port $PORT`
     - **Plan**: Free

2. **Environment Variables**
   - Add `PYTHON_VERSION`: `3.11.0`
   - (Optional) `FLIGHTS_CSV`: `/opt/render/project/src/flights.csv`

3. **Upload flights.csv**
   - Use Render Shell or set up persistent disk
   - Or modify the app to use a database/cloud storage

### Frontend UI Deployment

1. **Create Static Site**
   - Go to Render Dashboard → **"New +"** → **"Static Site"**
   - Connect your GitHub repository
   - Configure:
     - **Name**: `flights-ui`
     - **Region**: Oregon (or closest to you)
     - **Branch**: `main`
     - **Root Directory**: `client`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`

2. **Update API URL**
   - Before deploying, update your frontend to use the production API URL
   - Edit `client/src/api.ts` to use your Render API URL

---

## 🔧 Configuration Files Created

### `render.yaml`
Blueprint file that defines both services. Render automatically detects and uses this.

### `client/src/api.ts` (needs update)
Update the API base URL to use environment variables:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

Then add to Render environment variables:
- **Key**: `VITE_API_URL`
- **Value**: `https://flights-api.onrender.com` (your actual API URL)

---

## 📁 Handling flights.csv Data

Since the free tier doesn't include persistent storage, here are options:

### Option 1: Persistent Disk (Recommended for Production)
1. In Render Dashboard, go to your `flights-api` service
2. Add a **Persistent Disk**:
   - Mount Path: `/data`
   - Size: 1GB (free tier)
3. Update `FLIGHTS_CSV` env var: `/data/flights.csv`
4. Upload file via Shell or use the scraper on Render

### Option 2: Include in Git (Simple but not ideal)
- Commit `flights.csv` to your repository
- It will be deployed with your code
- Not recommended for frequently changing data

### Option 3: Cloud Storage
- Use AWS S3, Google Cloud Storage, or similar
- Update server.py to fetch from cloud URL
- Best for production with frequent updates

### Option 4: SQLite Database
- Convert CSV to SQLite database
- Easier to manage and query
- Can use Render's persistent disk

---

## 🔄 Auto-Deploy on Git Push

Once connected to GitHub, Render automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Update flight data"
git push origin main
```

Both services will rebuild and redeploy automatically!

---

## 🌐 Your Live URLs

After deployment, you'll get URLs like:
- **Backend API**: `https://flights-api.onrender.com`
  - API Docs: `https://flights-api.onrender.com/docs`
- **Frontend**: `https://flights-ui.onrender.com`

---

## ⚠️ Important Notes

### Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free (multiple services share this)

### CORS Configuration
Your backend already has CORS enabled for all origins. For production, update this in `server/server.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://flights-ui.onrender.com"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Environment-Specific API URL
Update `client/src/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 
                     (import.meta.env.DEV 
                      ? 'http://localhost:8000' 
                      : 'https://flights-api.onrender.com');
```

---

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Render Dashboard
- Ensure all dependencies are in `requirements.txt` and `package.json`

### API Connection Issues
- Verify CORS settings
- Check that `VITE_API_URL` is set correctly
- Ensure backend is running (check logs)

### Missing flights.csv
- Upload via Shell or set up persistent disk
- Check `FLIGHTS_CSV` environment variable path

### Slow Cold Starts
- This is normal on free tier
- Upgrade to paid plan for always-on instances
- Or keep service alive with uptime monitoring service

---

## 📚 Next Steps

1. Set up a custom domain (optional)
2. Add monitoring and alerts
3. Set up a database instead of CSV
4. Add authentication if needed
5. Configure automated backups for flight data

---

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [Render Blueprints](https://render.com/docs/blueprint-spec)
- [Deploy FastAPI](https://render.com/docs/deploy-fastapi)
- [Deploy React/Vite](https://render.com/docs/deploy-vite)
# Render Blueprint for Flight Finder
# This file defines both the backend and frontend services

services:
  # Backend API Service
  - type: web
    name: flights-api
    env: python
    region: oregon
    plan: free
    branch: main
    buildCommand: "pip install -r server/requirements.txt"
    startCommand: "cd server && uvicorn server:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: FLIGHTS_CSV
        sync: false
    healthCheckPath: /api/flights

  # Frontend Static Site
  - type: web
    name: flights-ui
    env: static
    region: oregon
    plan: free
    branch: main
    buildCommand: "cd client && npm install && npm run build"
    staticPublishPath: ./client/dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    envVars:
      - key: NODE_VERSION
        value: 20.11.0

