import { describe, it, expect } from 'vitest'
import {
  isValidEmail,
  isValidPhoneNumber,
  isValidPostalCode,
  validatePassword,
  isValidBirthDate,
  isValidBloodType,
  validateBodyMeasurements,
  formatPhoneNumber,
  isNotEmpty,
  isValidLength
} from '../../src/utils/validation.utils.js'

describe('validation.utils', () => {
  describe('isValidEmail', () => {
    it('valide les emails corrects', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true)
      expect(isValidEmail('simple@test.fr')).toBe(true)
    })

    it('rejette les emails invalides', () => {
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('test.domain.com')).toBe(false)
      expect(isValidEmail('test@domain')).toBe(false)
    })
  })

  describe('isValidPhoneNumber', () => {
    it('valide les numéros français corrects', () => {
      expect(isValidPhoneNumber('0123456789')).toBe(true)
      expect(isValidPhoneNumber('0612345678')).toBe(true)
      expect(isValidPhoneNumber('01 23 45 67 89')).toBe(true) // avec espaces
    })

    it('rejette les numéros invalides', () => {
      expect(isValidPhoneNumber('1234567890')).toBe(false) // ne commence pas par 0
      expect(isValidPhoneNumber('0023456789')).toBe(false) // 00 interdit
      expect(isValidPhoneNumber('012345678')).toBe(false)  // trop court
      expect(isValidPhoneNumber('01234567890')).toBe(false) // trop long
      expect(isValidPhoneNumber('abcdefghij')).toBe(false) // lettres
    })
  })

  describe('isValidPostalCode', () => {
    it('valide les codes postaux français', () => {
      expect(isValidPostalCode('75001')).toBe(true)
      expect(isValidPostalCode('13000')).toBe(true)
      expect(isValidPostalCode('69000')).toBe(true)
    })

    it('rejette les codes postaux invalides', () => {
      expect(isValidPostalCode('7500')).toBe(false)   // trop court
      expect(isValidPostalCode('750001')).toBe(false) // trop long
      expect(isValidPostalCode('abcde')).toBe(false)  // lettres
      expect(isValidPostalCode('')).toBe(false)       // vide
    })
  })

  describe('validatePassword', () => {
    it('valide un mot de passe fort', () => {
      const result = validatePassword('MonMotDePasse123!')
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('rejette un mot de passe trop court', () => {
      const result = validatePassword('Aa1!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Le mot de passe doit contenir au moins 8 caractères')
    })

    it('rejette un mot de passe sans minuscule', () => {
      const result = validatePassword('MOTDEPASSE123!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Le mot de passe doit contenir au moins une lettre minuscule')
    })

    it('rejette un mot de passe sans majuscule', () => {
      const result = validatePassword('motdepasse123!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Le mot de passe doit contenir au moins une lettre majuscule')
    })

    it('rejette un mot de passe sans chiffre', () => {
      const result = validatePassword('MotDePasse!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Le mot de passe doit contenir au moins un chiffre')
    })

    it('rejette un mot de passe sans caractère spécial', () => {
      const result = validatePassword('MotDePasse123')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Le mot de passe doit contenir au moins un caractère spécial')
    })

    it('cumule plusieurs erreurs', () => {
      const result = validatePassword('abc')
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })

  describe('isValidBirthDate', () => {
    it('valide une date de naissance réaliste', () => {
      const date20ans = new Date()
      date20ans.setFullYear(date20ans.getFullYear() - 20)
      const dateStr = date20ans.toISOString().split('T')[0]
      
      expect(isValidBirthDate(dateStr)).toBe(true)
      expect(isValidBirthDate('1990-05-15')).toBe(true)
    })

    it('rejette une date future', () => {
      const dateFuture = new Date()
      dateFuture.setFullYear(dateFuture.getFullYear() + 1)
      const dateStr = dateFuture.toISOString().split('T')[0]
      
      expect(isValidBirthDate(dateStr)).toBe(false)
    })

    it('rejette une date trop ancienne (>120 ans)', () => {
      const dateAncienne = new Date()
      dateAncienne.setFullYear(dateAncienne.getFullYear() - 125)
      const dateStr = dateAncienne.toISOString().split('T')[0]
      
      expect(isValidBirthDate(dateStr)).toBe(false)
    })
  })

  describe('isValidBloodType', () => {
    it('valide tous les groupes sanguins', () => {
      const validTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
      validTypes.forEach(type => {
        expect(isValidBloodType(type)).toBe(true)
      })
    })

    it('rejette les groupes invalides', () => {
      expect(isValidBloodType('C+')).toBe(false)
      expect(isValidBloodType('a+')).toBe(false) // casse
      expect(isValidBloodType('AB')).toBe(false)  // sans +/-
      expect(isValidBloodType('')).toBe(false)
    })
  })

  describe('validateBodyMeasurements', () => {
    it('valide des mesures correctes', () => {
      const result = validateBodyMeasurements(175, 70)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('rejette une taille invalide', () => {
      const result = validateBodyMeasurements(300, 70)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('La taille doit être comprise entre 50 et 250 cm')
    })

    it('rejette un poids invalide', () => {
      const result = validateBodyMeasurements(175, 600)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Le poids doit être compris entre 1 et 500 kg')
    })

    it('accepte des valeurs nulles/undefined', () => {
      const result1 = validateBodyMeasurements(null, 70)
      const result2 = validateBodyMeasurements(175, null)
      expect(result1.isValid).toBe(true)
      expect(result2.isValid).toBe(true)
    })
  })

  describe('formatPhoneNumber', () => {
    it('nettoie les espaces et caractères spéciaux', () => {
      expect(formatPhoneNumber('01 23 45 67 89')).toBe('0123456789')
      expect(formatPhoneNumber('01-23-45-67-89')).toBe('0123456789')
      expect(formatPhoneNumber('01.23.45.67.89')).toBe('0123456789')
    })

    it('garde uniquement les chiffres', () => {
      expect(formatPhoneNumber('abc01def23ghi456jkl789')).toBe('0123456789')
    })
  })

  describe('isNotEmpty', () => {
    it('valide les chaînes non vides', () => {
      expect(isNotEmpty('test')).toBe(true)
      expect(isNotEmpty('  test  ')).toBe(true) // trim appliqué
    })

    it('rejette les chaînes vides ou null/undefined', () => {
      expect(isNotEmpty('')).toBe(false)
      expect(isNotEmpty('   ')).toBe(false) // que des espaces
      expect(isNotEmpty(null)).toBe(false)
      expect(isNotEmpty(undefined)).toBe(false)
      expect(isNotEmpty(123)).toBe(false) // pas une string
    })
  })

  describe('isValidLength', () => {
    it('valide la longueur dans les bornes', () => {
      expect(isValidLength('test', 2, 10)).toBe(true)
      expect(isValidLength('ab', 2, 2)).toBe(true) // exact
    })

    it('rejette si trop court ou long', () => {
      expect(isValidLength('a', 2, 10)).toBe(false) // trop court
      expect(isValidLength('abcdefghijk', 2, 10)).toBe(false) // trop long
    })

    it('gère les valeurs par défaut', () => {
      expect(isValidLength('test')).toBe(true) // min=0, max=Infinity
      expect(isValidLength('', 1)).toBe(false) // min=1, max=Infinity
    })

    it('rejette les non-strings', () => {
      expect(isValidLength(123, 1, 5)).toBe(false)
      expect(isValidLength(null, 1, 5)).toBe(false)
    })
  })
})
