import express from "express";
import {
  signup,
  signupMedecin,
  signin,
  signout,
  refreshToken,
  getMe,
  requestLoginOTP,
  signinWithOTP,
  verifyEmail,
  resendVerification,
} from "../auth/auth.controller.js";
import {
  forgotPassword,
  verifyResetToken,
  resetPasswordHandler,
} from "../auth/passwordReset.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  validateSignupData,
  validateSigninData,
  validateLoginOTP,
  validateEmailOTP,

  validateForgotPassword,
  validateVerifyResetToken,
  validateResetPassword,

} from "../middlewares/auth.validation.middleware.js";

const router = express.Router();

// Routes publiques avec validation
router.post("/signup", validateSignupData, signup);
router.post("/signup/medecin", validateSignupData, signupMedecin);
router.post("/signin", validateSigninData, signin);
router.post("/refresh-token", refreshToken);
router.post("/refresh", refreshToken);

// Routes OTP et vérification d'email
router.post("/login/request-otp", validateSigninData, requestLoginOTP);
router.post("/login/verify-otp", validateLoginOTP, signinWithOTP);
router.post("/verify-email", validateEmailOTP, verifyEmail);
router.post("/resend-verification", validateSigninData, resendVerification);

// Routes de réinitialisation de mot de passe
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/verify-reset-token", validateVerifyResetToken, verifyResetToken);
router.post("/reset-password", validateResetPassword, resetPasswordHandler);


// Routes protégées
router.use(authenticate);
router.get("/me", getMe);
router.post("/signout", signout);

export default router;
