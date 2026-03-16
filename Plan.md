# Gemini Live Agent Challenge — Hackathon Plan

**Project Name:** CookAlong  
**Category:** Live Agents 🗣️  
**Tagline:** Your live cooking coach that sees your kitchen and answers when you interrupt

---

## 1. Problem Statement

People want to cook but get stuck mid-recipe: they have the wrong ingredients, don't understand a step, or need to improvise. Written recipes and pre-recorded videos can't answer questions in the moment. A video doesn't pause when you say "Wait, what if I don't have soy sauce?" or "Can you show me that cutting technique again?"

**Pain points:**
- Static recipes don't adapt to the user's kitchen, ingredients, or skill
- Video tutorials can't be interrupted for clarification
- Users often abandon cooking when they hit an unexpected problem
- No real-time feedback on technique, substitutions, or portion sizes

---

## 2. Solution: CookAlong

CookAlong is a **Live Agent** that acts as a real-time cooking coach. Users talk to it naturally while cooking; it uses their camera to see ingredients and workspace and gives step-by-step guidance. Crucially, **the agent is interruptible**—users can ask questions, request substitutions, or get clarification at any time without waiting for the agent to finish.

**Core behaviors:**
- **Sees:** Camera feed of ingredients, workspace, and progress
- **Hears:** Natural voice commands and questions
- **Speaks:** Real-time audio guidance; can be interrupted mid-sentence
- **Adapts:** Substitutions, technique tips, and clarification when the user asks

---

## 3. Why Live Agents (and Why Interruptible)

| Requirement | CookAlong |
|--------------|-----------|
| Real-time interaction | Live audio + vision during cooking |
| Gemini Live API or ADK | ✅ Required for the category |
| Hosted on Google Cloud | ✅ Cloud Run / GCP backend |
| **Interruptible** | ✅ User can interrupt mid-conversation—agent stops, listens, responds |

**Interruptibility is essential:** In a kitchen, users need answers immediately. If the agent keeps talking while the user says "Stop—what's a good substitute for fish sauce?", the experience breaks. The agent must detect interruption, stop output, and handle the new intent.

---

## 4. Technical Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  CLIENT (Expo React Native App)                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
│  │ Audio Input     │ │ Audio Output    │ │ Expo Camera     │ │ Recipe Picker │ │
│  │ 16kHz PCM in    │ │ 24kHz PCM out   │ │ 768×768 JPEG    │ │ (UI)          │ │
│  │ (mic)           │ │ (speaker)       │ │ @ 1 FPS         │ │               │ │
│  └────────┬────────┘ └────────┬────────┘ └────────┬────────┘ └───────┬───────┘ │
│           │                   │                   │                   │         │
│           └───────────────────┼───────────────────┼───────────────────┘         │
│                               │ WebSocket (binary audio + JSON image)           │
└───────────────────────────────┼─────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  GOOGLE CLOUD                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  Cloud Run (FastAPI) — ADK agent                                        │    │
│  │  • Forwards audio → LiveRequestQueue.send_realtime(audio_blob)           │    │
│  │  • Forwards images → LiveRequestQueue.send_realtime(image_blob)           │    │
│  │  • Forwards events → WebSocket (incl. audio, transcriptions)             │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                │                                                 │
│  ┌─────────────────────────────┼─────────────────────────────────────────────┐  │
│  │  ADK Agent + Gemini Live API Toolkit                                      │  │
│  │  • Tools: get_recipe_step(), get_substitution() ← GROUNDING               │  │
│  │  • System prompt: cooking coach persona, current recipe context           │  │
│  │  • RunConfig: response_modalities=["AUDIO"], streaming_mode=BIDI          │  │
│  │  • Automatic VAD (default) → user speaks = model stops (barge-in)         │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                │                                                 │
│           ┌────────────────────┼────────────────────┐                            │
│           ▼                    ▼                    ▼                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                   │
│  │ Vertex AI       │  │ Firestore       │  │ Cloud Storage   │                   │
│  │ Gemini Live     │  │ recipes,        │  │ (optional)      │                   │
│  │ (model)         │  │ substitutions   │  │ session assets  │                   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Mandatory Tech Stack

| Requirement | Implementation |
|-------------|----------------|
| Gemini model | Vertex AI Gemini Live (`gemini-live-2.5-flash-native-audio` or `gemini-live-2.5-flash`) |
| GenAI SDK | `google-genai` SDK |
| Google Cloud | **Cloud Run** (agent hosting), **Firestore** (recipes, substitutions) |
| **Interruptible** | Live API automatic VAD (default); client clears playback buffer on interruption |

