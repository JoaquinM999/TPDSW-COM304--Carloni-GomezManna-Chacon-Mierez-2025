/**
 * Tests Unitarios para validation.service.ts - Fase 5.2
 * Coverage target: 90%+
 * Tests: 14 funciones de validación Backend
 */

import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateISBN,
  validateRating,
  sanitizeInput,
  parseNumericId,
  validateExternalId,
  validatePagination,
  validateTextLength,
  validateURL,
  validateUsername,
  validateYear,
  validateUserRole,
  validateResenaEstado
} from '../../services/validation.service';

describe('unit - validation.service.ts', () => {
  
  // ========== validateEmail ==========
  describe('validateEmail()', () => {
    it('debe validar emails correctos', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(validateEmail('valid_email@test.com')).toBe(true);
    });

    it('debe rechazar emails inválidos', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@invalid.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });

    it('debe manejar null/undefined', () => {
      expect(validateEmail(null as any)).toBe(false);
      expect(validateEmail(undefined as any)).toBe(false);
    });

    it('debe trimear espacios', () => {
      expect(validateEmail('  test@example.com  ')).toBe(true);
    });
  });

  // ========== validatePassword ==========
  describe('validatePassword()', () => {
    it('debe validar contraseñas válidas (8+ chars, mayúscula, minúscula, número)', () => {
      const result = validatePassword('Password123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('debe rechazar contraseñas cortas', () => {
      const result = validatePassword('Short1');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('La contraseña debe tener al menos 8 caracteres');
    });

    it('debe rechazar contraseñas sin mayúsculas', () => {
      const result = validatePassword('password123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('La contraseña debe contener al menos una mayúscula');
    });

    it('debe rechazar contraseñas sin minúsculas', () => {
      const result = validatePassword('PASSWORD123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('La contraseña debe contener al menos una minúscula');
    });

    it('debe rechazar contraseñas sin números', () => {
      const result = validatePassword('PasswordOnly');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('La contraseña debe contener al menos un número');
    });

    it('debe acumular múltiples errores', () => {
      const result = validatePassword('short');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('debe manejar null/undefined', () => {
      const result = validatePassword(null as any);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('La contraseña es requerida');
    });
  });

  // ========== validateISBN ==========
  describe('validateISBN()', () => {
    it('debe validar ISBN-10', () => {
      expect(validateISBN('0-306-40615-2')).toBe(true);
      expect(validateISBN('0306406152')).toBe(true);
    });

    it('debe validar ISBN-13', () => {
      expect(validateISBN('978-0-306-40615-7')).toBe(true);
      expect(validateISBN('9780306406157')).toBe(true);
      expect(validateISBN('978 0 306 40615 7')).toBe(true);
    });

    it('debe rechazar ISBNs inválidos', () => {
      expect(validateISBN('123')).toBe(false);
      expect(validateISBN('invalid')).toBe(false);
      expect(validateISBN('')).toBe(false);
    });

    it('debe manejar null/undefined', () => {
      expect(validateISBN(null as any)).toBe(false);
      expect(validateISBN(undefined as any)).toBe(false);
    });
  });

  // ========== validateRating ==========
  describe('validateRating()', () => {
    it('debe validar ratings 1-5', () => {
      expect(validateRating(1)).toBe(true);
      expect(validateRating(3)).toBe(true);
      expect(validateRating(5)).toBe(true);
    });

    it('debe aceptar strings numéricos', () => {
      expect(validateRating('2')).toBe(true);
      expect(validateRating('4')).toBe(true);
    });

    it('debe rechazar ratings fuera de rango', () => {
      expect(validateRating(0)).toBe(false);
      expect(validateRating(6)).toBe(false);
      expect(validateRating(3.5)).toBe(false);
    });

    it('debe rechazar valores inválidos', () => {
      expect(validateRating('invalid')).toBe(false);
      expect(validateRating(null)).toBe(false);
      expect(validateRating(NaN)).toBe(false);
    });
  });

  // ========== sanitizeInput ==========
  describe('sanitizeInput()', () => {
    it('debe remover scripts XSS', () => {
      const result = sanitizeInput('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
    });

    it('debe remover tags HTML', () => {
      expect(sanitizeInput('<b>Bold</b> text')).toBe('Bold text');
      expect(sanitizeInput('<div><p>Test</p></div>')).toBe('Test');
    });

    it('debe trimear espacios', () => {
      expect(sanitizeInput('  text  ')).toBe('text');
    });

    it('debe dejar texto normal sin cambios', () => {
      expect(sanitizeInput('Normal text')).toBe('Normal text');
    });

    it('debe manejar null/undefined', () => {
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
    });
  });

  // ========== parseNumericId ==========
  describe('parseNumericId()', () => {
    it('debe parsear IDs válidos', () => {
      expect(parseNumericId(1)).toBe(1);
      expect(parseNumericId('42')).toBe(42);
      expect(parseNumericId(100)).toBe(100);
    });

    it('debe rechazar IDs inválidos', () => {
      expect(parseNumericId(0)).toBe(null);
      expect(parseNumericId(-1)).toBe(null);
      expect(parseNumericId(3.14)).toBe(null);
      expect(parseNumericId('invalid')).toBe(null);
    });

    it('debe manejar null/undefined', () => {
      expect(parseNumericId(null)).toBe(null);
      expect(parseNumericId(undefined)).toBe(null);
    });
  });

  // ========== validateExternalId ==========
  describe('validateExternalId()', () => {
    it('debe validar IDs externos alfanuméricos', () => {
      expect(validateExternalId('abc123')).toBe(true);
      expect(validateExternalId('external-id')).toBe(true);
      expect(validateExternalId('external_id')).toBe(true);
    });

    it('debe rechazar IDs con caracteres especiales', () => {
      expect(validateExternalId('id with spaces')).toBe(false);
      expect(validateExternalId('id@special')).toBe(false);
    });

    it('debe rechazar IDs muy largos (>100)', () => {
      expect(validateExternalId('a'.repeat(101))).toBe(false);
      expect(validateExternalId('a'.repeat(100))).toBe(true);
    });

    it('debe manejar null/undefined/vacío', () => {
      expect(validateExternalId(null)).toBe(false);
      expect(validateExternalId('')).toBe(false);
    });
  });

  // ========== validatePagination ==========
  describe('validatePagination()', () => {
    it('debe validar paginación correcta', () => {
      const result = validatePagination(2, 20);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
    });

    it('debe usar defaults para valores inválidos', () => {
      const result = validatePagination('invalid', 'invalid');
      expect(result.page).toBe(1);
      expect(result.limit).toBe(12);
    });

    it('debe corregir páginas negativas', () => {
      expect(validatePagination(-1, 10).page).toBe(1);
      expect(validatePagination(0, 10).page).toBe(1);
    });

    it('debe corregir límites fuera de rango', () => {
      expect(validatePagination(1, 0).limit).toBe(12);
      expect(validatePagination(1, 150).limit).toBe(12);
      expect(validatePagination(1, 50).limit).toBe(50);
    });
  });

  // ========== validateTextLength ==========
  describe('validateTextLength()', () => {
    it('debe validar textos dentro del rango', () => {
      const result = validateTextLength('Test text', 5, 100);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('debe rechazar textos muy cortos', () => {
      const result = validateTextLength('Hi', 5, 100);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('al menos 5 caracteres');
    });

    it('debe rechazar textos muy largos', () => {
      const result = validateTextLength('a'.repeat(101), 0, 100);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('no puede exceder 100 caracteres');
    });

    it('debe trimear antes de validar', () => {
      expect(validateTextLength('  test  ', 1, 10).valid).toBe(true);
    });

    it('debe usar defaults (0-5000)', () => {
      expect(validateTextLength('Test').valid).toBe(true);
    });

    it('debe manejar null/undefined', () => {
      expect(validateTextLength(null as any).valid).toBe(false);
      expect(validateTextLength(undefined as any).valid).toBe(false);
    });
  });

  // ========== validateURL ==========
  describe('validateURL()', () => {
    it('debe validar URLs válidas', () => {
      expect(validateURL('https://example.com')).toBe(true);
      expect(validateURL('http://test.com/path?query=1')).toBe(true);
      expect(validateURL('ftp://files.example.com')).toBe(true);
    });

    it('debe rechazar URLs inválidas', () => {
      expect(validateURL('invalid')).toBe(false);
      expect(validateURL('not-a-url')).toBe(false);
      expect(validateURL('')).toBe(false);
    });

    it('debe manejar null/undefined', () => {
      expect(validateURL(null as any)).toBe(false);
      expect(validateURL(undefined as any)).toBe(false);
    });
  });

  // ========== validateUsername ==========
  describe('validateUsername()', () => {
    it('debe validar usernames válidos (3-20 chars)', () => {
      expect(validateUsername('john_doe').valid).toBe(true);
      expect(validateUsername('user123').valid).toBe(true);
      expect(validateUsername('test-user').valid).toBe(true);
    });

    it('debe rechazar usernames muy cortos', () => {
      const result = validateUsername('ab');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('al menos 3 caracteres');
    });

    it('debe rechazar usernames muy largos', () => {
      const result = validateUsername('a'.repeat(21));
      expect(result.valid).toBe(false);
      expect(result.error).toContain('no puede exceder 20 caracteres');
    });

    it('debe rechazar caracteres especiales', () => {
      expect(validateUsername('user@name').valid).toBe(false);
      expect(validateUsername('user name').valid).toBe(false);
    });

    it('debe trimear antes de validar', () => {
      expect(validateUsername('  username  ').valid).toBe(true);
    });
  });

  // ========== validateYear ==========
  describe('validateYear()', () => {
    it('debe validar años válidos', () => {
      expect(validateYear(2024)).toBe(true);
      expect(validateYear(2000)).toBe(true);
      expect(validateYear('2020')).toBe(true);
    });

    it('debe aceptar año siguiente', () => {
      const nextYear = new Date().getFullYear() + 1;
      expect(validateYear(nextYear)).toBe(true);
    });

    it('debe rechazar años muy antiguos', () => {
      expect(validateYear(999)).toBe(false);
      expect(validateYear(500)).toBe(false);
    });

    it('debe rechazar años muy futuros', () => {
      const farFuture = new Date().getFullYear() + 10;
      expect(validateYear(farFuture)).toBe(false);
    });

    it('debe rechazar valores inválidos', () => {
      expect(validateYear('invalid')).toBe(false);
      expect(validateYear(null)).toBe(false);
    });
  });

  // ========== validateUserRole ==========
  describe('validateUserRole()', () => {
    it('debe validar roles válidos', () => {
      expect(validateUserRole('usuario')).toBe(true);
      expect(validateUserRole('moderador')).toBe(true);
      expect(validateUserRole('admin')).toBe(true);
    });

    it('debe rechazar roles inválidos', () => {
      expect(validateUserRole('superadmin')).toBe(false);
      expect(validateUserRole('user')).toBe(false);
    });

    it('debe ser case-sensitive', () => {
      expect(validateUserRole('ADMIN')).toBe(false);
      expect(validateUserRole('Usuario')).toBe(false);
    });
  });

  // ========== validateResenaEstado ==========
  describe('validateResenaEstado()', () => {
    it('debe validar estados válidos', () => {
      expect(validateResenaEstado('aprobada')).toBe(true);
      expect(validateResenaEstado('pendiente')).toBe(true);
      expect(validateResenaEstado('rechazada')).toBe(true);
      expect(validateResenaEstado('flagged')).toBe(true);
    });

    it('debe rechazar estados inválidos', () => {
      expect(validateResenaEstado('approved')).toBe(false);
      expect(validateResenaEstado('deleted')).toBe(false);
    });

    it('debe ser case-sensitive', () => {
      expect(validateResenaEstado('APROBADA')).toBe(false);
      expect(validateResenaEstado('Pendiente')).toBe(false);
    });
  });

});
