# Build Instructions

This document provides step-by-step instructions on how to build and spin up the CookAlong application locally.

## Prerequisites

- **Node.js** (v18 or higher) and `npm` installed.
- **Python** (v3.11 or higher).
- **Google Cloud API Key** for the Gemini Live models (Specifically `gemini-2.5-flash`).

---

## 1. Backend Spin-Up (FastAPI)

The backend handles the Gemini Live API WebSockets, Firestore Database connections, and JWT Authentication.
 
### Step 1: Create a Virtual Environment
```bash
cd backend
python3 -m venv env
source env/bin/activate  # On Windows use: env\Scripts\activate
```
 
### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables
You must provide a valid Gemini API Key. If you have Google Cloud Platform credentials for a Firestore Database, those will be automatically detected (via ADC) or you can fall back to the mock memory store automatically.

```bash
export GEMINI_API_KEY="your_actual_api_key_here"
export JWT_SECRET_KEY="your_secure_random_string_for_auth"
```

### Step 4: Run the Server
Run from the **project root**:
```bash
python -m backend.app.main
```
Or from `backend/`:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8080
```
The server starts at `http://localhost:8080`.

---

## 2. Frontend Spin-Up (Expo React Native Web)

The frontend is a universal React Native application powered by Expo. It's configured to run on the Web platform for testing out-of-the-box using the browser's `MediaDevices` APIs.

### Step 1: Install Node Modules
```bash
cd frontend
npm install
```

### Step 2: Configure Environment Variables
Create a `.env.development` file in the `frontend` directory for local development:
```env
EXPO_PUBLIC_API_URL=http://localhost:8080
EXPO_PUBLIC_WS_URL=ws://localhost:8080/ws
```

### Step 3: Start the Web Development Server
```bash
npm run web
```

Alternatively, to serve a production web build:
```bash
npx expo export --platform web
npx serve dist -p 3000
```

---

## 3. Expo Preview and EAS Build

To build the app for native iOS and Android environments:

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login and Link Project
```bash
eas login
cd frontend
eas init
```
Choose **Create a new project** when prompted (this sets `projectId` in `app.json`).

### Step 3: Build for Development or Preview
Create a development build:
```bash
eas build --profile development --platform all
```

Create a preview build:
```bash
eas build --profile preview --platform all
```

---

### Usage Instructions
Open your browser to `http://localhost:8081` (or whichever port Expo selects). The app starts on the Dashboard by default.
1. Use **Start Quick Cook**: Paste a recipe URL, or type a dish name (e.g. "Spaghetti Carbonara") and tap Start.
2. Or select a recipe from the Recommended list and tap to open the Cooking Screen.
3. Allow Camera and Microphone permissions when prompted.
4. Tap the **Connect** icon, then **Start Cooking** to interact with the AI coach.
