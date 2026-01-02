# 🚀 Deployment Guide - Real-Time IoT Data Streamer

Quick deployment guide for Vercel (Frontend), Render (Backend), and GitHub.

---

## 📦 GitHub Setup

### 1. Create `.gitignore`

```bash
# Dependencies
node_modules/
__pycache__/

# Environment
.env*

# Build outputs
frontend/.next/
frontend/build/

# Database
*.db
*.sqlite

# Logs
*.log

# OS/IDE
.DS_Store
.vscode/
.idea/
```

### 2. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: IoT Data Streamer"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/realtime-iot-streamer.git
git push -u origin main
```

---

## 🎨 Deploy Frontend to Vercel

### Option 1: Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework:** Next.js (auto-detected)
4. Add Environment Variable:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://your-backend.onrender.com` (add after deploying backend)
5. Click **Deploy**

### Option 2: Vercel CLI

```bash
npm install -g vercel
cd frontend
vercel login
vercel --prod
```

Set environment variable:
```bash
vercel env add NEXT_PUBLIC_API_URL production
# Paste your Render backend URL
```

**Auto-deploys:** Every push to `main` automatically deploys to production.

---

## 🔧 Deploy Backend to Render

### Steps

1. Go to [render.com/dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect GitHub and select your repository
4. Configure:
   - **Name:** `iot-backend`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free

5. Add Environment Variables:
   ```
   MQTT_BROKER = mqtt://broker.emqx.io:1883
   MQTT_TOPIC = intern-test/candidate-001/sensor-data
   NODE_ENV = production
   ```

6. Click **Create Web Service**
7. Copy the deployed URL (e.g., `https://iot-backend-xyz.onrender.com`)

### Update Vercel

Go to Vercel → Your Project → **Settings** → **Environment Variables**:
- Update `NEXT_PUBLIC_API_URL` with your Render URL
- Redeploy frontend

**⚠️ Free Tier Note:** Service spins down after 15 minutes of inactivity (cold start ~30-60s). Upgrade to $7/month for always-on.

---

## 🤖 GitHub Actions CI/CD (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Test Backend
        run: cd backend && npm install && npm test
      - name: Test Frontend
        run: cd frontend && npm install && npm run build
        env:
          NEXT_PUBLIC_API_URL: https://iot-backend.onrender.com
```

---

## 🔄 Update Frontend Code

Edit `frontend/app/page.js`:

```javascript
// Use environment variable for API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/metrics`
  : 'http://localhost:5000/api/metrics';
```

---

## 🚀 Run Sensor

The sensor publishes to public MQTT broker, so run it locally:

```bash
cd sensor
python sensor.py
```

---

## 🐳 Docker Deployment (Alternative)

### Local/VPS with Docker Compose

```bash
docker-compose up -d
```

Access:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

---

## 🔒 Production Checklist

**Security:**
- [ ] Use private MQTT broker with authentication
- [ ] Add API authentication (JWT)
- [ ] Enable HTTPS/SSL
- [ ] Implement rate limiting

**Performance:**
- [ ] Add caching (Redis)
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable CDN for frontend assets

**Monitoring:**
- [ ] Set up error tracking (Sentry)
- [ ] Monitor uptime (UptimeRobot)
- [ ] Add logging service

---

## 🆘 Troubleshooting

**Frontend can't reach backend:**
- Verify `NEXT_PUBLIC_API_URL` in Vercel environment variables
- Check CORS settings in `backend/server.js`
- Ensure backend is running (check Render logs)

**MQTT connection fails:**
- Verify broker URL: `mqtt://broker.emqx.io:1883`
- Check firewall settings

**Render service sleeping:**
- Upgrade to paid plan for always-on service
- Or ping endpoint every 10 minutes to keep it awake

---

## 📋 Quick Reference

| Service | URL | Purpose |
|---------|-----|---------|
| Vercel | [vercel.com](https://vercel.com) | Frontend hosting |
| Render | [render.com](https://render.com) | Backend hosting |
| GitHub | [github.com](https://github.com) | Code repository |

**Happy Deploying! 🚀**
