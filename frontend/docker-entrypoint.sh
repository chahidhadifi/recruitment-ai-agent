#!/bin/sh

# Copy the appropriate environment file for Docker
if [ -f .env.docker ]; then
    echo "Using Docker environment configuration"
    cp .env.docker .env.local
else
    echo "Using default environment configuration"
fi

# Start the application
exec npm run dev