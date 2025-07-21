import express from "express";
import {
  getAllAdministrateurs,
  getAdministrateurById,
  updateAdministrateur,
  deleteAdministrateur,
  getDashboardStats,
  // Gestion des utilisateurs côté admin
  getAllUsers,
  getAllUsersWithDetails,
  getUserById,
  getUserByIdWithDetails,
  getUsersByRole,
  updateUser,
  updateUserWithDetails,
  deleteUser,
  // Gestion des documents côté admin
  getAllDocuments,
  getDocumentById,
  deleteDocument,
  getDocumentsByType,
  downloadDocument,
  // Controllers de gestion des liens patient-médecin
  getAllPatientDoctorRelationships,
  getPatientsByDoctor,
  getDoctorsByPatient,
  createPatientDoctorRelationship,
  deletePatientDoctorRelationship,
  // Controllers de gestion des permissions de documents
  getAllDocumentPermissions,
  getDocumentPermissions,
  createDocumentPermission,
  deleteDocumentPermission,
  revokeDocumentPermission,
} from "../admin/admin.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Toutes les routes nécessitent une authentification et des droits d'administrateur
router.use(authenticate);
router.use(authorize("admin"));

// Routes pour le tableau de bord administrateur
router.get("/dashboard/stats", getDashboardStats);

// Routes de gestion des utilisateurs (côté admin)
router.get("/users", getAllUsers);
router.get("/users/details", getAllUsersWithDetails);
router.get("/users/role/:role", getUsersByRole);
router.get("/users/:id", getUserById);
router.get("/users/:id/details", getUserByIdWithDetails);
router.put("/users/:id", updateUser);
router.put("/users/:id/details", updateUserWithDetails);
router.delete("/users/:id", deleteUser);

// Routes de gestion des documents (côté admin)
router.get("/documents", getAllDocuments);
router.get("/documents/type/:typeId", getDocumentsByType);
router.get("/documents/:id", getDocumentById);
router.get("/documents/:id/download", downloadDocument);
router.delete("/documents/:id", deleteDocument);

// Routes de gestion des liens patient-médecin (côté admin)
router.get("/relationships", getAllPatientDoctorRelationships);
router.get("/relationships/doctor/:doctorId", getPatientsByDoctor);
router.get("/relationships/patient/:patientId", getDoctorsByPatient);
router.post("/relationships", createPatientDoctorRelationship);
router.delete(
  "/relationships/:patientId/:doctorId",
  deletePatientDoctorRelationship
);

// Routes de gestion des permissions de documents (côté admin)
router.get("/permissions", getAllDocumentPermissions);
router.get("/permissions/document/:documentId", getDocumentPermissions);
router.post("/permissions", createDocumentPermission);
router.delete("/permissions/:documentId/:userId", deleteDocumentPermission);
router.post("/permissions/revoke", revokeDocumentPermission);

// Routes administrateurs (doivent être en dernier pour éviter les conflits)
router.get("/", getAllAdministrateurs);
router.get("/:id", getAdministrateurById);
router.put("/:id", updateAdministrateur);
router.delete("/:id", deleteAdministrateur);

export default router;
