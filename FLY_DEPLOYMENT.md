# 🪁 Complete Fly.io Deployment Guide

## Why Fly.io is Great!

- ✅ **3 Free VMs** (shared-cpu-1x, 256MB RAM each)
- ✅ **160GB bandwidth/month** free
- ✅ **Global CDN** included
- ✅ **Auto SSL certificates**
- ✅ **Deploy from Dockerfile**
- ✅ **Great for full-stack apps**
- ✅ **No credit card required** for free tier

---

## 🚀 Quick Deploy (One Command)

```bash
./deploy-fly.sh
```

This automated script will:
1. ✅ Install Fly CLI (if needed)
2. ✅ Authenticate you with Fly.io
3. ✅ Deploy backend API
4. ✅ Deploy frontend UI
5. ✅ Configure them to work together
6. ✅ Give you both URLs

**Done in ~5 minutes!** ⚡

---

## 📋 Manual Deployment (Step-by-Step)

### Prerequisites

1. **Install Fly CLI**
   ```bash
   brew install flyctl
   ```

2. **Sign up / Login**
   ```bash
   flyctl auth signup
   # OR
   flyctl auth login
   ```

3. **Verify Installation**
   ```bash
   flyctl version
   ```

---

### Step 1: Deploy Backend API

```bash
# From project root
cd /Users/mrancourt/Projects/flights

# Launch backend (first time)
flyctl launch --config fly.toml --name flights-api --region sea --now --ha=false

# Or if already created, just deploy
flyctl deploy --config fly.toml
```

**What happens:**
- Fly.io builds your Docker image
- Deploys to their infrastructure
- Assigns URL: `https://flights-api.fly.dev`
- Configures auto-scaling (sleeps when idle)

**Get your backend URL:**
```bash
flyctl status --config fly.toml
# Look for "Hostname" field
```

---

### Step 2: Update Frontend Config

Edit `fly.frontend.toml` and set your backend URL:

```toml
[env]
  VITE_API_URL = "https://flights-api.fly.dev"  # Your actual backend URL
```

---

### Step 3: Deploy Frontend

```bash
# Deploy frontend with build arg
flyctl launch --config fly.frontend.toml --name flights-ui --region sea --now --ha=false --build-arg VITE_API_URL=https://flights-api.fly.dev

# Or if already created
flyctl deploy --config fly.frontend.toml --build-arg VITE_API_URL=https://flights-api.fly.dev
```

**Get your frontend URL:**
```bash
flyctl status --config fly.frontend.toml
# Look for "Hostname" field
```

---

## 🎯 Your Deployed Apps

After deployment:

| Service | URL | Config File |
|---------|-----|-------------|
| **Backend API** | `https://flights-api.fly.dev` | `fly.toml` |
| **Frontend** | `https://flights-ui.fly.dev` | `fly.frontend.toml` |
| **API Docs** | `https://flights-api.fly.dev/docs` | - |

---

## 🔧 Configuration Files Explained

### `fly.toml` (Backend)
```toml
app = "flights-api"                    # Your app name
primary_region = "sea"                  # Seattle region

[build]
  dockerfile = "Dockerfile"             # Uses your backend Dockerfile

[env]
  FLIGHTS_CSV = "/app/flights.csv"     # Environment variable

[http_service]
  internal_port = 8000                  # FastAPI runs on 8000
  auto_stop_machines = true             # Free tier: auto-sleep
  auto_start_machines = true            # Auto-wake on request
  min_machines_running = 0              # Can sleep completely

[[vm]]
  cpus = 1                              # Free tier specs
  memory_mb = 256
```

### `fly.frontend.toml` (Frontend)
```toml
app = "flights-ui"                     # Your app name
primary_region = "sea"                  # Seattle region

[build]
  dockerfile = "Dockerfile.frontend"    # Uses frontend Dockerfile

[env]
  VITE_API_URL = "https://..."          # Points to your backend

[http_service]
  internal_port = 80                    # Nginx serves on 80
  auto_stop_machines = true             # Free tier: auto-sleep
  auto_start_machines = true            # Auto-wake on request
```

---

## 💰 Free Tier Details

### What's Included (FREE):
- ✅ Up to 3 shared-cpu-1x VMs (256MB each)
- ✅ 3GB persistent storage
- ✅ 160GB outbound data transfer
- ✅ Unlimited inbound data
- ✅ SSL certificates
- ✅ Global Anycast network

### Your Usage (2 VMs):
- Backend: 1 VM (256MB) ✅
- Frontend: 1 VM (256MB) ✅
- **Total: Still within free tier!** ✅

### Limitations:
- ⏱️ Machines sleep after inactivity (~5 min)
- 🐌 Cold start: ~1-2 seconds (very fast!)
- 📊 160GB bandwidth/month (plenty for hobby projects)

---

## 📊 Useful Commands

### Status & Info
```bash
# Check app status
flyctl status --config fly.toml
flyctl status --config fly.frontend.toml

# List all your apps
flyctl apps list

# Get app info
flyctl info --config fly.toml
```

