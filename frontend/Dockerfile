FROM --platform=linux/x86_64 node:20-alpine

WORKDIR /app

# Install necessary dependencies
RUN apk add --no-cache libc6-compat

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy project files
COPY . .

EXPOSE 3000

# Start directly without entrypoint
CMD ["npm", "run", "dev"]