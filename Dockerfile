# Root-level Dockerfile for Railway (build context = repo root)
# Railway detects this automatically when Root Directory is not set
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ /app/backend

ENV PYTHONPATH=/app
EXPOSE 8080

CMD ["python", "-m", "backend.app.main"]
