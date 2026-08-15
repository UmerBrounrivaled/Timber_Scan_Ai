FROM python:3.10-slim

# Install system dependencies & Node.js for frontend compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy frontend source and build static bundle
COPY frontend/ ./frontend/
RUN cd frontend && npm install && npm run build

# Copy application files and model
COPY defect_pipeline.py .
COPY main.py .
COPY wood_autoencoder.keras .
COPY sample_images/ ./sample_images/

# Expose port
EXPOSE 8000

# Start command (bind to $PORT set by Render, fallback to 8000)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]

