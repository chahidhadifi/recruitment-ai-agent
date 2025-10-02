FROM node:18-alpine

WORKDIR /app

# Copier package.json et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste du code (sera remplacé par le bind mount)
COPY . .

# Exposer le port
EXPOSE 3000

# Commande de développement avec hot reload
CMD ["npm", "run", "dev"]