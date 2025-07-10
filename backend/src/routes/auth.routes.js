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
  validateSignupData,
  validateSigninData,
} from "../middlewares/auth.validation.middleware.js";

const router = express.Router();

// Routes publiques avec validation
router.post("/signup", validateSignupData, signup);
router.post("/signup/medecin", validateSignupData, signupMedecin);
router.post("/signin", validateSigninData, signin);
router.post("/refresh-token", refreshToken);
router.post("/refresh", refreshToken);

// Routes protégées
router.use(authenticate);
router.get("/me", getMe);
router.post("/signout", signout);

export default router;
