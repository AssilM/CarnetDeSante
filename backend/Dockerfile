# commande pour build : docker build -t backend .
#commande pour run :   

FROM node:20-slim

# Dossier de travail dans le conteneur
WORKDIR /app

# Copie des fichiers de dépendances
COPY package.json .env ./
RUN npm install --production
# Copie du code source
COPY . .
RUN node INITBDD.js

# Expose le port utilisé par le backend (défini dans .env, par défaut 5001)
EXPOSE 5001

# Commande de démarrage
CMD ["node", "src/server.js"]
