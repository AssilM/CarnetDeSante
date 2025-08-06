import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Service de gestion des templates Handlebars
 * Compile et rend les templates HTML avec des données dynamiques
 */

/**
 * Lit un template HTML depuis le dossier templates
 * @param {string} templateName - Nom du template (sans .html)
 * @returns {string} Contenu du template
 */
const readTemplate = (templateName) => {
  try {
    const templatePath = path.join(
      __dirname,
      "templates",
      `${templateName}.html`
    );
    return fs.readFileSync(templatePath, "utf8");
  } catch (error) {
    console.error(
      `Erreur lors de la lecture du template ${templateName}:`,
      error.message
    );
    throw new Error(`Template ${templateName} non trouvé`);
  }
};

/**
 * Compile et rend un template avec des données
 * @param {string} templateName - Nom du template
 * @param {Object} data - Données à injecter dans le template
 * @returns {string} HTML rendu
 */
export const renderTemplate = async (templateName, data) => {
  try {
    // Lire le template
    const templateContent = readTemplate(templateName);

    // Compiler avec Handlebars
    const template = Handlebars.compile(templateContent);

    // Rendre avec les données
    const html = template(data);

    return html;
  } catch (error) {
    console.error(
      `Erreur lors du rendu du template ${templateName}:`,
      error.message
    );
    throw error;
  }
};

/**
 * Test de rendu d'un template
 * @param {string} templateName - Nom du template à tester
 * @param {Object} testData - Données de test
 */
export const testTemplate = async (templateName, testData) => {
  try {
    const html = await renderTemplate(templateName, testData);
    console.log(`✅ Template ${templateName} rendu avec succès`);
    console.log("HTML généré:", html.substring(0, 200) + "...");
    return html;
  } catch (error) {
    console.error(
      `❌ Erreur lors du test du template ${templateName}:`,
      error.message
    );
    throw error;
  }
};
