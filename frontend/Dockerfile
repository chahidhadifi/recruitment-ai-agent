FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy project files
COPY . .

# Skip build step for development
# RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Copy entrypoint script and make it executable
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Start the development server using the entrypoint script
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]