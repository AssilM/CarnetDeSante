// Utilitaire de debug pour l'authentification
export const debugAuth = () => {
  console.log('=== DEBUG AUTHENTIFICATION ===');
  
  // Vérifier le token dans localStorage
  const token = localStorage.getItem('accessToken');
  console.log('Token dans localStorage:', token ? 'Présent' : 'Absent');
  
  if (token) {
    try {
      // Décoder le token JWT (partie payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token décodé:', {
        userId: payload.id,
        email: payload.email,
        role: payload.role,
        exp: new Date(payload.exp * 1000).toLocaleString(),
        iat: new Date(payload.iat * 1000).toLocaleString()
      });
      
      // Vérifier si le token a expiré
      const now = Date.now() / 1000;
      if (payload.exp < now) {
        console.log('❌ Token expiré!');
      } else {
        console.log('✅ Token valide');
      }
    } catch (error) {
      console.log('❌ Erreur lors du décodage du token:', error);
    }
  }
  
  // Vérifier les cookies
  console.log('Cookies:', document.cookie);
  
  // Vérifier l'URL actuelle
  console.log('URL actuelle:', window.location.href);
  
  console.log('=== FIN DEBUG ===');
};

// Fonction pour nettoyer l'authentification
export const clearAuthDebug = () => {
  console.log('=== NETTOYAGE AUTH ===');
  localStorage.removeItem('accessToken');
  console.log('Token supprimé de localStorage');
  console.log('=== FIN NETTOYAGE ===');
}; 