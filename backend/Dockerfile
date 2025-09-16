FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first for better layer caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ./app ./app

# No longer using Alembic for migrations

# Copy Docker-specific .env file
COPY .env.docker .env

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["sh", "-c", "echo 'Waiting for database to be ready...' && sleep 5 && echo 'Starting the application...' && exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]
