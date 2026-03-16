## 2025-03-15 - Cached get_recipe_step in backend
**Learning:** Found an optimization in `backend/app/tools.py`. `get_recipe_step` was fetching the entire recipe document from the database (Firestore or mock dictionary) on every agent step request.
**Action:** Created `_get_cached_recipe_steps` annotated with `@lru_cache(maxsize=128)` so that once a recipe's steps are fetched during a session, subsequent step requests hit the cache, making step lookups `O(1)` instead of hitting the DB or iterating dictionary objects over and over.

## 2025-03-15 - Deduplicate WebSocket State Messages
**Learning:** The Gemini Live API's BIDI stream returns model turns broken into multiple parts for real-time streaming audio. The backend was emitting `{"type": "agent_state", "state": "speaking"}` on every single audio chunk in the stream instead of just when the state changed, resulting in massive redundant JSON serialization and network usage.
**Action:** Always maintain a `last_agent_state` cache in streaming websocket loops and only emit state transitions rather than broadcasting the current state on every event loop tick.
