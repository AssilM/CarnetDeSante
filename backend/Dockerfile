# Utiliser Node.js 18 comme image de base
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Créer le dossier uploads s'il n'existe pas
RUN mkdir -p uploads/documents uploads/photos

# Exposer le port
EXPOSE 5001

# Commande de démarrage
CMD ["npm", "start"]