# 🚀 ECDAT — Production Deployment Guide
**Enterprise Cryptographic Discovery & Analysis Tool (SIH 2026 / NTRO)**

This guide provides step-by-step instructions to deploy ECDAT to production.

---

## ⚡ Option 1: Cloud Stack (Vercel + Render) — Recommended

### Part A: Deploy Backend on Render (FastAPI + WeasyPrint)
1. Sign up / Log in to [Render](https://render.com/).
2. Click **New +** &rarr; **Web Service**.
3. Connect the GitHub repository: `https://github.com/sps-exe/ecdat`.
4. Configure service settings:
   - **Name**: `ecdat-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Docker` *(Docker automatically uses `backend/Dockerfile` with all WeasyPrint C-libraries pre-installed)*
   - **Region**: Singapore or nearest to your users
   - **Instance Type**: Free / Starter
5. Add Environment Variables in Render:
   - `PORT`: `8000`
   - `CORS_ORIGINS`: `https://your-frontend.vercel.app,http://localhost:3000`
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key for AI remediation)*
6. Click **Create Web Service**.
7. Note down your backend live URL: `https://ecdat-backend.onrender.com`.

---

### Part B: Deploy Frontend on Vercel (Next.js 14)
1. Sign up / Log in to [Vercel](https://vercel.com/).
2. Click **Add New Project** &rarr; Import `sps-exe/ecdat`.
3. In **Project Configuration**:
   - **Framework Preset**: Next.js
   - **Root Directory**: Click **Edit** & select `frontend`.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: `https://ecdat-backend.onrender.com` *(your Render backend URL from Part A)*
5. Click **Deploy**.
6. Once deployed, copy your Vercel URL (e.g., `https://ecdat.vercel.app`) and update the `CORS_ORIGINS` variable in Render!

---

## 🐳 Option 2: Self-Hosted Docker Compose (VPS / AWS EC2 / DigitalOcean)

Deploy both frontend and backend on a single Linux server with one command:

```bash
# 1. Clone the repository
git clone https://github.com/sps-exe/ecdat.git
cd ecdat

# 2. Configure environment (optional)
export GEMINI_API_KEY="your_api_key_here"

# 3. Launch both services
docker compose up -d --build
```

- **Frontend**: Available at `http://<your-server-ip>:3000`
- **Backend API**: Available at `http://<your-server-ip>:8000`
- **Interactive Swagger Docs**: `http://<your-server-ip>:8000/docs`

---

## 🔒 Verification & Health Check

After deployment, verify that both services are healthy:
1. **Backend Health**: Visit `https://your-backend-url/api/health` &rarr; Returns `{"status":"ok","version":"1.0.0","service":"ECDAT Backend"}`.
2. **Swagger Documentation**: Visit `https://your-backend-url/docs`.
3. **Frontend Dashboard**: Visit `https://your-frontend-url/dashboard` and verify instant route transitions and CBOM / PDF report downloads.
