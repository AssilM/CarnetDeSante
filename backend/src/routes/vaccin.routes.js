import express from 'express';
import { 
  getVaccins, 
  getVaccinById, 
  createVaccin, 
  updateVaccin, 
  deleteVaccin, 
  getVaccinsByStatut 
} from '../controllers/vaccin.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes pour les vaccins
router.get('/patient/:patient_id', getVaccins);
router.get('/patient/:patient_id/statut/:statut', getVaccinsByStatut);
router.get('/:id', getVaccinById);
router.post('/', createVaccin);
router.put('/:id', updateVaccin);
router.delete('/:id', deleteVaccin);

export default router;