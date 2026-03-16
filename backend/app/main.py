from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .websockets import router as websockets_router
from .routers.auth import router as auth_router
from .routers.recipes import router as recipes_router

app = FastAPI(title="CookAlong Agent Backend")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(websockets_router)
app.include_router(auth_router)
app.include_router(recipes_router)

@app.get("/")
def read_root():
    return {"message": "CookAlong API is running."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