### Implementation Details

| Spec | Value | Source |
|------|-------|--------|
| **Audio input** | 16 kHz, mono, 16-bit PCM | Expo audio capture |
| **Audio output** | 24 kHz, mono, 16-bit PCM | Live API |
| **Audio chunks** | 50–100 ms (balanced) | Bidi WebSocket |
| **Image/Video** | JPEG, 768×768, **max 1 FPS** | `expo-camera` |
| **Barge-in** | Automatic VAD enabled by default; no client VAD needed | Live API |
| **Client audio** | Raw PCM capture + binary WebSocket | Expo native module/library |

---

## 5. Detailed Technical Specifications

### 5.1 Project File Structure

```
cookalong/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application setup and routing
│   │   ├── agent.py             # GenAI Agent initialization and Live API integration
│   │   ├── tools.py             # Tool definitions (get_recipe_step, get_substitution)
│   │   ├── database.py          # Firestore connection and queries
│   │   └── websockets.py        # WebSocket handler for audio/image streaming
│   ├── Dockerfile               # Docker configuration for Cloud Run
│   └── requirements.txt         # Python dependencies
├── frontend/                    # Expo React Native App
│   ├── App.tsx                  # Main entry point and UI
│   ├── components/              # UI components (RecipePicker, CameraFeed)
│   ├── services/
│   │   ├── websocket.ts         # WebSocket client for Bidi communication
│   │   ├── audio.ts             # Audio capture and playback logic
│   │   └── camera.ts            # Camera capture logic (1 FPS JPEG)
│   ├── app.json                 # Expo configuration
│   └── package.json             # App dependencies
├── infrastructure/
│   ├── terraform/               # (Optional) IaC for GCP resources
│   │   ├── main.tf              # Cloud Run, Firestore, Vertex AI setup
│   │   └── variables.tf         # Configuration variables
├── README.md                    # Project documentation
└── Plan.md                      # This hackathon plan
```

### 5.2 Firestore Database Schema

**Collection: `recipes`**
- Document ID: `recipe_id` (e.g., `spaghetti-carbonara`)
- Fields:
  - `title` (String): "Spaghetti Carbonara"
  - `description` (String): "A classic Italian pasta dish..."
  - `ingredients` (Array of Maps):
    - `name` (String): "Spaghetti"
    - `amount` (String): "400g"
  - `steps` (Array of Strings):
    - [0]: "Boil a large pot of salted water."
    - [1]: "Cook the spaghetti until al dente."
    - [2]: "Fry the guanciale until crispy."
    - [3]: "Whisk eggs and pecorino cheese together."
    - [4]: "Combine pasta, guanciale, and egg mixture off the heat."

**Collection: `substitutions`**
- Document ID: `ingredient_name` (e.g., `guanciale`)
- Fields:
  - `name` (String): "Guanciale"
  - `alternatives` (Array of Strings): ["Pancetta", "Bacon", "Smoked ham"]
  - `notes` (String): "If using bacon, you may need less added salt."

### 5.3 WebSocket Communication Protocol

The WebSocket connection handles bidirectional streaming between the client and the FastAPI backend.

**Client to Server (Upstream):**
- **Audio:** Binary frames containing 16kHz, mono, 16-bit PCM audio chunks (50-100ms).
- **Image:** JSON payloads containing base64-encoded JPEG images (max 1 FPS).
  ```json
  {
    "type": "image",
    "data": "base64_encoded_jpeg_string"
  }
  ```
- **Control/Events:** JSON payloads for starting/stopping sessions or signaling interruption.
  ```json
  {
    "type": "control",
    "action": "start_session",
    "recipe_id": "spaghetti-carbonara"
  }
  ```

**Server to Client (Downstream):**
- **Audio:** Binary frames containing 24kHz, mono, 16-bit PCM audio chunks for playback.
- **Events:** JSON payloads for transcriptions, tool execution updates, and agent state changes.
  ```json
  {
    "type": "agent_state",
    "state": "speaking" // or "listening", "interrupted"
  }
  ```
  ```json
  {
    "type": "interruption",
    "action": "clear_buffer" // Tells the client to send endOfAudio to the PCM player
  }
  ```

---

## 6. Interruptibility Design

**How it works:**

