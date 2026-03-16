import os
from google.cloud import firestore

# MOCK DATA from tools.py
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

def seed_database():
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "cookalong-dev")
    try:
        db = firestore.Client(project=project_id)
        print(f"Connected to Firestore project: {project_id}")
    except Exception as e:
        print(f"Failed to connect to Firestore. Ensure credentials are set. Error: {e}")
        return

    # Seed recipes
    for recipe_id, recipe_data in MOCK_RECIPES.items():
        doc_ref = db.collection("recipes").document(recipe_id)
        doc_ref.set(recipe_data)
        print(f"Seeded recipe: {recipe_id}")

    # Seed substitutions
    for sub_id, sub_data in MOCK_SUBSTITUTIONS.items():
        # Ensure name matches the expected format in tools (capitalized)
        sub_data["name"] = sub_data["name"].capitalize()
        doc_ref = db.collection("substitutions").document(sub_id)
        doc_ref.set(sub_data)
        print(f"Seeded substitution: {sub_id}")

    print("Firestore seeding complete.")

if __name__ == "__main__":
    seed_database()
