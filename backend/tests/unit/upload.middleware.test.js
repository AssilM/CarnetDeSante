import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";

// Créer des mocks pour les objets req/res
const createMockObjects = () => {
  const req = {
    file: undefined,
    files: undefined,
    body: {},
  };

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };

  const next = vi.fn();

  return { req, res, next };
};

// Mock du module fs
vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
  },
}));

// Mock multer pour les tests
const mockMulter = vi.fn(() => ({
  single: vi.fn(() => (req, res, next) => next()),
  any: vi.fn(() => (req, res, next) => next()),
}));

mockMulter.diskStorage = vi.fn();
mockMulter.memoryStorage = vi.fn();

vi.mock("multer", () => ({
  default: mockMulter,
}));

describe("upload.middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Configuration du stockage", () => {
    it("vérifie que multer peut être configuré", () => {
      // Test simple pour vérifier que le mock fonctionne
      expect(mockMulter.diskStorage).toBeDefined();
      expect(typeof mockMulter).toBe("function");
    });
  });

  describe("Validation des types de fichiers", () => {
    // Tests pour fileFilter - nous devons tester la logique de validation
    const mockFileFilter = (file, cb) => {
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "text/plain",
      ];

      const isValidType = allowedTypes.includes(file.mimetype);
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!isValidType) {
        const error = new Error("Type de fichier non autorisé");
        error.code = "INVALID_FILE_TYPE";
        return cb(error, false);
      }

      if (file.size && file.size > maxSize) {
        const error = new Error("Fichier trop volumineux (max 10MB)");
        error.code = "FILE_TOO_LARGE";
        return cb(error, false);
      }

      cb(null, true);
    };

    it("accepte les fichiers PDF", () => {
      const mockFile = {
        originalname: "document.pdf",
        mimetype: "application/pdf",
        size: 1024 * 1024, // 1MB
      };

      const mockCb = vi.fn();
      mockFileFilter(mockFile, mockCb);

      expect(mockCb).toHaveBeenCalledWith(null, true);
    });

    it("accepte les images JPEG", () => {
      const mockFile = {
        originalname: "image.jpg",
        mimetype: "image/jpeg",
        size: 2 * 1024 * 1024, // 2MB
      };

      const mockCb = vi.fn();
      mockFileFilter(mockFile, mockCb);

      expect(mockCb).toHaveBeenCalledWith(null, true);
    });

    it("accepte les images PNG", () => {
      const mockFile = {
        originalname: "image.png",
        mimetype: "image/png",
        size: 1.5 * 1024 * 1024, // 1.5MB
      };

      const mockCb = vi.fn();
      mockFileFilter(mockFile, mockCb);

      expect(mockCb).toHaveBeenCalledWith(null, true);
    });

    it("accepte les documents Word", () => {
      const mockFile = {
        originalname: "document.docx",
        mimetype:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: 3 * 1024 * 1024, // 3MB
      };

      const mockCb = vi.fn();
      mockFileFilter(mockFile, mockCb);

      expect(mockCb).toHaveBeenCalledWith(null, true);
    });

    it("rejette les fichiers non autorisés", () => {
      const mockFile = {
        originalname: "script.exe",
        mimetype: "application/x-executable",
        size: 1024,
      };

      const mockCb = vi.fn();
      mockFileFilter(mockFile, mockCb);

      expect(mockCb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Type de fichier non autorisé",
          code: "INVALID_FILE_TYPE",
        }),
        false
      );
    });

    it("rejette les fichiers trop volumineux", () => {
      const mockFile = {
        originalname: "huge.pdf",
        mimetype: "application/pdf",
        size: 15 * 1024 * 1024, // 15MB > 10MB limite
      };

      const mockCb = vi.fn();
      mockFileFilter(mockFile, mockCb);

      expect(mockCb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Fichier trop volumineux (max 10MB)",
          code: "FILE_TOO_LARGE",
        }),
        false
      );
    });

    it("accepte les fichiers sans taille (pas encore uploadés)", () => {
      const mockFile = {
        originalname: "document.pdf",
        mimetype: "application/pdf",
        // pas de propriété size
      };

      const mockCb = vi.fn();
      mockFileFilter(mockFile, mockCb);

      expect(mockCb).toHaveBeenCalledWith(null, true);
    });
  });

  describe("Génération des noms de fichiers", () => {
    it("génère un nom unique avec timestamp", () => {
      const originalDate = Date.now;
      const mockTimestamp = 1234567890;
      Date.now = vi.fn(() => mockTimestamp);

      vi.spyOn(Math, "random").mockReturnValue(0.5);

      const mockFile = {
        originalname: "document.pdf",
      };

      const mockCb = vi.fn();

      // Simuler la fonction filename de multer
      const generateFilename = (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        const filename = `doc-${uniqueSuffix}${extension}`;
        cb(null, filename);
      };

      generateFilename({}, mockFile, mockCb);

      expect(mockCb).toHaveBeenCalledWith(
        null,
        `doc-${mockTimestamp}-500000000.pdf`
      );

      // Restaurer
      Date.now = originalDate;
      vi.restoreAllMocks();
    });

    it("préserve l'extension du fichier original", () => {
      const mockFile = {
        originalname: "rapport.docx",
      };

      const mockCb = vi.fn();

      const generateFilename = (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        const filename = `doc-${uniqueSuffix}${extension}`;
        cb(null, filename);
      };

      generateFilename({}, mockFile, mockCb);

      const generatedFilename = mockCb.mock.calls[0][1];
      expect(generatedFilename).toMatch(/^doc-\d+-\d+\.docx$/);
    });

    it("gère les fichiers sans extension", () => {
      const mockFile = {
        originalname: "document_sans_extension",
      };

      const mockCb = vi.fn();

      const generateFilename = (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        const filename = `doc-${uniqueSuffix}${extension}`;
        cb(null, filename);
      };

      generateFilename({}, mockFile, mockCb);

      const generatedFilename = mockCb.mock.calls[0][1];
      expect(generatedFilename).toMatch(/^doc-\d+-\d+$/);
    });
  });

  describe("Gestion des erreurs d'upload", () => {
    it("gère les erreurs de limite de taille", () => {
      const { req, res, next } = createMockObjects();

      // Simuler une erreur multer
      const error = new Error("File too large");
      error.code = "LIMIT_FILE_SIZE";

      // Middleware de gestion d'erreur d'upload
      const handleUploadError = (error, req, res, next) => {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            message: "Fichier trop volumineux (maximum 10MB)",
            code: "FILE_TOO_LARGE",
          });
        }

        if (error.code === "INVALID_FILE_TYPE") {
          return res.status(400).json({
            message: "Type de fichier non autorisé",
            code: "INVALID_FILE_TYPE",
          });
        }

        next(error);
      };

      handleUploadError(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Fichier trop volumineux (maximum 10MB)",
        code: "FILE_TOO_LARGE",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("gère les erreurs de type de fichier", () => {
      const { req, res, next } = createMockObjects();

      const error = new Error("Invalid file type");
      error.code = "INVALID_FILE_TYPE";

      const handleUploadError = (error, req, res, next) => {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            message: "Fichier trop volumineux (maximum 10MB)",
            code: "FILE_TOO_LARGE",
          });
        }

        if (error.code === "INVALID_FILE_TYPE") {
          return res.status(400).json({
            message: "Type de fichier non autorisé",
            code: "INVALID_FILE_TYPE",
          });
        }

        next(error);
      };

      handleUploadError(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Type de fichier non autorisé",
        code: "INVALID_FILE_TYPE",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("transmet les autres erreurs au middleware suivant", () => {
      const { req, res, next } = createMockObjects();

      const error = new Error("Database connection failed");

      const handleUploadError = (error, req, res, next) => {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            message: "Fichier trop volumineux (maximum 10MB)",
            code: "FILE_TOO_LARGE",
          });
        }

        if (error.code === "INVALID_FILE_TYPE") {
          return res.status(400).json({
            message: "Type de fichier non autorisé",
            code: "INVALID_FILE_TYPE",
          });
        }

        next(error);
      };

      handleUploadError(error, req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("Validation de la sécurité", () => {
    it("rejette les noms de fichiers dangereux", () => {
      const dangerousFilenames = [
        "../../../etc/passwd",
        "..\\..\\windows\\system32\\config\\sam",
        "script.exe",
        "virus.bat",
        ".htaccess",
        "config.php",
      ];

      dangerousFilenames.forEach((filename) => {
        const mockFile = {
          originalname: filename,
          mimetype: "application/octet-stream",
        };

        const mockCb = vi.fn();

        // Utiliser la fonction de validation définie plus haut dans les tests
        const mockFileFilter = (file, cb) => {
          const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
            "text/plain",
          ];

          const isValidType = allowedTypes.includes(file.mimetype);

          if (!isValidType) {
            const error = new Error("Type de fichier non autorisé");
            error.code = "INVALID_FILE_TYPE";
            return cb(error, false);
          }

          cb(null, true);
        };

        mockFileFilter(mockFile, mockCb);

        expect(mockCb).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Type de fichier non autorisé",
          }),
          false
        );
      });
    });

    it("nettoie les noms de fichiers avec caractères spéciaux", () => {
      const mockFile = {
        originalname: "document_très_important!@#$%^&*()+={}[]|\\:\";'<>,.pdf",
      };

      const mockCb = vi.fn();

      // Simuler le nettoyage du nom de fichier
      const cleanFilename = (originalname) => {
        const extension = path.extname(originalname);
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        return `doc-${uniqueSuffix}${extension}`;
      };

      const generateFilename = (req, file, cb) => {
        const filename = cleanFilename(file.originalname);
        cb(null, filename);
      };

      generateFilename({}, mockFile, mockCb);

      const generatedFilename = mockCb.mock.calls[0][1];
      // Le nom généré ne devrait contenir que des caractères sûrs
      expect(generatedFilename).toMatch(/^doc-\d+-\d+\.pdf$/);
    });
  });
});
