import os
from google.cloud import firestore

def get_db():
    try:
        project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "cookalong-dev")
        db = firestore.Client(project=project_id)
        return db
    except Exception as e:
        print(f"Error initializing Firestore client: {e}")
        # Return a mock dictionary for testing if actual firestore is not available
        return None

db = get_db()
