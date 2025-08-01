// Export des fonctions principales du module email
export {
  emailTransporter,
  emailConfig,
  testEmailConnection,
} from "./email.config.js";
export {
  sendEmail,
  sendTestEmail,
  sendTemplateEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendOTPEmail,
  getUserEmailById,
} from "./email.service.js";
export { renderTemplate, testTemplate } from "./email.templates.js";
export {
  generateOTP,
  createToken,
  verifyAndConsumeToken,
  verifyToken,
  deleteToken,
  cleanupExpiredTokens,
  getActiveToken,
  hashToken,
} from "./token.service.js";
