import express from "express";
import {
  signup,
  signupMedecin,
  signin,
  signout,
  refreshToken,
  getMe,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  validateRegistrationData,
  checkEmailUnique,
} from "../middlewares/validation/auth.validation.js";

const router = express.Router();

// Routes publiques
router.post("/signup", validateRegistrationData, checkEmailUnique, signup);
router.post(
  "/signup/medecin",
  validateRegistrationData,
  checkEmailUnique,
  signupMedecin
);
router.post("/signin", signin);
router.post("/refresh-token", refreshToken);
router.post("/refresh", refreshToken);

// Routes protégées
router.use(authenticate);
router.get("/me", getMe);
router.post("/signout", signout);

export default router;
