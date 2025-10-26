# 🆓 100% Free Deployment - Verified Solution

## The Truth About Render's Free Tier (2025)

**Reality Check**: Render NO LONGER offers free web services (including Docker).
- ❌ Web Services: $7/month minimum
- ✅ Static Sites: Still FREE

## ✅ Truly FREE Solution

Deploy backend and frontend on different platforms - both 100% free:

---

## Option 1: Railway (Backend) + Render (Frontend) ⭐ RECOMMENDED

### Backend on Railway (FREE - $5 credit/month)

1. **Sign up at Railway**
   - Go to https://railway.app/
   - Sign up with GitHub (free $5/month credit)
   - No credit card required initially

2. **Deploy Backend**
   ```bash
   # Railway will auto-detect and deploy
   ```
   
   Or via Dashboard:
   - New Project → Deploy from GitHub repo
   - Select your repo
   - Railway auto-detects Python
   - It will automatically use the `Dockerfile`!

3. **Configure (if needed)**
   - Environment variables auto-detected
   - Railway provides public URL automatically
   - Example: `https://flights-api-production.up.railway.app`

### Frontend on Render (FREE)

1. **Go to Render Dashboard**
   - https://render.com/
   - New → Static Site

2. **Configure**
   - Repository: Your GitHub repo
   - Build Command: `cd client && npm install && npm run build`
   - Publish Directory: `client/dist`
   
3. **Add Environment Variable**
   - Key: `VITE_API_URL`
   - Value: Your Railway backend URL (e.g., `https://flights-api-production.up.railway.app`)

4. **Deploy**
   - Click "Create Static Site"
   - Free forever!

---

## Option 2: Fly.io (Both Backend & Frontend) - 100% Free

### Backend

1. **Install Fly CLI**
   ```bash
   brew install flyctl
   fly auth signup
   ```

2. **Deploy Backend**
   ```bash
   cd /Users/mrancourt/Projects/flights
   fly launch --name flights-api --region sea
   # Select: Yes to Dockerfile
   # Select: No to postgres
   # Select: No to redis
   fly deploy
   ```

3. **Get URL**
   ```bash
   fly status
   # Your URL: https://flights-api.fly.dev
   ```

### Frontend

1. **Create fly.toml for frontend**
   ```bash
   cd client
   fly launch --name flights-ui --region sea
   fly deploy
   ```

---

## Option 3: Vercel (Easiest for Frontend) + Railway (Backend)

### Backend on Railway
(Same as Option 1)

### Frontend on Vercel (FREE)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**
   ```bash
   cd client
   vercel
   # Follow prompts
   ```

3. **Set Environment Variable**
   ```bash
   vercel env add VITE_API_URL production
   # Enter your Railway backend URL
   ```

---

## 🎯 My Recommendation: Railway + Render

**Best balance of ease and reliability:**

### Why Railway for Backend?
- ✅ $5 free credit/month (enough for hobby projects)
- ✅ Auto-detects Dockerfile
- ✅ Easy setup (2 clicks)
- ✅ Great developer experience
- ✅ No credit card needed initially

### Why Render for Frontend?
- ✅ Actually free (forever)
- ✅ Simple static site hosting
- ✅ Automatic SSL
- ✅ Good performance

### Cost Breakdown:
- Railway Backend: $0/month (within free credit)
- Render Frontend: $0/month (always free)
- **Total: $0/month** ✅

---

## Quick Start: Railway + Render (5 minutes)

### Step 1: Deploy Backend to Railway

```bash
# Option A: Via CLI
npm install -g @railway/cli
railway login
railway init
railway up

# Option B: Via Dashboard (easier)
# 1. Go to https://railway.app/
# 2. Sign up with GitHub
# 3. New Project → Deploy from GitHub
# 4. Select your repo
# 5. Done! Copy the public URL
```

### Step 2: Deploy Frontend to Render

```bash
# 1. Go to https://render.com/
# 2. New → Static Site
# 3. Connect GitHub repo
# 4. Build: cd client && npm install && npm run build
# 5. Publish: client/dist
# 6. Env var: VITE_API_URL = <your-railway-url>
# 7. Create Static Site
```

### Step 3: Update CORS (if needed)

If you get CORS errors, update `server/server.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://flights-ui.onrender.com",  # Your Render frontend
        "http://localhost:5173"  # Local dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Free Tier Limits

### Railway:
- $5 credit/month
- ~500 hours of uptime
- No credit card needed initially
- Great for hobby projects

### Render Static Sites:
- Unlimited bandwidth
- Custom domains
- Automatic SSL
- Free forever

### Fly.io:
- 3 shared VMs free
- 160GB outbound traffic
- Generous free tier

---

## Summary

**Render charges $7/month for ANY web service now (including Docker).**

**Solution**: Use Railway (free credit) or Fly.io (free tier) for backend, and Render for frontend static site.

Both are legitimate free options that will work great for your project!

---

## Need Help Choosing?

- **Easiest**: Railway (backend) + Render (frontend)
- **Most control**: Fly.io (both)
- **Best for frontend**: Vercel or Render

All combinations are 100% free! 🎉

