# CookAlong Project Documentation

This document outlines the entire scope of work, features implemented, and changes made to the CookAlong project. CookAlong is a Live Agent cooking coach designed for the Gemini Live Agent Challenge.

## Completed Features & Work

### 1. Frontend Enhancements (Expo / React Native Web)

**Audio Processing**
- **Raw PCM Capture**: Implemented an `AudioWorkletNode` (`frontend/public/audio-processor.js`) running inside an `AudioContext` that captures audio chunks from `navigator.mediaDevices.getUserMedia` at a 16kHz sample rate. The raw integer 16-bit PCM arrays are dispatched over the WebSocket back to the server.
- **Audio Playback**: Implemented a secondary `AudioWorkletNode` (`frontend/public/pcm-player.js`) acting as a buffer that accepts incoming 24kHz raw PCM streams sent from the backend and routes them directly to the `AudioContext.destination` (speakers).
- **Interruption/Barge-in Logic**: The frontend receives a `{"type": "interruption", "action": "clear_buffer"}` JSON control message from the WebSocket. Once parsed, the `AudioService` calls `clearPlaybackBuffer()` which flushes the `pcm-player.js` circular buffer, ensuring stale model audio stops playing the moment the user interrupts.

**User Interface Updates**
- **Agent State Feedback**: Implemented visual indicators tracking the agent state ('connecting', 'speaking', 'listening', 'thinking (tool)', 'interrupted'). This updates automatically based on `server_content` and `tool_call` payloads coming back from the model.
- **Recipe Selection**: Users can now select recipes (e.g., 'Spaghetti Carbonara') using a selector that binds state directly to the session initialization parameters.

### 2. Backend Enhancements (FastAPI)

**WebSocket Streaming Updates**
- Handled parsing complex `agent.session.receive()` iterations. The logic differentiates between standard binary output (`inline_data`), interruptions (`server_content.interrupted`), tool usage (`response.tool_call`), and generic model turns.
- Modified data pipeline to route parsed agent state payloads to the frontend allowing realtime UX state updates.

**Tool Execution Mechanism**
- Added tool response piping: once `get_recipe_step` or `get_substitution` gets invoked by the Gemini Live session, the backend explicitly builds `types.Part.from_function_response` payloads and yields those back to the session using `await agent.session.send(...)`. This guarantees grounding and limits hallucinations.

**Firestore Seeding Script**
- Created `backend/seed_firestore.py` utilizing the `google-cloud-firestore` API. This allows operators to run the script manually with valid GCP credentials and safely seed the `recipes` and `substitutions` collections, replacing the previous hard-coded Python mock dictionaries for production use.

### 3. Deployment & Infrastructure

- **Docker Containerization**: Generated a `backend/Dockerfile` using `python:3.11-slim` with environment injection preparing the `PYTHONPATH`.
- **Requirements**: Added a defined `requirements.txt` to lock Python module versions.
- **Terraform (Infrastructure as Code)**: Scoped GCP infrastructure defined entirely in `infrastructure/terraform/main.tf` mapping:
  - Required API Services (`run.googleapis.com`, `firestore.googleapis.com`).
  - Google Cloud Firestore (`FIRESTORE_NATIVE`).
  - Google Cloud Run (`google_cloud_run_service`) mapping to the built Docker container.
  - Required IAM bindings allowing `allUsers` to invoke the Cloud Run endpoint.

## What to run:
1. Spin up frontend using `cd frontend && npm install && npm run web`.
2. Start backend using `cd backend && python -m backend.app.main` (requires `GEMINI_API_KEY`).
3. Deploy GCP instance with `cd infrastructure/terraform && terraform apply`.
