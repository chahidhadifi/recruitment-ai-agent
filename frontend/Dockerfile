FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy project files
COPY . .

# Copy Docker-specific .env file
COPY .env.docker .env.local

# Expose the port the app runs on
EXPOSE 3000

# Start the application in development mode for hot reloading
CMD ["npm", "run", "dev"]