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
# Expose le port utilisé par le backend (défini dans .env, par défaut 5001)
EXPOSE 5001
# Script de démarrage qui initialise la base de données puis démarre le serveur
CMD ["sh", "-c", "node init-database.js && node src/server.js"]