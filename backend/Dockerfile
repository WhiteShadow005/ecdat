# ECDAT Backend — Production Dockerfile
# High-performance FastAPI server with WeasyPrint & Cryptographic scanning support

FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Install system dependencies required for WeasyPrint (PDF rendering), Cryptography, and Git
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libffi-dev \
    shared-mime-info \
    fonts-liberation \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
# Install packages (excluding optional liboqs-python if C-headers absent)
RUN grep -v "liboqs-python" requirements.txt > req_core.txt && \
    pip install --no-cache-dir -r req_core.txt && \
    pip install --no-cache-dir liboqs-python || true

# Copy application source code
COPY . .

# Create directory for uploads and database with proper permissions
RUN mkdir -p /app/tmp/uploads /app/data && chmod -R 777 /app/tmp /app/data

EXPOSE 8000

# Run Uvicorn server with dynamic PORT binding
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
