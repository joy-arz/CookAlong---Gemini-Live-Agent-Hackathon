import os
import json
import base64
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Optional

from .agent import LiveAgent

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    agent = LiveAgent()
    # Wait to connect until start_session if we want recipe context, or just connect now.
    # We can connect first without recipe_id, but the agent wouldn't know the context.
    # Alternatively, we connect during start_session.
    # Let's connect eagerly to speed it up.
    connected = await agent.connect()

    receive_task = None

    # Background task to continuously read from the Live API session and send to client
    async def receive_from_agent():
        if not agent.session:
            return

        # ⚡ Bolt: Cache the last agent state to avoid sending redundant duplicate state updates over the websocket
        last_agent_state = None

        async def send_state_if_changed(state: str):
            nonlocal last_agent_state
            if state != last_agent_state:
                await websocket.send_text(json.dumps({"type": "agent_state", "state": state}))
                last_agent_state = state

        try:
            async for response in agent.session.receive():
                # Extract audio response if present
                if response.server_content:
                    # Handle interruption
                    if response.server_content.interrupted:
                        await websocket.send_text(json.dumps({"type": "interruption", "action": "clear_buffer"}))
                        await send_state_if_changed("interrupted")

                    model_turn = response.server_content.model_turn
                    if model_turn:
                        await send_state_if_changed("speaking")
                        for part in model_turn.parts:
                            # Send audio payload to client
                            if part.inline_data and "audio" in part.inline_data.mime_type:
                                await websocket.send_bytes(part.inline_data.data)

                # Turn complete, set state to listening if not interrupted
                if response.server_content and response.server_content.turn_complete:
                     await send_state_if_changed("listening")

                # Handle tool calls returned by the model
                if response.tool_call:
                    await send_state_if_changed("thinking (tool)")
                    print(f"Agent requested tool call: {response.tool_call.function_calls[0].name}")
                    # Execute tool call
                    from .tools import get_recipe_step, get_substitution

                    tool_responses = []
                    for call in response.tool_call.function_calls:
                        name = call.name
                        args = call.args or {}

                        result = "Tool not found."
                        if name == "get_recipe_step":
                            # get_recipe_step expects (recipe_id, step_num)
                            # args could be parsed, let's assume dict
                            result = get_recipe_step(args.get("recipe_id"), args.get("step_num"))

                            # Stream the step to the frontend for the AR overlay
                            try:
                                step_num = args.get("step_num")
                                if step_num is not None:
                                    step_data = {
                                        "type": "recipe_step",
                                        "step_num": step_num + 1,  # 1-based index for UI
                                        "instruction": result
                                    }
                                    await websocket.send_text(json.dumps(step_data))
                            except Exception as e:
                                print(f"Error sending step data: {e}")

                        elif name == "get_substitution":
                            result = get_substitution(args.get("ingredient"))

                        tool_responses.append({
                            "id": call.id,
                            "name": name,
                            "response": {"result": result}
                        })

                    # Send tool response back to Gemini session
                    if agent.session and tool_responses:
                        # Assuming genai api format
                        from google.genai import types

                        try:
                            # The proper way to send a tool response with google-genai SDK
                            # is to pass the parts or pass the FunctionResponse inside a Part object.
                            # The function calls provide an id, so the FunctionResponse must include that id.

                            function_responses = []
                            for tr in tool_responses:
                                fr = types.FunctionResponse(name=tr["name"], id=tr["id"], response=tr["response"])
                                function_responses.append(types.Part(function_response=fr))

                            await agent.session.send(input=function_responses)
                        except Exception as e:
                            print(f"Error sending tool response: {e}")

        except Exception as e:
            print(f"Error receiving from agent: {e}")

    # Start the background task
    receive_task = asyncio.create_task(receive_from_agent())

    try:
        while True:
            # The client sends either a JSON text payload or a raw binary PCM blob
            data = await websocket.receive()

            if data.get("text") is not None:
                try:
                    text_data = json.loads(data["text"])
                    msg_type = text_data.get("type")

                    if msg_type == "image":
                        # We received a base64 encoded JPEG
                        b64_image = text_data.get("data")
                        await agent.process_image(b64_image)
                        print(f"Received an image frame of length {len(b64_image)}")

                    elif msg_type == "control":
                        action = text_data.get("action")
                        if action == "start_session":
                            recipe_id = text_data.get('recipe_id')
                            print(f"Starting session for recipe: {recipe_id}")

                            # We might have connected already without context, let's close and reconnect
                            if agent.session:
                                # We can't cleanly close the bidi stream easily without breaking the loop,
                                # but we can send a system prompt update if supported, or reconnect.
                                # For now, let's just use the current session. The prompt is already set,
                                # so let's send a textual user input to the agent to initialize the context.
                                await agent.session.send(input=f"Start cooking recipe: {recipe_id}")

                        elif action == "stop_session":
                            print("Stopping session.")

                except json.JSONDecodeError:
                    print(f"Invalid JSON received: {data['text']}")

            elif data.get("bytes") is not None:
                # We received raw audio chunk (16kHz PCM from mic)
                audio_bytes = data["bytes"]
                await agent.process_audio(audio_bytes)
                # print(f"Received {len(audio_bytes)} bytes of audio.")

    except WebSocketDisconnect:
        print("Client disconnected from WebSocket.")
    except Exception as e:
        print(f"WebSocket Error: {e}")
    finally:
        # Cleanup
        receive_task.cancel()
        print("Cleaning up session.")
