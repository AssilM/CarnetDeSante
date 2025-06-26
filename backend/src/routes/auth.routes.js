import express from "express";
import {
  signup,
  signin,
  signout,
  refreshToken,
  getMe,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Routes d'authentification
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signout", signout);
router.post("/refresh-token", refreshToken);
router.get("/me", verifyToken, getMe);

export default router;
