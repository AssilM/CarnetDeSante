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
  getActiveToken,
  cleanupExpiredTokens,
} from "./src/email/token.service.js";
import pool from "./src/config/db.js";

const testTokenSystem = async () => {
  try {
    console.log("🧪 Test du système de tokens OTP...\n");

    // 1. Test de génération d'OTP
    console.log("1️⃣ Test de génération d'OTP:");
    const otp = generateOTP();
    console.log("   ✅ OTP généré:", otp);
    console.log("   ✅ Format correct:", /^\d{6}$/.test(otp));

    // 2. Test de création d'utilisateur
    console.log("\n2️⃣ Test de création d'utilisateur:");
    const testUserData = {
      email: "test-token@example.com",
      password: "password123",
      nom: "Test",
      prenom: "Token",
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

    // 3. Test de création de token manuel
    console.log("\n3️⃣ Test de création de token manuel:");
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

    // 4. Test de vérification de token
    console.log("\n4️⃣ Test de vérification de token:");
    try {
      const isValid = await verifyAndConsumeToken(
        userId,
        "EMAIL_VERIFY",
        "123456"
      );
      console.log("   ✅ Token vérifié:", isValid);
    } catch (error) {
      console.log("   ❌ Erreur lors de la vérification:", error.message);
      return;
    }

    // 5. Test de vérification email avec OTP
    console.log("\n5️⃣ Test de vérification email:");
    try {
      const result = await verifyEmailOTP("test-token@example.com", "123456");
      console.log("   ✅ Email vérifié:", result.message);
      console.log("   ✅ User après vérification:", result.user.email_verified);
    } catch (error) {
      console.log("   ❌ Erreur lors de la vérification email:", error.message);
      console.log(
        "   💡 Le token a peut-être été consommé dans l'étape précédente"
      );
    }

    // 6. Test de connexion après vérification
    console.log("\n6️⃣ Test de connexion après vérification:");
    try {
      const authResult = await authenticateUser(
        "test-token@example.com",
        "password123"
      );
      console.log("   ✅ Connexion réussie!");
      console.log("   ✅ Token présent:", !!authResult.accessToken);
    } catch (error) {
      console.log("   ❌ Erreur lors de la connexion:", error.message);
    }

    // 7. Test d'envoi OTP pour connexion
    console.log("\n7️⃣ Test d'envoi OTP pour connexion:");
    try {
      const otpResult = await sendLoginOTP("test-token@example.com");
      console.log("   ✅ OTP envoyé:", otpResult.message);
    } catch (error) {
      console.log("   ❌ Erreur lors de l'envoi OTP:", error.message);
    }

    // 8. Test de nettoyage des tokens expirés
    console.log("\n8️⃣ Test de nettoyage des tokens expirés:");
    try {
      const cleanedCount = await cleanupExpiredTokens();
      console.log("   ✅ Tokens nettoyés:", cleanedCount);
    } catch (error) {
      console.log("   ❌ Erreur lors du nettoyage:", error.message);
    }

    console.log("\n✅ Test du système de tokens terminé!");
  } catch (error) {
    console.error("❌ Erreur lors du test:", error.message);
  } finally {
    await pool.end();
  }
};

testTokenSystem();
