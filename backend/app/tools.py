# Use mock data if firestore is not available.
MOCK_RECIPES = {
    "spaghetti-carbonara": {
        "title": "Spaghetti Carbonara",
        "description": "A classic Italian pasta dish.",
        "ingredients": [
            {"name": "Spaghetti", "amount": "400g"},
            {"name": "Guanciale", "amount": "150g"},
            {"name": "Pecorino Romano", "amount": "100g"},
            {"name": "Eggs", "amount": "4 large"},
            {"name": "Black pepper", "amount": "to taste"}
        ],
        "steps": [
            "Boil a large pot of salted water.",
            "Cook the spaghetti until al dente.",
            "Fry the guanciale until crispy.",
            "Whisk eggs and pecorino cheese together.",
            "Combine pasta, guanciale, and egg mixture off the heat."
        ]
    }
}

MOCK_SUBSTITUTIONS = {
    "guanciale": {
        "name": "Guanciale",
        "alternatives": ["Pancetta", "Bacon", "Smoked ham"],
        "notes": "If using bacon, you may need less added salt."
    },
    "pecorino romano": {
        "name": "Pecorino Romano",
        "alternatives": ["Parmigiano-Reggiano", "Grana Padano"],
        "notes": "Parmigiano is slightly sweeter and less salty."
    }
}

from functools import lru_cache
from .database import db

from typing import Optional

@lru_cache(maxsize=128)
def _get_cached_recipe_steps(recipe_id: str) -> Optional[list]:
    """Helper to cache the steps for a recipe to prevent repeated DB reads."""
    try:
        if db:
            doc_ref = db.collection("recipes").document(recipe_id)
            doc = doc_ref.get()
            if doc.exists:
                return doc.to_dict().get("steps", [])
            return None
    except Exception as e:
        print(f"Firestore error: {e}")

    # Fallback to mock
    recipe = MOCK_RECIPES.get(recipe_id)
    if recipe:
        return recipe.get("steps", [])
    return None

def get_recipe_step(recipe_id: str, step_num: int) -> str:
    """Gets a specific step from a recipe."""
    steps = _get_cached_recipe_steps(recipe_id)
    if steps is not None:
        if 0 <= step_num < len(steps):
            return steps[step_num]
        return f"Step {step_num} not found. This recipe has {len(steps)} steps."
    return f"Recipe '{recipe_id}' not found."

@lru_cache()
def get_substitution(ingredient: str) -> str:
    """Gets substitutions for a given ingredient."""
    ingredient_lower = ingredient.lower().strip()
    try:
        if db:
            # Firestore doesn't support case-insensitive querying easily.
            # We'll fetch all and do a simple fuzzy match locally for now,
            # or rely on a normalized "search_name" field if one existed.
            docs = db.collection("substitutions").stream()
            for doc in docs:
                data = doc.to_dict()
                name = data.get("name", "").lower()
                if ingredient_lower in name or name in ingredient_lower:
                    alts = ", ".join(data.get("alternatives", []))
                    notes = data.get("notes", "")
                    return f"Substitutions for {data.get('name')}: {alts}. Notes: {notes}"
    except Exception as e:
        print(f"Firestore error: {e}")

    # Fallback to mock
    for key, sub in MOCK_SUBSTITUTIONS.items():
        if ingredient_lower in key or key in ingredient_lower:
            alts = ", ".join(sub.get("alternatives", []))
            notes = sub.get("notes", "")
            return f"Substitutions for {sub.get('name')}: {alts}. Notes: {notes}"

    return f"I don't have any specific substitutions listed for {ingredient}, but you could try looking it up."

# The tools list that can be passed to the Gemini Model
def get_cooking_tools():
    return [get_recipe_step, get_substitution]
