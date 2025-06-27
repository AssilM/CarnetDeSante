import pool from "../config/db.js";
import bcrypt from "bcrypt";

// Fonction pour crypter un mot de passe
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Création d'utilisateurs de test
const createTestUsers = async () => {
  try {
    // Vérifier si des utilisateurs existent déjà
    const checkQuery = "SELECT COUNT(*) as count FROM utilisateurs";
    const checkResult = await pool.query(checkQuery);

    if (checkResult.rows[0].count > 0) {
      console.log(
        "Des utilisateurs existent déjà, aucune donnée de test n'a été créée."
      );
      return;
    }

    // Hachage des mots de passe
    const password = await hashPassword("password123");

    // Créer des utilisateurs
    const users = [
      // Patients
      {
        email: "patient1@example.com",
        password,
        nom: "Dupont",
        prenom: "Jean",
        tel: "0601020304",
        date_naissance: "1980-01-15",
        sexe: "homme",
        adresse: "123 Rue du Patient",
        code_postal: "75001",
        ville: "Paris",
        role: "patient",
      },
      {
        email: "patient2@example.com",
        password,
        nom: "Martin",
        prenom: "Sophie",
        tel: "0602030405",
        date_naissance: "1990-05-20",
        sexe: "femme",
        adresse: "456 Avenue du Patient",
        code_postal: "75002",
        ville: "Paris",
        role: "patient",
      },
      // Médecins
      {
        email: "medecin1@example.com",
        password,
        nom: "Dubois",
        prenom: "Pierre",
        tel: "0701020304",
        date_naissance: "1975-03-10",
        sexe: "homme",
        adresse: "789 Boulevard du Médecin",
        code_postal: "75003",
        ville: "Paris",
        role: "medecin",
      },
      {
        email: "medecin2@example.com",
        password,
        nom: "Lefebvre",
        prenom: "Marie",
        tel: "0702030405",
        date_naissance: "1982-07-22",
        sexe: "femme",
        adresse: "101 Rue du Cabinet",
        code_postal: "75004",
        ville: "Paris",
        role: "medecin",
      },
      // Admin
      {
        email: "admin@example.com",
        password,
        nom: "Admin",
        prenom: "Super",
        tel: "0600000000",
        date_naissance: "1985-12-25",
        sexe: "homme",
        adresse: "1 Place de l'Admin",
        code_postal: "75005",
        ville: "Paris",
        role: "admin",
      },
    ];

    // Insérer les utilisateurs dans la base de données
    for (const user of users) {
      const insertQuery = `
        INSERT INTO utilisateurs (
          email, password, nom, prenom, tel, date_naissance, sexe, 
          adresse, code_postal, ville, role
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `;

      const result = await pool.query(insertQuery, [
        user.email,
        user.password,
        user.nom,
        user.prenom,
        user.tel,
        user.date_naissance,
        user.sexe,
        user.adresse,
        user.code_postal,
        user.ville,
        user.role,
      ]);

      const userId = result.rows[0].id;

      // Créer un profil patient si c'est un patient
      if (user.role === "patient") {
        await createPatientProfile(userId);
      }

      // Créer un profil médecin si c'est un médecin
      if (user.role === "medecin") {
        await createMedecinProfile(userId);
      }

      // Créer un profil admin si c'est un admin
      if (user.role === "admin") {
        await createAdminProfile(userId);
      }
    }

    console.log("Données de test créées avec succès.");
  } catch (error) {
    console.error("Erreur lors de la création des données de test:", error);
    throw error;
  }
};

// Création de profils patients
const createPatientProfile = async (userId) => {
  try {
    const groupeSanguin = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"][
      Math.floor(Math.random() * 8)
    ];
    const taille = Math.floor(Math.random() * 50) + 150; // Taille entre 150 et 200 cm
    const poids = Math.floor(Math.random() * 50) + 50; // Poids entre 50 et 100 kg

    const insertQuery = `
      INSERT INTO patients (utilisateur_id, groupe_sanguin, taille, poids)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;

    const result = await pool.query(insertQuery, [
      userId,
      groupeSanguin,
      taille,
      poids,
    ]);
    return result.rows[0].id;
  } catch (error) {
    console.error("Erreur lors de la création du profil patient:", error);
    throw error;
  }
};

// Création de profils médecins
const createMedecinProfile = async (userId) => {
  try {
    // Choisir aléatoirement une spécialité
    const specialites = [
      "Médecin généraliste",
      "Cardiologue",
      "Dermatologue",
      "Pédiatre",
      "Psychiatre",
    ];
    const specialite =
      specialites[Math.floor(Math.random() * specialites.length)];
    const description = `${specialite} expérimenté avec plusieurs années de pratique.`;

    const insertQuery = `
      INSERT INTO medecins (utilisateur_id, specialite, description)
      VALUES ($1, $2, $3)
      RETURNING id
    `;

    const result = await pool.query(insertQuery, [
      userId,
      specialite,
      description,
    ]);
    const medecinId = result.rows[0].id;

    // Créer des disponibilités pour ce médecin
    await createMedecinDisponibilites(medecinId);

    return medecinId;
  } catch (error) {
    console.error("Erreur lors de la création du profil médecin:", error);
    throw error;
  }
};

// Création de profils administrateurs
const createAdminProfile = async (userId) => {
  try {
    const insertQuery = `
      INSERT INTO administrateurs (utilisateur_id, niveau_acces)
      VALUES ($1, $2)
      RETURNING id
    `;

    const result = await pool.query(insertQuery, [userId, "super-admin"]);
    return result.rows[0].id;
  } catch (error) {
    console.error(
      "Erreur lors de la création du profil administrateur:",
      error
    );
    throw error;
  }
};

// Création de disponibilités pour les médecins
const createMedecinDisponibilites = async (medecinId) => {
  try {
    const jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"];
    const disponibilites = [];

    // Générer des disponibilités pour chaque jour ouvrable
    for (const jour of jours) {
      // Matin (8h-12h)
      disponibilites.push({
        medecin_id: medecinId,
        jour,
        heure_debut: "08:00:00",
        heure_fin: "12:00:00",
      });

      // Après-midi (14h-18h)
      disponibilites.push({
        medecin_id: medecinId,
        jour,
        heure_debut: "14:00:00",
        heure_fin: "18:00:00",
      });
    }

    // Insérer les disponibilités dans la base de données
    for (const dispo of disponibilites) {
      const insertQuery = `
        INSERT INTO disponibilites_medecin (medecin_id, jour, heure_debut, heure_fin)
        VALUES ($1, $2, $3, $4)
      `;

      await pool.query(insertQuery, [
        dispo.medecin_id,
        dispo.jour,
        dispo.heure_debut,
        dispo.heure_fin,
      ]);
    }
  } catch (error) {
    console.error(
      "Erreur lors de la création des disponibilités du médecin:",
      error
    );
    throw error;
  }
};

// Exécution du script de génération des données de test
const seedDatabase = async () => {
  try {
    await createTestUsers();
  } catch (error) {
    console.error("Erreur lors de la génération des données de test:", error);
  }
};

export default seedDatabase;
