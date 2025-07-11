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
    const checkQuery = "SELECT COUNT(*) as count FROM utilisateur";
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
        tel_indicatif: "+33",
        tel_numero: "601020304",
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
        tel_indicatif: "+33",
        tel_numero: "602030405",
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
        tel_indicatif: "+33",
        tel_numero: "701020304",
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
        tel_indicatif: "+33",
        tel_numero: "702030405",
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
        tel_indicatif: "+33",
        tel_numero: "600000000",
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
        INSERT INTO utilisateur (
          email, password, nom, prenom, tel_indicatif, tel_numero, date_naissance, sexe, 
          adresse, code_postal, ville, role
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `;

      const result = await pool.query(insertQuery, [
        user.email,
        user.password,
        user.nom,
        user.prenom,
        user.tel_indicatif,
        user.tel_numero,
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
      INSERT INTO patient (utilisateur_id, groupe_sanguin, taille, poids)
      VALUES ($1, $2, $3, $4)
    `;

    await pool.query(insertQuery, [userId, groupeSanguin, taille, poids]);

    return userId;
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
      INSERT INTO medecin (utilisateur_id, specialite, description)
      VALUES ($1, $2, $3)
    `;

    await pool.query(insertQuery, [userId, specialite, description]);

    // Créer des disponibilités pour ce médecin
    await createMedecinDisponibilites(userId);

    return userId;
  } catch (error) {
    console.error("Erreur lors de la création du profil médecin:", error);
    throw error;
  }
};

// Création de profils administrateurs
const createAdminProfile = async (userId) => {
  try {
    const insertQuery = `
      INSERT INTO administrateur (utilisateur_id, niveau_acces)
      VALUES ($1, $2)
    `;

    await pool.query(insertQuery, [userId, "super-admin"]);
    return userId;
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
        jour: jour,
        heure_debut: "08:00",
        heure_fin: "12:00",
      });

      // Après-midi (14h-18h)
      disponibilites.push({
        medecin_id: medecinId,
        jour: jour,
        heure_debut: "14:00",
        heure_fin: "18:00",
      });
    }

    // Insérer les disponibilités
    for (const dispo of disponibilites) {
      const insertQuery = `
        INSERT INTO disponibilite_medecin (medecin_id, jour, heure_debut, heure_fin)
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

// Création de rendez-vous de test
const createTestRendezVous = async () => {
  try {
    // Récupérer tous les patients
    const patientsQuery = "SELECT utilisateur_id FROM patient";
    const patientsResult = await pool.query(patientsQuery);
    const patients = patientsResult.rows;

    // Récupérer tous les médecins
    const medecinsQuery = "SELECT utilisateur_id FROM medecin";
    const medecinsResult = await pool.query(medecinsQuery);
    const medecins = medecinsResult.rows;

    // Si pas de patients ou de médecins, sortir
    if (patients.length === 0 || medecins.length === 0) {
      console.log("Pas de patients ou de médecins pour créer des rendez-vous");
      return;
    }

    // Créer quelques rendez-vous
    const today = new Date();
    const statuts = ["planifié", "confirmé", "annulé", "terminé"];

    for (let i = 0; i < 5; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const medecin = medecins[Math.floor(Math.random() * medecins.length)];

      // Date dans les 30 prochains jours
      const date = new Date(
        today.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000
      );
      const dateStr = date.toISOString().split("T")[0];

      // Heure entre 8h et 18h
      const hour = Math.floor(Math.random() * 10) + 8;
      const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
      const heure = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;

      const duree = [15, 30, 45, 60][Math.floor(Math.random() * 4)];
      const statut = statuts[Math.floor(Math.random() * statuts.length)];
      const motif = "Consultation de routine";
      const adresse = "Cabinet médical";

      const insertQuery = `
        INSERT INTO rendez_vous (
          patient_id, medecin_id, date, heure, duree, statut, motif, adresse
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      await pool.query(insertQuery, [
        patient.utilisateur_id,
        medecin.utilisateur_id,
        dateStr,
        heure,
        duree,
        statut,
        motif,
        adresse,
      ]);
    }

    console.log("Rendez-vous de test créés avec succès");
  } catch (error) {
    console.error("Erreur lors de la création des rendez-vous de test:", error);
    throw error;
  }
};

// Fonction pour initialiser la base de données avec des données de test
const seedDatabase = async () => {
  try {
    await createTestUsers();
    await createTestRendezVous();
    console.log("Base de données initialisée avec succès");
  } catch (error) {
    console.error(
      "Erreur lors de l'initialisation de la base de données:",
      error
    );
  }
};

export default seedDatabase;
