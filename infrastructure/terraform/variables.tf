variable "project_id" {
  description = "The GCP Project ID"
  type        = string
}

variable "region" {
  description = "The GCP region to deploy resources in"
  type        = string
  default     = "us-central1"
}

variable "gemini_api_key" {
  description = "API key for Gemini Live API"
  type        = string
  sensitive   = true
}
