FROM python:3.11-slim

WORKDIR /app

# Install system dependencies if required for audio or other libs
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Assuming requirements.txt exists and contains necessary packages
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/backend

# Set the python path so the app module can be found
ENV PYTHONPATH=/app

EXPOSE 8080

CMD ["python", "-m", "backend.app.main"]
