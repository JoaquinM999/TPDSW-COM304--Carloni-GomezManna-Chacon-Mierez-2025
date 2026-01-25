/**
 * Tests unitarios para validators.ts
 * Cubre todas las funciones de validación del frontend
 */

import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateRating,
  sanitizeUserInput,
  validateTextLength,
  validateURL,
  validateUsername,
  validatePageNumber,
  validateLimit,
  validateISBN,
  validateYear,
} from './validators';

describe('validators - validateEmail', () => {
  it('debería validar email correcto', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
  });

  it('debería rechazar email sin @', () => {
    expect(validateEmail('testexample.com')).toBe(false);
  });

  it('debería rechazar email sin dominio', () => {
    expect(validateEmail('test@')).toBe(false);
  });

  it('debería rechazar email vacío', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('debería rechazar null/undefined', () => {
    expect(validateEmail(null as any)).toBe(false);
    expect(validateEmail(undefined as any)).toBe(false);
  });

  it('debería manejar espacios al inicio y final', () => {
    expect(validateEmail('  test@example.com  ')).toBe(true);
  });
});

describe('validators - validatePassword', () => {
  it('debería validar password válido', () => {
    const result = validatePassword('Password123');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('debería rechazar password muy corto', () => {
    const result = validatePassword('Pass1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('La contraseña debe tener al menos 8 caracteres');
  });

  it('debería rechazar password sin mayúscula', () => {
    const result = validatePassword('password123');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('La contraseña debe contener al menos una mayúscula');
  });

  it('debería rechazar password sin minúscula', () => {
    const result = validatePassword('PASSWORD123');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('La contraseña debe contener al menos una minúscula');
  });

  it('debería rechazar password sin número', () => {
    const result = validatePassword('PasswordABC');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('La contraseña debe contener al menos un número');
  });

  it('debería acumular múltiples errores', () => {
    const result = validatePassword('pass');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });

  it('debería rechazar null/undefined', () => {
    const result1 = validatePassword(null as any);
    expect(result1.valid).toBe(false);
    
    const result2 = validatePassword(undefined as any);
    expect(result2.valid).toBe(false);
  });
});

describe('validators - validateRating', () => {
  it('debería validar rating entre 1 y 5', () => {
    expect(validateRating(1)).toBe(true);
    expect(validateRating(3)).toBe(true);
    expect(validateRating(5)).toBe(true);
  });

  it('debería rechazar rating menor a 1', () => {
    expect(validateRating(0)).toBe(false);
    expect(validateRating(-1)).toBe(false);
  });

  it('debería rechazar rating mayor a 5', () => {
    expect(validateRating(6)).toBe(false);
    expect(validateRating(10)).toBe(false);
  });

  it('debería rechazar decimales', () => {
    expect(validateRating(3.5)).toBe(false);
  });

  it('debería rechazar NaN', () => {
    expect(validateRating(NaN)).toBe(false);
  });

  it('debería rechazar null/undefined', () => {
    expect(validateRating(null as any)).toBe(false);
    expect(validateRating(undefined as any)).toBe(false);
  });
});

describe('validators - sanitizeUserInput', () => {
  it('debería escapar tags HTML', () => {
    const input = '<script>alert("xss")</script>Hola';
    const result = sanitizeUserInput(input);
    expect(result).toContain('&lt;script&gt;');
    expect(result).toContain('&lt;&#x2F;script&gt;');
  });

  it('debería escapar eventos onclick', () => {
    const input = '<div onclick="alert()">Test</div>';
    const result = sanitizeUserInput(input);
    expect(result).toContain('&lt;div');
    expect(result).toContain('&gt;');
  });

  it('debería preservar texto normal', () => {
    const input = 'Este es un texto normal';
    const result = sanitizeUserInput(input);
    expect(result).toBe(input);
  });

  it('debería eliminar espacios al inicio y final', () => {
    const input = '   texto con espacios   ';
    const result = sanitizeUserInput(input);
    expect(result).toBe('texto con espacios');
  });

  it('debería retornar string vacío para null/undefined', () => {
    expect(sanitizeUserInput(null as any)).toBe('');
    expect(sanitizeUserInput(undefined as any)).toBe('');
  });

  it('debería escapar comillas', () => {
    const input = 'Texto con "comillas" y \'apostrofes\'';
    const result = sanitizeUserInput(input);
    expect(result).toContain('&quot;');
    expect(result).toContain('&#x27;');
  });
});

describe('validators - validateTextLength', () => {
  it('debería validar texto dentro del rango', () => {
    const result = validateTextLength('Hola mundo', 5, 20);
    expect(result.valid).toBe(true);
  });

  it('debería rechazar texto muy corto', () => {
    const result = validateTextLength('Hi', 5, 20);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('al menos 5');
  });

  it('debería rechazar texto muy largo', () => {
    const result = validateTextLength('A'.repeat(100), 5, 20);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('no puede exceder 20');
  });

  it('debería aceptar texto en el límite exacto', () => {
    expect(validateTextLength('12345', 5, 10).valid).toBe(true);
    expect(validateTextLength('1234567890', 5, 10).valid).toBe(true);
  });

  it('debería rechazar texto vacío', () => {
    const result = validateTextLength('', 5, 20);
    expect(result.valid).toBe(false);
  });

  it('debería rechazar null/undefined', () => {
    expect(validateTextLength(null as any, 5, 20).valid).toBe(false);
    expect(validateTextLength(undefined as any, 5, 20).valid).toBe(false);
  });
});

describe('validators - validateURL', () => {
  it('debería validar URL válida', () => {
    expect(validateURL('https://example.com')).toBe(true);
    expect(validateURL('http://example.com')).toBe(true);
  });

  it('debería validar URL con path', () => {
    expect(validateURL('https://example.com/path/to/page')).toBe(true);
  });

  it('debería rechazar URL sin protocolo', () => {
    expect(validateURL('example.com')).toBe(false);
  });

  it('debería rechazar URL inválida', () => {
    expect(validateURL('not a url')).toBe(false);
  });

  it('debería rechazar string vacío', () => {
    expect(validateURL('')).toBe(false);
  });

  it('debería rechazar null/undefined', () => {
    expect(validateURL(null as any)).toBe(false);
    expect(validateURL(undefined as any)).toBe(false);
  });
});

describe('validators - validateUsername', () => {
  it('debería validar username válido', () => {
    expect(validateUsername('user123').valid).toBe(true);
    expect(validateUsername('User_Name').valid).toBe(true);
    expect(validateUsername('user-name').valid).toBe(true);
  });

  it('debería rechazar username muy corto', () => {
    const result = validateUsername('ab');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('al menos 3');
  });

  it('debería rechazar username muy largo', () => {
    const result = validateUsername('a'.repeat(31));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('no puede exceder 20');
  });

  it('debería rechazar username con caracteres especiales', () => {
    expect(validateUsername('user@name').valid).toBe(false);
    expect(validateUsername('user name').valid).toBe(false);
  });

  it('debería rechazar username vacío', () => {
    const result = validateUsername('');
    expect(result.valid).toBe(false);
  });

  it('debería rechazar null/undefined', () => {
    expect(validateUsername(null as any).valid).toBe(false);
    expect(validateUsername(undefined as any).valid).toBe(false);
  });
});

describe('validators - validatePageNumber', () => {
  it('debería retornar número válido de página', () => {
    expect(validatePageNumber(1)).toBe(1);
    expect(validatePageNumber(10)).toBe(10);
  });

  it('debería retornar 1 para página 0 o negativa', () => {
    expect(validatePageNumber(0)).toBe(1);
    expect(validatePageNumber(-1)).toBe(1);
  });

  it('debería parsear strings numéricos', () => {
    expect(validatePageNumber('5')).toBe(5);
    expect(validatePageNumber('10')).toBe(10);
  });

  it('debería retornar 1 para NaN', () => {
    expect(validatePageNumber(NaN)).toBe(1);
    expect(validatePageNumber('abc')).toBe(1);
  });

  it('debería retornar 1 para null/undefined', () => {
    expect(validatePageNumber(null)).toBe(1);
    expect(validatePageNumber(undefined)).toBe(1);
  });
});

describe('validators - validateLimit', () => {
  it('debería retornar límite válido', () => {
    expect(validateLimit(10)).toBe(10);
    expect(validateLimit(50)).toBe(50);
  });

  it('debería retornar default para límite menor a 1', () => {
    expect(validateLimit(0)).toBe(12);
    expect(validateLimit(-10)).toBe(12);
  });

  it('debería limitar a 100 máximo', () => {
    expect(validateLimit(101)).toBe(100);
    expect(validateLimit(200)).toBe(100);
  });

  it('debería aceptar límite en el borde (1 y 100)', () => {
    expect(validateLimit(1)).toBe(1);
    expect(validateLimit(100)).toBe(100);
  });

  it('debería parsear strings numéricos', () => {
    expect(validateLimit('20')).toBe(20);
  });

  it('debería retornar default para NaN', () => {
    expect(validateLimit(NaN)).toBe(12);
    expect(validateLimit('abc')).toBe(12);
  });

  it('debería permitir configurar límite default', () => {
    expect(validateLimit(0, 20)).toBe(20);
    expect(validateLimit(-5, 30)).toBe(30);
  });
});

describe('validators - validateISBN', () => {
  it('debería validar ISBN-10 válido', () => {
    expect(validateISBN('0306406152')).toBe(true);
  });

  it('debería validar ISBN-13 válido', () => {
    expect(validateISBN('9780306406157')).toBe(true);
  });

  it('debería validar ISBN con guiones', () => {
    expect(validateISBN('978-0-306-40615-7')).toBe(true);
    expect(validateISBN('0-306-40615-2')).toBe(true);
  });

  it('debería rechazar ISBN inválido', () => {
    expect(validateISBN('123')).toBe(false);
    expect(validateISBN('12345678901234')).toBe(false);
  });

  it('debería rechazar string vacío', () => {
    expect(validateISBN('')).toBe(false);
  });

  it('debería rechazar null/undefined', () => {
    expect(validateISBN(null as any)).toBe(false);
    expect(validateISBN(undefined as any)).toBe(false);
  });
});

describe('validators - validateYear', () => {
  it('debería validar año válido', () => {
    expect(validateYear(2000)).toBe(true);
    expect(validateYear(2025)).toBe(true);
  });

  it('debería rechazar año muy antiguo (antes de 1000)', () => {
    expect(validateYear(500)).toBe(false);
    expect(validateYear(999)).toBe(false);
  });

  it('debería aceptar año desde 1000', () => {
    expect(validateYear(1000)).toBe(true);
    expect(validateYear(1400)).toBe(true);
  });

  it('debería rechazar año futuro (más de +1)', () => {
    const futureYear = new Date().getFullYear() + 2;
    expect(validateYear(futureYear)).toBe(false);
  });

  it('debería aceptar año actual + 1', () => {
    const nextYear = new Date().getFullYear() + 1;
    expect(validateYear(nextYear)).toBe(true);
  });

  it('debería parsear strings numéricos', () => {
    expect(validateYear('2023')).toBe(true);
  });

  it('debería rechazar NaN', () => {
    expect(validateYear(NaN)).toBe(false);
    expect(validateYear('abc')).toBe(false);
  });

  it('debería rechazar null/undefined', () => {
    expect(validateYear(null as any)).toBe(false);
    expect(validateYear(undefined as any)).toBe(false);
  });
});
