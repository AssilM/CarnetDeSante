import express from "express";
import {
  signup,
  signin,
  signout,
  refreshToken,
  getMe,
  checkUserAuth,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  validateRegistrationData,
  checkEmailUnique,
  validateLoginData,
} from "../middlewares/validation/auth.validation.js";

const router = express.Router();

// Routes publiques
router.post("/signup", validateRegistrationData, checkEmailUnique, signup);
router.post("/signin", validateLoginData, signin);
router.post("/refresh-token", refreshToken);
router.post("/refresh", refreshToken);

// Routes protégées
router.use(authenticate);
router.get("/me", getMe);
router.post("/signout", signout);
router.get("/check", checkUserAuth);

export default router;