1. **Server-side (Gemini Live):** Use the Live API's native interruption/barge-in behavior so the model stops when the user speaks.
2. **Client-side:** On interruption events, send `endOfAudio` to the PCM player worklet to clear the playback buffer (`readIndex = writeIndex`)—prevents stale audio from playing. No manual VAD needed; Live API auto-detects user speech.
3. **Turn-taking:** When the user interrupts, the agent:
   - Stops current speech immediately
   - Processes the new user input (question, substitution request, etc.)
   - Responds with the relevant answer
   - Optionally resumes the recipe step or continues from the new context

**Example flow:**
- Agent: "Now add the soy sauce and stir for—"
- User: "I don't have soy sauce. What can I use?"
- Agent: *(stops)* "You can use tamari, coconut aminos, or a mix of salt and a little vinegar. Tamari is closest. Do you have any of those?"
- User: "I have tamari."
- Agent: "Perfect. Use the same amount. Now add it and stir for 30 seconds."

---

## 7. User Flow

1. **Start:** User selects a recipe (or describes what they want to make)
2. **Camera:** User enables camera so the agent can see ingredients and workspace
3. **Live session:** Agent guides step-by-step via voice; user follows along
4. **Interrupt anytime:** User asks questions, requests substitutions, or asks for repeats—agent stops and responds
5. **Adaptive guidance:** Agent can suggest ingredient swaps, adjust portions, or simplify steps based on what it sees and hears

---

## 8. Multimodal Integration (Judging: 40%)

- **See:** Vision input from camera (ingredients, workspace, progress)
- **Hear:** User voice for commands and questions; agent speaks back in real time
- **Interrupt:** User can interrupt mid-conversation; agent handles it gracefully
- **Create:** Adaptive instructions, substitutions, and technique tips generated on the fly

The experience is live, contextual, and conversational instead of rigid and turn-based.

---

## 9. Differentiation & Innovation

1. **Interruptible first:** Designed around mid-conversation interruption; not an afterthought
2. **Kitchen-aware:** Uses vision to tailor advice (e.g., "I see you have lemons—use those instead of lime")
3. **Practical:** Addresses real pain (substitutions, clarification, technique) during cooking
4. **Natural:** Feels like cooking with a knowledgeable friend who listens and adapts

---

## 10. Grounding & Hallucination Avoidance (Judging: Technical 30%)

Judging asks: *"Does it avoid hallucinations? Is there evidence of grounding?"*

| Strategy | Implementation |
|----------|----------------|
| **Structured recipe data** | Firestore `recipes` collection: steps, ingredients, quantities. Agent fetches via tools, not free-form generation. |
| **Tool: `get_recipe_step(recipe_id, step_num)`** | Returns exact step text from DB. Agent narrates from this data. |
| **Tool: `get_substitution(ingredient)`** | Returns curated substitution list from Firestore. Agent only suggests from this. |
| **System prompt** | Instruct: "Only use get_recipe_step and get_substitution. Do not invent steps or substitutes." |
| **Session context** | Pass current recipe ID + step number so agent stays anchored. |

---

## 11. Granular Implementation Phases

### Phase 1: Foundation & Backend Setup (Days 1–2)
- [x] Initialize project repository with the defined file structure.
- [x] Set up a Python virtual environment and install dependencies (FastAPI, uvicorn, google-cloud-firestore, ADK/GenAI SDK).
- [x] Configure Google Cloud Project: Enable Vertex AI API, Firestore API, and Cloud Run API.
- [x] Implement Firestore connection logic (`backend/app/database.py`).
- [x] Create basic FastAPI application structure (`backend/app/main.py`).

### Phase 2: Core Agent & Tool Integration (Days 3–4)
- [x] Define the Gemini Live API client integration (`backend/app/agent.py`).
- [x] Implement `get_recipe_step` and `get_substitution` tools (`backend/app/tools.py`).
- [x] Write the system prompt establishing the cooking coach persona and grounding instructions.
- [x] Seed Firestore with 3–5 sample recipes and common substitutions.
- [x] Create simple unit tests to verify tool execution against Firestore.

### Phase 3: WebSocket Streaming & Interruption Logic (Days 5–6)
- [x] Implement the WebSocket endpoint in FastAPI (`backend/app/websockets.py`).
- [x] Fork/adapt the frontend audio processing code from ADK bidi-demo (`frontend/js/audio-processor.js`, `pcm-player.js`).
- [x] Connect the frontend WebSocket client to stream microphone audio to the backend.
- [x] Handle returning audio streams from the backend and route them to the PCM player.
- [x] **Crucial:** Implement the interruption handling logic (listen for server events or VAD triggers to send `endOfAudio` and clear the client playback buffer).

