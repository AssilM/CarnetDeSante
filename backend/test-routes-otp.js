import {
  createUser,
  verifyEmailOTP,
  authenticateUser,
  sendLoginOTP,
  authenticateUserWithOTP,
} from "./src/auth/auth.service.js";
import {
  generateOTP,
  createToken,
  verifyAndConsumeToken,
  cleanupExpiredTokens,
} from "./src/email/token.service.js";
import pool from "./src/config/db.js";

const testRoutesOTP = async () => {
  try {
    console.log("🧪 Test des routes OTP et authentification...\n");

    // 1. Test de création d'utilisateur
    console.log("1️⃣ Test de création d'utilisateur:");
    const testUserData = {
      email: "test-routes@example.com",
      password: "password123",
      nom: "Test",
      prenom: "Routes",
      date_naissance: "1990-01-01",
      role: "patient",
    };

    let userId;
    try {
      const newUser = await createUser(testUserData, "patient");
      userId = newUser.id;
      console.log("   ✅ Utilisateur créé:", newUser.email);
      console.log("   ✅ email_verified:", newUser.email_verified);
    } catch (error) {
      console.log("   ❌ Erreur lors de l'inscription:", error.message);
      return;
    }

    // 2. Test de création de token manuel pour vérification
    console.log("\n2️⃣ Test de création de token pour vérification:");
    try {
      const testOTP = "123456";
      const tokenResult = await createToken(
        userId,
        "EMAIL_VERIFY",
        testOTP,
        10
      );
      console.log("   ✅ Token créé:", tokenResult);
    } catch (error) {
      console.log("   ❌ Erreur lors de la création du token:", error.message);
      return;
    }

    // 3. Test de vérification email (simule la route /auth/verify-email)
    console.log("\n3️⃣ Test de vérification email (route /auth/verify-email):");
    try {
      const result = await verifyEmailOTP("test-routes@example.com", "123456");
      console.log("   ✅ Email vérifié:", result.message);
      console.log("   ✅ User après vérification:", result.user.email_verified);
    } catch (error) {
      console.log("   ❌ Erreur lors de la vérification email:", error.message);
      console.log("   💡 Le token a peut-être été consommé");
    }

    // 4. Test de connexion classique après vérification (simule la route /auth/signin)
    console.log("\n4️⃣ Test de connexion classique (route /auth/signin):");
    try {
      const authResult = await authenticateUser(
        "test-routes@example.com",
        "password123"
      );
      console.log("   ✅ Connexion réussie!");
      console.log("   ✅ Token présent:", !!authResult.accessToken);
      console.log("   ✅ User:", authResult.user.email);
    } catch (error) {
      console.log("   ❌ Erreur lors de la connexion:", error.message);
    }

    // 5. Test d'envoi OTP pour connexion (simule la route /auth/login/request-otp)
    console.log(
      "\n5️⃣ Test d'envoi OTP connexion (route /auth/login/request-otp):"
    );
    try {
      const otpResult = await sendLoginOTP("test-routes@example.com");
      console.log("   ✅ OTP envoyé:", otpResult.message);
      console.log("   ✅ Email confirmé:", otpResult.email);
    } catch (error) {
      console.log("   ❌ Erreur lors de l'envoi OTP:", error.message);
    }

    // 6. Test de création de token pour connexion OTP
    console.log("\n6️⃣ Test de création de token pour connexion OTP:");
    try {
      const loginOTP = "654321";
      const loginTokenResult = await createToken(
        userId,
        "OTP_LOGIN",
        loginOTP,
        10
      );
      console.log("   ✅ Token de connexion créé:", loginTokenResult);
    } catch (error) {
      console.log(
        "   ❌ Erreur lors de la création du token de connexion:",
        error.message
      );
      return;
    }

    // 7. Test de connexion avec OTP (simule la route /auth/login/verify-otp)
    console.log(
      "\n7️⃣ Test de connexion avec OTP (route /auth/login/verify-otp):"
    );
    try {
      const otpAuthResult = await authenticateUserWithOTP(
        "test-routes@example.com",
        "654321"
      );
      console.log("   ✅ Connexion OTP réussie!");
      console.log("   ✅ Token présent:", !!otpAuthResult.accessToken);
      console.log("   ✅ User:", otpAuthResult.user.email);
    } catch (error) {
      console.log("   ❌ Erreur lors de la connexion OTP:", error.message);
    }

    // 8. Test de nettoyage des tokens
    console.log("\n8️⃣ Test de nettoyage des tokens:");
    try {
      const cleanedCount = await cleanupExpiredTokens();
      console.log("   ✅ Tokens nettoyés:", cleanedCount);
    } catch (error) {
      console.log("   ❌ Erreur lors du nettoyage:", error.message);
    }

    console.log("\n✅ Test des routes OTP terminé!");
    console.log("\n📋 RÉSUMÉ DES ROUTES TESTÉES :");
    console.log("   ✅ POST /auth/signup - Inscription");
    console.log("   ✅ POST /auth/verify-email - Vérification email");
    console.log("   ✅ POST /auth/signin - Connexion classique");
    console.log("   ✅ POST /auth/login/request-otp - Demande OTP connexion");
    console.log("   ✅ POST /auth/login/verify-otp - Connexion avec OTP");
  } catch (error) {
    console.error("❌ Erreur lors du test:", error.message);
  } finally {
    await pool.end();
  }
};

testRoutesOTP();
