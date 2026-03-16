# CookAlong: Live Cooking Coach

CookAlong is an intelligent, realtime conversational agent designed to help you cook seamlessly. Built for the Gemini Live Agent Challenge using the `google-genai` SDK.

## Features
- 🎙️ **Native Live Audio**: Fast, low-latency audio interaction in real time.
- 👁️ **Computer Vision Support**: Streams images from your camera so the agent can understand what it's seeing on the counter.
- 🛠️ **Grounded Tool Usage**: The AI invokes backend methods (`get_recipe_step`, `get_substitution`) connected to a Google Cloud Firestore backend preventing hallucination.
- ⏸️ **Barge-in / Interruptible**: Need to stop it and ask a question mid-sentence? The frontend implements robust buffer wiping that responds instantly to user interruptions.
- 🔒 **User Authentication**: Secure user registration and login flows using JWTs and bcrypt password hashing.
- 🌐 **Dynamic Recipe Import**: Paste any recipe URL into your dashboard and the backend uses Gemini to instantly extract the title, ingredients, and steps, saving it immediately to your profile.

## Setup

### 1. The Backend
You will need a valid `GEMINI_API_KEY` that has access to the Gemini BIDI stream models (`gemini-2.5-flash`).

```bash
cd backend
pip install -r requirements.txt
export GEMINI_API_KEY="your-api-key-here"
python -m backend.app.main
```

The backend starts on `http://localhost:8080`.

### 2. The Frontend (React Native Web / Expo)
The frontend uses Expo and React Native Web.

```bash
cd frontend
npm install
npm run web
```

This will launch a local server on `http://localhost:8081` (or next available port). Load the site, allow microphone and camera access, and click 'Connect Server' and 'Start Cooking'.

### 3. Production Deployment (Terraform)
The project comes completely prepared with `infrastructure/terraform` definitions allowing one-click infrastructure-as-code deployment to Google Cloud Run and Firestore native. Simply adjust `variables.tf` and run:

```bash
cd infrastructure/terraform
terraform init
terraform apply
```
