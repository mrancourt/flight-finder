# 🆓 Deploy to Render for FREE with Docker

## ✅ YES! You can deploy for FREE on Render using Docker!

Render's free tier supports Docker containers for web services. This is the best way to deploy both your backend and frontend for **completely free**.

---

## 🚀 Quick Deploy (Docker Method - FREE)

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for free Docker deployment"
git push origin main
```

### Step 2: Deploy via Render Blueprint

1. Go to https://render.com/ and sign up/login
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect `render.yaml` and show both services
5. **Important**: On the pricing page, select **"Free"** instance type for the backend
6. The frontend static site is automatically free
7. Click **"Apply"**

### Step 3: Wait for Deployment

- Backend: Builds Docker image (~2-3 minutes)
- Frontend: Builds static site (~1-2 minutes)

### Step 4: Set Frontend API URL

1. Go to your `flights-ui` service in Render dashboard
2. Environment → Add variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://flights-api.onrender.com` (your backend URL)
3. Click **"Save Changes"** and redeploy

---

## 📦 What We Created

### Files for Docker Deployment:

1. **`Dockerfile`** - Backend API container
   - Uses Python 3.11
   - Installs FastAPI dependencies
   - Includes flights.csv
   - Runs uvicorn server

2. **`Dockerfile.frontend`** - Frontend container (optional)
   - Multi-stage build
   - Builds React app with Vite
   - Serves with nginx
   - Only needed if you want to deploy frontend as Docker too

3. **`render.yaml`** - Updated for Docker deployment
   - Backend uses `env: docker`
   - Frontend remains static site (free)

---

## 🆓 Render Free Tier with Docker

### What's FREE:
- ✅ Docker web services (750 hours/month)
- ✅ Static sites (unlimited)
- ✅ Automatic SSL certificates
- ✅ Custom domains
- ✅ Auto-deploy from GitHub

### Limitations:
- ⏱️ Services spin down after 15 minutes of inactivity
- 🐌 Cold start takes ~30-60 seconds
- 💾 No persistent storage (files are ephemeral)
- 🔄 750 hours/month shared across all services

---

## 🎯 Deployment Options

### Option A: Both Services via Blueprint (Easiest)
- Use the updated `render.yaml`
- Backend as Docker (free)
- Frontend as static site (free)
- **Total cost: $0/month**

### Option B: Manual Deployment

#### Backend (Docker):
1. New → Web Service
2. Connect GitHub repo
3. Settings:
   - **Environment**: Docker
   - **Dockerfile Path**: `./Dockerfile`
   - **Instance Type**: Free
4. Add env var: `FLIGHTS_CSV=/app/flights.csv`

#### Frontend (Static Site):
1. New → Static Site
2. Connect GitHub repo
3. Settings:
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`
4. Add env var: `VITE_API_URL=<your-backend-url>`

---

## 🧪 Test Locally with Docker

Before deploying, test the Docker containers locally:

### Backend:
```bash
# Build
docker build -t flights-api .

# Run
docker run -p 8000:8000 flights-api

# Test
curl http://localhost:8000/api/flights
```

### Frontend (optional):
```bash
# Build
docker build -f Dockerfile.frontend -t flights-ui .

# Run
docker run -p 3000:80 flights-ui

# Open browser
open http://localhost:3000
```

---

## 📊 Free Tier Comparison

| Platform | Backend | Frontend | Total Free |
|----------|---------|----------|------------|
| **Render (Docker)** | ✅ Free | ✅ Free | $0/month |
| Railway | ✅ $5 credit | ✅ Free | ~$0-5/month |
| Fly.io | ✅ Free (500h) | ✅ Free | $0/month |
| Vercel | ⚠️ Limited | ✅ Free | $0/month |

**Winner: Render with Docker** - Easiest setup, both services free!

---

## 🔧 Troubleshooting

### "No free plan available"
- Make sure you select **"Free"** instance type during setup
- Docker services have a free tier option
- If not visible, try manual deployment instead of Blueprint

### Cold Starts
- First request after 15 min takes 30-60s to wake up
- This is normal on free tier
- Upgrade to $7/month for always-on if needed

### Build Fails
- Check Docker logs in Render dashboard
- Ensure `flights.csv` is committed to Git
- Verify Dockerfile syntax

### Frontend Can't Reach Backend
- Check CORS settings in `server/server.py`
- Verify `VITE_API_URL` is set correctly
- Use full URL: `https://flights-api.onrender.com` (not localhost)

---

## ✅ Success Checklist

- [x] `Dockerfile` created for backend
- [x] `Dockerfile.frontend` created (optional)
- [x] `render.yaml` updated for Docker
- [x] `flights.csv` committed to Git
- [ ] Code pushed to GitHub
- [ ] Render Blueprint deployed
- [ ] "Free" instance type selected
- [ ] `VITE_API_URL` env var set on frontend
- [ ] Both services tested and working

---

## 🎉 Result

Both services running on Render for **$0/month**:
- **Backend API**: `https://flights-api.onrender.com`
- **Frontend**: `https://flights-ui.onrender.com`

Enjoy your free deployment! 🚀