### Logs & Debugging
```bash
# View logs (real-time)
flyctl logs --config fly.toml
flyctl logs --config fly.frontend.toml

# SSH into machine (debugging)
flyctl ssh console --config fly.toml

# Check machine health
flyctl checks list --config fly.toml
```

### Deployment
```bash
# Deploy updates
flyctl deploy --config fly.toml
flyctl deploy --config fly.frontend.toml

# Force rebuild
flyctl deploy --config fly.toml --no-cache

# Deploy to specific region
flyctl deploy --config fly.toml --region sea
```

### Scaling (Free Tier)
```bash
# Scale VM size (stay in free tier)
flyctl scale vm shared-cpu-1x --memory 256 --config fly.toml

# Scale number of machines (use 1 to stay free)
flyctl scale count 1 --config fly.toml
```

### Secrets (Environment Variables)
```bash
# Set secret (not visible in logs)
flyctl secrets set MY_SECRET=value --config fly.toml

# List secrets
flyctl secrets list --config fly.toml

# Remove secret
flyctl secrets unset MY_SECRET --config fly.toml
```

---

## 🔄 Redeploy After Changes

### Backend Changes
```bash
# Edit server/server.py or other files
git add .
git commit -m "Update backend"
flyctl deploy --config fly.toml
```

### Frontend Changes
```bash
# Edit client/src files
git add .
git commit -m "Update frontend"
flyctl deploy --config fly.frontend.toml --build-arg VITE_API_URL=https://flights-api.fly.dev
```

### Or use the script:
```bash
./deploy-fly.sh  # Redeploys both!
```

---

## 🆘 Troubleshooting

### Issue: "App name already taken"
**Solution:** Change app name in `fly.toml`:
```toml
app = "flights-api-yourname"  # Make it unique
```

### Issue: "Out of memory"
**Solution:** Optimize your Docker image or upgrade:
```bash
flyctl scale memory 512 --config fly.toml  # Costs ~$2/month
```

### Issue: Frontend can't reach backend
**Solution:** Check CORS in `server/server.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://flights-ui.fly.dev",
        "http://localhost:5173"
    ],
    # ...
)
```

### Issue: Cold starts are slow
**Solution:** Keep machines running (costs money):
```bash
flyctl scale count 1 --min-machines-running 1 --config fly.toml
# ~$2/month for always-on
```

### Issue: Build fails
**Solution:** Check build logs:
```bash
flyctl logs --config fly.toml
```

Check Docker locally:
```bash
docker build -t test -f Dockerfile .
```

---

## 🎨 Custom Domains (Optional)

### Add your own domain (free!):

```bash
# Add domain to your app
flyctl certs create yourdomain.com --config fly.toml

# Add DNS records (shown in output)
# Wait for SSL provisioning

# Check certificate status
flyctl certs show yourdomain.com --config fly.toml
```

---

## 📈 Monitoring

### Built-in Metrics
```bash
# View metrics dashboard
flyctl dashboard metrics --config fly.toml
```

### Health Checks
Fly automatically monitors your app health:
- HTTP endpoint checks
- Auto-restart on failures
- Email alerts (configure in dashboard)

---

## 🔒 Security Best Practices

1. **Use secrets for sensitive data**
   ```bash
   flyctl secrets set DATABASE_URL=postgres://... --config fly.toml
   ```

2. **Update dependencies regularly**
   ```bash
   cd server && pip list --outdated
   cd client && npm outdated
   ```

3. **Enable HTTPS only** (already configured in fly.toml)
   ```toml
   force_https = true
   ```

4. **Review CORS settings**
   - Don't use `allow_origins=["*"]` in production
   - Specify exact frontend domains

---

## 📚 Resources

- **Fly.io Docs**: https://fly.io/docs/
- **Dockerfile Best Practices**: https://fly.io/docs/languages-and-frameworks/dockerfile/
- **Pricing**: https://fly.io/docs/about/pricing/
- **Status Page**: https://status.flyio.net/
- **Community**: https://community.fly.io/

---

## ✅ Deployment Checklist

- [ ] Fly CLI installed (`brew install flyctl`)
- [ ] Authenticated (`flyctl auth login`)
- [ ] Backend deployed (`flyctl deploy --config fly.toml`)
- [ ] Backend URL copied
- [ ] Frontend config updated with backend URL
- [ ] Frontend deployed (`flyctl deploy --config fly.frontend.toml`)
- [ ] Both apps tested in browser
- [ ] CORS configured properly
- [ ] Custom domain added (optional)

---

## 🎉 Success!

Your full-stack app is now live on Fly.io for **$0/month**!

- **Backend**: https://flights-api.fly.dev
- **Frontend**: https://flights-ui.fly.dev
- **Cost**: Free (within free tier limits)
- **Performance**: Great! (Global CDN, fast cold starts)

Enjoy your deployment! 🚀

