#!/usr/bin/env node

/**
 * Script de test pour la fonctionnalité de géolocalisation
 * Vérifie l'intégration complète frontend/backend
 */

import { spawn } from 'child_process';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

console.log(`${colors.blue}🧪 Test de la fonctionnalité de géolocalisation${colors.reset}`);
console.log('='.repeat(50));

// Test 1: Vérifier la migration de la base de données
console.log(`\n${colors.yellow}1. Vérification de la migration de la base de données...${colors.reset}`);

const testDbMigration = () => {
  return new Promise((resolve, reject) => {
    const checkDb = spawn('node', ['check-table.js'], { 
      cwd: process.cwd() + '/backend',
      stdio: 'pipe' 
    });
    
    let output = '';
    checkDb.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    checkDb.on('close', (code) => {
      if (code === 0 && output.includes('✅ latitude') && output.includes('✅ longitude')) {
        console.log(`${colors.green}✅ Migration réussie - Colonnes de géolocalisation présentes${colors.reset}`);
        resolve();
      } else {
        console.log(`${colors.red}❌ Migration échouée${colors.reset}`);
        reject(new Error('Migration failed'));
      }
    });
  });
};

// Test 2: Vérifier les dépendances frontend
console.log(`\n${colors.yellow}2. Vérification des dépendances frontend...${colors.reset}`);

const testFrontendDeps = () => {
  return new Promise((resolve, reject) => {
    const checkDeps = spawn('npm', ['list', 'react-icons'], { 
      cwd: process.cwd() + '/frontend',
      stdio: 'pipe' 
    });
    
    checkDeps.on('close', (code) => {
      if (code === 0) {
        console.log(`${colors.green}✅ Dépendances frontend OK${colors.reset}`);
        resolve();
      } else {
        console.log(`${colors.red}❌ Dépendances frontend manquantes${colors.reset}`);
        reject(new Error('Frontend dependencies missing'));
      }
    });
  });
};

// Test 3: Vérifier les composants
console.log(`\n${colors.yellow}3. Vérification des composants...${colors.reset}`);

const testComponents = () => {
  const fs = require('fs');
  const path = require('path');
  
  const componentsToCheck = [
    'frontend/src/components/doctor/LocationPicker.jsx',
    'frontend/src/pages/doctor/DoctorProfile.jsx',
    'frontend/src/pages/patient/settings/EditAddress.jsx'
  ];
  
  let allExist = true;
  
  componentsToCheck.forEach(component => {
    const fullPath = path.join(process.cwd(), component);
    if (fs.existsSync(fullPath)) {
      console.log(`${colors.green}✅ ${component}${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ ${component} manquant${colors.reset}`);
      allExist = false;
    }
  });
  
  return allExist ? Promise.resolve() : Promise.reject(new Error('Components missing'));
};

// Test 4: Vérifier la configuration backend
console.log(`\n${colors.yellow}4. Vérification de la configuration backend...${colors.reset}`);

const testBackendConfig = () => {
  const fs = require('fs');
  const path = require('path');
  
  const filesToCheck = [
    'backend/src/controllers/medecin.controller.js',
    'backend/src/controllers/auth.controller.js',
    'backend/src/data/migrations/addLocationFields.js'
  ];
  
  let allExist = true;
  
  filesToCheck.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      console.log(`${colors.green}✅ ${file}${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ ${file} manquant${colors.reset}`);
      allExist = false;
    }
  });
  
  return allExist ? Promise.resolve() : Promise.reject(new Error('Backend files missing'));
};

// Exécuter tous les tests
const runTests = async () => {
  try {
    await testDbMigration();
    await testFrontendDeps();
    await testComponents();
    await testBackendConfig();
    
    console.log(`\n${colors.green}🎉 Tous les tests sont passés avec succès !${colors.reset}`);
    console.log(`\n${colors.blue}📋 Prochaines étapes :${colors.reset}`);
    console.log('1. Tester l\'inscription d\'un nouveau médecin');
    console.log('2. Tester la modification du profil médecin');
    console.log('3. Tester la page de modification d\'adresse');
    console.log('4. Vérifier la géolocalisation automatique');
    console.log('5. Tester les notifications');
    
  } catch (error) {
    console.log(`\n${colors.red}❌ Tests échoués : ${error.message}${colors.reset}`);
    process.exit(1);
  }
};

runTests();
