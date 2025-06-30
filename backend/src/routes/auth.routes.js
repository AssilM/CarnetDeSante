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

const router = express.Router();

// Routes publiques
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/refresh-token", refreshToken);

// Routes protégées
router.use(authenticate);
router.post("/signout", signout);
router.get("/me", getMe);
router.get("/check-auth", checkUserAuth);

export default router;
