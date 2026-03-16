terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable APIs
resource "google_project_service" "run_api" {
  service = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "firestore_api" {
  service = "firestore.googleapis.com"
  disable_on_destroy = false
}

# Create Firestore database
resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
  depends_on  = [google_project_service.firestore_api]
}

# Cloud Run service for backend
resource "google_cloud_run_service" "cookalong_backend" {
  name     = "cookalong-backend"
  location = var.region

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/cookalong-backend:latest"
        env {
          name  = "GOOGLE_CLOUD_PROJECT"
          value = var.project_id
        }
        env {
          name  = "GEMINI_API_KEY"
          value = var.gemini_api_key
        }
        ports {
          container_port = 8080
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [google_project_service.run_api]
}

# Make the Cloud Run service public
resource "google_cloud_run_service_iam_member" "public_access" {
  service  = google_cloud_run_service.cookalong_backend.name
  location = google_cloud_run_service.cookalong_backend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