### Phase 4: Vision Integration (Day 7)
- [x] Implement WebRTC camera capture in the frontend (`frontend/js/camera.js`).
- [x] Configure a timer to capture a 768x768 JPEG frame at a maximum of 1 FPS.
- [x] Serialize the frame to base64 and send it over the WebSocket.
- [x] Update the backend WebSocket handler to route image payloads to the Gemini Live session.
- [x] Test the agent's ability to "see" and comment on objects held in front of the camera.

### Phase 5: UI Polish & User Experience (Day 8)
- [x] Build the recipe selection UI (`frontend/index.html`, `frontend/css/style.css`).
- [x] Add visual indicators for the agent's state (Speaking, Listening, Thinking).
- [x] Ensure clear visual feedback when an interruption occurs.
- [x] Handle browser permissions gracefully (microphone, camera).
- [x] Add error handling and WebSocket reconnection logic.

### Phase 6: Deployment & Final Preparation (Day 9)
- [x] Create the `Dockerfile` for the backend.
- [x] Deploy the FastAPI backend to Google Cloud Run.
- [x] Host the frontend static files (e.g., using Cloud Storage or Firebase Hosting).
- [x] Conduct end-to-end testing of the deployed application.
- [ ] Record the demonstration video showing all key features (interruption, vision, adaptation).
- [x] Finalize the architecture diagram and documentation.

---

## 12. Demo Video Must-Haves

- [ ] **Show interruption:** Agent mid-sentence → user interrupts → agent stops and answers
- [ ] **Show vision:** Agent references something it sees (e.g., "I see you have ginger—we'll use that")
- [ ] **Show adaptation:** User asks for substitution → agent provides it and continues
- [ ] **Prove GCP:** Short clip of Cloud Run logs/console

---

## 13. Submission Checklist

| Item | Status |
|------|--------|
| Text description (features, tech, findings) | ✅ |
| Public code repository with README + spin-up | ✅ |
| GCP deployment proof (recording or code) | ⬜ |
| Architecture diagram | ✅ |
| Demo video (<4 min) | ⬜ |

### Bonus
- [ ] Blog/post with #GeminiLiveAgentChallenge
- [x] IaC (Terraform/Pulumi) for deployment
- [ ] GDG profile link

---

## 14. Judging Alignment

| Criterion | Weight | How CookAlong Addresses It |
|-----------|--------|----------------------------|
| Innovation & Multimodal UX | 40% | See (768×768 JPEG @ 1 FPS), hear (16kHz PCM), speak (24kHz); **interruptible** (auto VAD); distinct cooking coach persona |
| Technical Implementation | 30% | ADK + Live API Toolkit; Cloud Run + Firestore + Vertex AI; **grounding via tools**; error handling |
| Demo & Presentation | 30% | Problem/solution; architecture diagram; GCP proof; real software (no mocks) |

---

## 15. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Interruptibility not smooth | Automatic VAD is default; ensure client sends `endOfAudio` on interruption event |
| Latency too high | Use 50–100 ms audio chunks; 1 FPS for vision (ADK max); Cloud Run in same region as Vertex AI |
| Recipe hallucination | **Tools + Firestore only**; system prompt: "Never invent steps or substitutions" |
| Vertex AI model access | Use `gemini-2.5-flash-native-audio-preview` (Gemini API) if Vertex unavailable; backend still on Cloud Run |

---

## 16. Success Metrics (Pre-Submission)

- [x] User can interrupt agent mid-sentence and get a relevant response
- [x] Agent uses camera input in at least one demonstrated interaction
- [x] End-to-end flow: select recipe → get guidance → interrupt → get answer → continue
- [x] Backend running on GCP with visible proof

---

## 17. Expansion Features (Post-MVP)

- [x] Implement User Authentication (Register/Login via JWT)
- [x] Setup Frontend Navigation (Login -> Dashboard -> Cooking View)
- [x] Dynamic Recipe Importer (Fetch URL, parse via Gemini, save to DB)

---

**Document Version:** 1.1
**Last Updated:** March 12, 2026  
**Hackathon:** Gemini Live Agent Challenge  
**Category:** Live Agents 🗣️ (interruptible)
