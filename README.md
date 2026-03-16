# CookAlong: Live Cooking Coach

CookAlong is an intelligent, realtime conversational agent designed to help you cook seamlessly. Built for the Gemini Live Agent Challenge using the `google-genai` SDK.

## Features

- 🎙️ **Native Live Audio**: Fast, low-latency audio interaction in real time.
- 👁️ **Computer Vision Support**: Streams images from your camera so the agent can understand what it's seeing on the counter.
- 🛠️ **Grounded Tool Usage**: The AI invokes backend methods (`get_recipe_step`, `get_substitution`) connected to a Google Cloud Firestore backend preventing hallucination.
- ⏸️ **Barge-in / Interruptible**: Need to stop it and ask a question mid-sentence? The frontend implements robust buffer wiping that responds instantly to user interruptions.
- 🔒 **User Authentication**: Secure user registration and login flows using JWTs and bcrypt password hashing.
- 🌐 **Dynamic Recipe Import & Quick Cook**: Paste any recipe URL or type a dish name (e.g. "Spaghetti Carbonara") and the backend uses Gemini to fetch or generate the recipe and start a live cooking session.

## Setup
 
### 1. The Backend

You need a `GEMINI_API_KEY` (from [Google AI Studio](https://aistudio.google.com/apikey)) and a `JWT_SECRET_KEY` for auth.

```bash
cd backend
python3 -m venv env
source env/bin/activate  # Windows: env\Scripts\activate
pip install -r requirements.txt
```

Copy `backend/.env.example` to `.env` and fill in your values, or:

```bash
export GEMINI_API_KEY="your-api-key-here"
export JWT_SECRET_KEY="$(openssl rand -base64 32)"
```

Run from project root:

```bash
python -m backend.app.main
```

The backend starts on `http://localhost:8080`.

### 2. The Frontend (React Native Web / Expo)

```bash
cd frontend
npm install
```

Create `frontend/.env.development`:

```env
EXPO_PUBLIC_API_URL=http://localhost:8080
EXPO_PUBLIC_WS_URL=ws://localhost:8080/ws
```

Start the web dev server:

```bash
npm run web
```

Open `http://localhost:8081` (or the port Expo shows). Allow camera and microphone, then use "Start Quick Cook" on the Dashboard or go to the Cooking screen and connect.

### 3. Native iOS / Android

Live voice works on native via `react-native-live-audio-stream` (capture) and `@speechmatics/expo-two-way-audio` (playback). Build with EAS: 

```bash
cd frontend
eas build --profile preview --platform all
```

Use a **development build** (not Expo Go) — native audio requires custom native code.

### 4. Production Deployment

See `DEPLOY.md` for deploying the backend to **Railway** or **Google Cloud Run**, and `Build.md` for EAS native builds.

## Documentation

- `Documentation.md` — Feature overview
- `Plan.md` — Hackathon plan and architecture
- `Implementation.md` — Implementation status

