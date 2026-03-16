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
Use `uvicorn` to start the FastAPI server:
```bash
python -m uvicorn app.main:app --port 8080 --reload
```
The server should now be running at `http://localhost:8080`.

---

## 2. Frontend Spin-Up (Expo React Native Web)

The frontend is a universal React Native application powered by Expo. It's configured to run on the Web platform for testing out-of-the-box using the browser's `MediaDevices` APIs.

### Step 1: Install Node Modules
```bash
cd frontend
npm install
```

### Step 2: Start the Web Development Server
```bash
npm run web
```

Alternatively, to serve a production web build:
```bash
npx expo export --platform web
npx serve dist -p 3000
```

### Step 3: Use the App
Open your browser to `http://localhost:8081` (or whichever port Expo selects).
1. Create a new account using the "Create Account" button.
2. Sign in with your new credentials.
3. Import a recipe by pasting a recipe URL (e.g., from a food blog) into the importer text box.
4. Select your recipe to load the immersive "Cooking Screen".
5. Allow Camera and Microphone permissions when prompted.
6. Tap the "Connect" icon in the top right to open the BIDI websocket.
7. Tap "Start Cooking" to begin interacting with the AI coach!
