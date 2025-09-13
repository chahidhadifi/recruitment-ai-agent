FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first for better layer caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and migrations
COPY ./app ./app
COPY ./migrations ./migrations
COPY ./alembic.ini .

# Create a startup script
COPY ./start.sh .
RUN chmod +x ./start.sh

# Expose port
EXPOSE 8000

# Command to run the application with migrations
CMD ["./start.sh"]
