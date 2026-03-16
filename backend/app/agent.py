import os
import asyncio
import base64
from google import genai
from google.genai import types

from .tools import get_cooking_tools

# System instruction defining the persona
SYSTEM_PROMPT = """You are CookAlong, a friendly, expert live cooking coach.
You guide users step-by-step through recipes.
Crucially, you only rely on the tools `get_recipe_step` and `get_substitution` for facts. Do not invent steps or substitutes.
You have access to their camera feed (which updates at 1 FPS) and can see their kitchen, ingredients, and progress.
Acknowledge what you see if it's relevant (e.g., "I see you're chopping the onions now").
The user can interrupt you at any time. If they ask a question or need a substitution, answer concisely, then ask if they are ready to continue.
Be conversational, helpful, and concise. Keep instructions brief so the user can keep up.
"""

class LiveAgent:
    def __init__(self):
        # We assume the user has set GOOGLE_API_KEY
        # For the hackathon, you can also use vertex ai (e.g. `gemini-live-2.5-flash-native-audio` or `gemini-2.5-flash-native-audio-preview`)
        # using vertex ai client if preferred. Here we use the standard genai sdk.
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.client = genai.Client(api_key=self.api_key) if self.api_key else None

        # Determine the model. It needs to support live native audio + BIDI streaming.
        self.model = "gemini-2.5-flash"
        self.session = None

    async def connect(self, recipe_id: str = None):
        if not self.client:
            print("Warning: GEMINI_API_KEY is not set. The LiveAgent will not connect.")
            return False

        try:
            prompt = SYSTEM_PROMPT
            if recipe_id:
                prompt += f"\n\nThe user has selected the recipe ID: {recipe_id}. Use this context for tools and interactions."

            # Configure LiveConnect to respond with Bidi-audio, grounded with our tools
            config = types.LiveConnectConfig(
                response_modalities=[types.LiveModality.AUDIO],
                system_instruction=types.Content(parts=[types.Part.from_text(prompt)]),
                tools=get_cooking_tools()
            )

            print(f"Connecting to Gemini Live API with model {self.model}...")
            # Setup BIDI stream
            self.session = await self.client.aio.live.connect(model=self.model, config=config)
            print("Live API connection established successfully.")
            return True
        except Exception as e:
            print(f"Error connecting to Live API: {e}")
            return False

    async def process_audio(self, pcm_data: bytes):
        """Sends raw audio data to the live session."""
        if self.session:
            await self.session.send(input={"data": pcm_data, "mime_type": "audio/pcm;rate=16000"})

    async def process_image(self, base64_image: str):
         """Sends base64 jpeg image data to the live session."""
         if self.session:
             # Strip standard base64 prefix if the frontend sent it
             if base64_image.startswith("data:image"):
                 base64_image = base64_image.split(",")[1]
             # Send base64 payload
             image_bytes = base64.b64decode(base64_image)
             await self.session.send(input={"data": image_bytes, "mime_type": "image/jpeg"})
