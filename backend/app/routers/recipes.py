import os
import requests
import uuid
from bs4 import BeautifulSoup
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types

from ..auth import get_current_user
from ..database import db
from ..tools import MOCK_RECIPES

router = APIRouter(prefix="/recipes", tags=["recipes"])

class RecipeImport(BaseModel):
    url: str

class RecipeResponse(BaseModel):
    id: str
    title: str
    description: str

@router.get("/")
async def list_recipes(current_user: dict = Depends(get_current_user)):
    """List all available recipes."""
    recipes = []

    # Try getting from Firestore
    if db:
        try:
            docs = db.collection("recipes").stream()
            for doc in docs:
                data = doc.to_dict()
                recipes.append({
                    "id": doc.id,
                    "title": data.get("title", doc.id),
                    "description": data.get("description", "")
                })
            return recipes
        except Exception as e:
            print(f"Firestore error fetching recipes: {e}")

    # Fallback to mock
    for r_id, r_data in MOCK_RECIPES.items():
        recipes.append({
            "id": r_id,
            "title": r_data.get("title", ""),
            "description": r_data.get("description", "")
        })
    return recipes

@router.post("/import", response_model=RecipeResponse)
async def import_recipe(req: RecipeImport, current_user: dict = Depends(get_current_user)):
    """Fetch a URL, extract recipe using Gemini, and save to database."""
    try:
        response = requests.get(req.url, timeout=10)
        response.raise_for_status()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {e}")

    # Extract text from HTML
    soup = BeautifulSoup(response.content, "html.parser")
    text_content = soup.get_text(separator=" ", strip=True)

    # Use Gemini to parse into structured format
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
         raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")

    client = genai.Client(api_key=api_key)

    prompt = f"""
    You are an expert recipe parser. Extract the recipe from the following text.
    Return ONLY a valid JSON object with the following schema:
    {{
        "title": "Recipe Title",
        "description": "Short description",
        "ingredients": [
            {{"name": "Ingredient 1", "amount": "Quantity"}},
            {{"name": "Ingredient 2", "amount": "Quantity"}}
        ],
        "steps": [
            "Step 1 description.",
            "Step 2 description."
        ]
    }}

    Text content:
    {text_content[:8000]} # Limit to avoid token overflow
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )

        # Parse output
        import json
        recipe_data = json.loads(response.text)

        # Validate minimal structure
        if "title" not in recipe_data or "steps" not in recipe_data:
             raise ValueError("Parsed JSON missing title or steps.")

        # Generate ID and save
        recipe_id = str(uuid.uuid4())

        if db:
            db.collection("recipes").document(recipe_id).set(recipe_data)
        else:
            MOCK_RECIPES[recipe_id] = recipe_data

        return RecipeResponse(
            id=recipe_id,
            title=recipe_data.get("title", ""),
            description=recipe_data.get("description", "")
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse recipe: {e}")
