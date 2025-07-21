import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('🔧 Configuration du répertoire de destination pour l\'upload');
    
    // Créer le dossier uploads s'il n'existe pas
    const uploadDir = 'uploads/documents';
    
    if (!fs.existsSync('uploads')) {
      console.log('📁 Création du dossier uploads/');
      fs.mkdirSync('uploads', { recursive: true });
    }
    
    if (!fs.existsSync(uploadDir)) {
      console.log('📁 Création du dossier uploads/documents/');
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    console.log('🏷️ Génération du nom de fichier pour:', file.originalname);
    
    // Générer un nom unique pour éviter les conflits
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `doc-${uniqueSuffix}${extension}`;
    
    console.log('✅ Nom de fichier généré:', filename);
    cb(null, filename);
  }
});

// Filtre pour les types de fichiers autorisés
const fileFilter = (req, file, cb) => {
  console.log('🔍 Vérification du type de fichier:', file.mimetype);
  
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    console.log('✅ Type de fichier autorisé:', file.mimetype);
    cb(null, true);
  } else {
    console.error('❌ Type de fichier non autorisé:', file.mimetype);
    cb(new Error(`Type de fichier non autorisé. Types acceptés: PDF, JPEG, PNG, WEBP`), false);
  }
};

// Configuration de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum
  }
});

// Middleware d'upload avec gestion d'erreur
export const uploadDocument = (req, res, next) => {
  console.log('📤 Middleware d\'upload de document - Début');
  
  const uploadSingle = upload.single('document');
  
  uploadSingle(req, res, (err) => {
    if (err) {
      console.error('❌ Erreur lors de l\'upload:', err.message);
      
      let errorMessage = 'Erreur lors de l\'upload du fichier';
      
      if (err instanceof multer.MulterError) {
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            errorMessage = 'Le fichier est trop volumineux (maximum 10MB)';
            break;
          case 'LIMIT_FILE_COUNT':
            errorMessage = 'Trop de fichiers uploadés';
            break;
          case 'LIMIT_UNEXPECTED_FILE':
            errorMessage = 'Fichier inattendu';
            break;
          default:
            errorMessage = `Erreur Multer: ${err.message}`;
        }
      } else {
        errorMessage = err.message;
      }
      
      return res.status(400).json({
        success: false,
        message: errorMessage,
        notification: {
          type: 'error',
          title: 'Erreur d\'upload',
          message: errorMessage
        }
      });
    }
    
    if (!req.file) {
      console.error('❌ Aucun fichier reçu');
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni',
        notification: {
          type: 'error',
          title: 'Fichier manquant',
          message: 'Veuillez sélectionner un fichier à uploader'
        }
      });
    }
    
    console.log('✅ Fichier uploadé avec succès:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    });
    
    next();
  });
};

// Middleware d'upload pour les photos de profil
export const uploadPhoto = (req, res, next) => {
  console.log('📤 Middleware d\'upload de photo de profil - Début');
  
  const uploadDir = "uploads/photos";
  if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads", { recursive: true });
  }
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const base = path.basename(file.originalname, path.extname(file.originalname)).replace(/\s+/g, "_");
      cb(null, `${base}.jpeg`);
    }
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Type de fichier non autorisé. Types acceptés: JPEG, PNG, WEBP"), false);
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
  }).single("photo")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
        notification: {
          type: 'error',
          title: 'Erreur d\'upload',
          message: err.message
        }
      });
    }
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni',
        notification: {
          type: 'error',
          title: 'Fichier manquant',
          message: 'Veuillez sélectionner une photo à uploader'
        }
      });
    }
    next();
  });
};

export default {
  uploadDocument,
  uploadPhoto
};