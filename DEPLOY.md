# CookAlong Cloud Deployment Guide

Deploy the backend to the cloud so your EAS-built app can connect to it.

---

## Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | **Yes** | Your Google AI / Gemini API key for the Live API |
| `JWT_SECRET_KEY` | **Yes** | Secret for signing JWT tokens (e.g. `openssl rand -base64 32`) |
| `GOOGLE_CLOUD_PROJECT` | No | Firestore project ID (if using Firestore; otherwise uses mock) |
 
---

## Option 1: Railway (Recommended — Simple & Fast)

Railway supports Docker, WebSockets, and has a straightforward setup. A **root-level Dockerfile** and `railway.toml` are included so Railway auto-detects the build.

### 1. Create Account
- Go to [railway.app](https://railway.app) and sign up (GitHub login works).

### 2. New Project from Repo
- Click **New Project** → **Deploy from GitHub repo**
- Select your CookAlong repository
- **Root Directory**: Leave empty (or `/`) — the root Dockerfile is used automatically.

### 3. Configure Build
- Railway detects the root `Dockerfile` and `railway.toml`; no extra config needed.
- The app listens on Railway's `PORT` env var.

### 4. Set Environment Variables
In Railway → your service → **Variables** tab:

```
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET_KEY=your_jwt_secret_from_openssl_rand_base64_32
```

For JWT secret, run locally:
```bash
openssl rand -base64 32
```

### 5. Get Your URL
- In Railway → **Settings** → **Networking** → **Generate domain**
- Use the URL **without a port** (e.g. `https://cookalong-xxx.up.railway.app`)
- WebSocket URL: `wss://your-app.up.railway.app/ws`

### 6. Update Frontend
Update `frontend/.env.production` and EAS secrets (no port in the URL):

```
EXPO_PUBLIC_API_URL=https://your-app.up.railway.app
EXPO_PUBLIC_WS_URL=wss://your-app.up.railway.app/ws
```

---

## Option 2: Render

### 1. Create Account
- Go to [render.com](https://render.com) and sign up.

### 2. New Web Service
- **New** → **Web Service**
- Connect your GitHub repo

### 3. Configure
- **Environment**: Docker
- **Dockerfile Path**: `./backend/Dockerfile`
- **Root Directory**: `backend` (or leave empty if Dockerfile path is `backend/Dockerfile`)

### 4. Environment Variables
In **Environment** section add:

| Key | Value |
|-----|-------|
| `GEMINI_API_KEY` | Your Gemini API key |
| `JWT_SECRET_KEY` | Output of `openssl rand -base64 32` |

### 5. Deploy
- Click **Create Web Service**
- Render will build and deploy; note your URL (e.g. `https://cookalong-backend.onrender.com`)

### 6. Update Frontend
Same as Railway — set `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_WS_URL` in `.env.production` and EAS secrets.

---

## Option 3: Google Cloud Run

Best if you're already using Firebase/Firestore.

### 1. Prerequisites
- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed
- Project created in Google Cloud Console

### 2. Build & Push
Build from the **project root** (uses the root `Dockerfile`):

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/cookalong-backend .
```

### 3. Deploy
```bash
gcloud run deploy cookalong-backend \
  --image gcr.io/YOUR_PROJECT_ID/cookalong-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=your_key,JWT_SECRET_KEY=your_secret"
```

### 4. Get URL
Cloud Run will output the service URL after deploy.

---

## EAS Secrets (For Native Builds)

To inject your production API URL into EAS builds:

```bash
cd frontend
eas secret:create --name EXPO_PUBLIC_API_URL --value "https://your-backend-url.com"
eas secret:create --name EXPO_PUBLIC_WS_URL --value "wss://your-backend-url.com/ws"
```

Or add to `eas.json` under your build profile:

```json
"production": {
  "env": {
    "EXPO_PUBLIC_API_URL": "https://your-backend-url.com",
    "EXPO_PUBLIC_WS_URL": "wss://your-backend-url.com/ws"
  }
}
```

---

## Dockerfile Build Context

**Root Dockerfile** (for Railway/monorepo): Built from the project root:

```bash
docker build -t cookalong-backend .
```

**Backend Dockerfile**: For builds from `backend/` only:

```bash
cd backend
docker build -t cookalong-backend .
```

The root `Dockerfile` copies `backend/` and uses `PORT` from the environment for cloud platforms.

---

## Firestore (Optional)

To use Firestore instead of the in-memory mock:

1. Create a Firestore database in [Google Cloud Console](https://console.cloud.google.com/firestore)
2. Set up [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials) (for local dev)
3. On Railway/Render: Add `GOOGLE_APPLICATION_CREDENTIALS` and provide a service account JSON (or use Workload Identity on GCP)
4. Set `GOOGLE_CLOUD_PROJECT` to your project ID

Without Firestore, the app uses an in-memory store (fine for demos / single instances).
