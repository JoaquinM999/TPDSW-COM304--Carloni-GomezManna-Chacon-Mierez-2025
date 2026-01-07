import { describe, it, expect } from 'vitest';
import {
  validateLoginCredentials,
  validatePasswordResetRequest,
  validatePasswordResetData,
  validateNewPassword,
  validatePasswordStrength,
  validateRefreshToken,
  sanitizeEmail,
  validateRegistrationData,
  AUTH_MESSAGES,
  AUTH_ERROR_CODES,
} from '../../utils/authValidationHelpers';

describe('authValidationHelpers - validateLoginCredentials', () => {
  it('debería validar credenciales correctas', () => {
    const result = validateLoginCredentials({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('debería rechazar si falta email', () => {
    const result = validateLoginCredentials({
      password: 'password123',
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Email y contraseña son requeridos');
    expect(result.statusCode).toBe(400);
  });

  it('debería rechazar si falta password', () => {
    const result = validateLoginCredentials({
      email: 'user@example.com',
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Email y contraseña son requeridos');
    expect(result.statusCode).toBe(400);
  });

  it('debería rechazar email con formato inválido', () => {
    const result = validateLoginCredentials({
      email: 'invalid-email',
      password: 'password123',
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Formato de email inválido');
    expect(result.statusCode).toBe(400);
  });

  it('debería rechazar password muy corto (menos de 6 caracteres)', () => {
    const result = validateLoginCredentials({
      email: 'user@example.com',
      password: '12345',
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('La contraseña debe tener al menos 6 caracteres');
    expect(result.statusCode).toBe(400);
  });

  it('debería aceptar password de exactamente 6 caracteres', () => {
    const result = validateLoginCredentials({
      email: 'user@example.com',
      password: '123456',
    });

    expect(result.isValid).toBe(true);
  });

  it('debería aceptar email con subdominios y TLD largos', () => {
    const result = validateLoginCredentials({
      email: 'user@subdomain.example.company',
      password: 'password123',
    });

    expect(result.isValid).toBe(true);
  });
});

describe('authValidationHelpers - validatePasswordResetRequest', () => {
  it('debería validar email correcto', () => {
    const result = validatePasswordResetRequest({
      email: 'user@example.com',
    });

    expect(result.isValid).toBe(true);
    expect(result.error).toBe('user@example.com'); // Retorna email sanitizado
  });

  it('debería rechazar si falta email', () => {
    const result = validatePasswordResetRequest({});

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Email es requerido');
    expect(result.statusCode).toBe(400);
  });

  it('debería rechazar email con formato inválido', () => {
    const result = validatePasswordResetRequest({
      email: 'not-an-email',
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Formato de email inválido');
    expect(result.statusCode).toBe(400);
  });

  it('debería sanitizar email (lowercase)', () => {
    const result = validatePasswordResetRequest({
      email: 'USER@EXAMPLE.COM',
    });

    expect(result.isValid).toBe(true);
    expect(result.error).toBe('user@example.com');
  });

  it('debería rechazar email sin dominio', () => {
    const result = validatePasswordResetRequest({
      email: 'user@',
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Formato de email inválido');
  });
});

describe('authValidationHelpers - validatePasswordResetData', () => {
  it('debería validar token y password correctos', () => {
    const validToken = 'a'.repeat(64); // 64 caracteres hex
    const result = validatePasswordResetData({
      token: validToken,
      newPassword: 'newPassword123',
    });

    expect(result.isValid).toBe(true);
  });

  it('debería rechazar si falta token', () => {
    const result = validatePasswordResetData({
      newPassword: 'newPassword123',
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Token y nueva contraseña son requeridos');
    expect(result.statusCode).toBe(400);
  });

  it('debería rechazar si falta newPassword', () => {
    const validToken = 'a'.repeat(64);
    const result = validatePasswordResetData({
      token: validToken,
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Token y nueva contraseña son requeridos');
    expect(result.statusCode).toBe(400);
  });

  it('debería rechazar token con longitud incorrecta', () => {
    const result = validatePasswordResetData({
      token: 'short-token',
      newPassword: 'newPassword123',
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Token inválido');
    expect(result.statusCode).toBe(400);
  });

  it('debería rechazar password muy corto', () => {
    const validToken = 'a'.repeat(64);
    const result = validatePasswordResetData({
      token: validToken,
      newPassword: '12345',
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('La contraseña debe tener al menos 6 caracteres');
  });

  it('debería aceptar token de exactamente 64 caracteres', () => {
    const validToken = '1234567890'.repeat(6) + '1234'; // 64 chars
    const result = validatePasswordResetData({
      token: validToken,
      newPassword: 'validPassword123',
    });

    expect(result.isValid).toBe(true);
  });
});

describe('authValidationHelpers - validateNewPassword', () => {
  it('debería validar password correcto', () => {
    const result = validateNewPassword('validPassword123');
    expect(result.isValid).toBe(true);
  });

  it('debería rechazar password vacío', () => {
    const result = validateNewPassword('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Contraseña es requerida');
    expect(result.statusCode).toBe(400);
  });

  it('debería rechazar password muy corto (menos de 6 caracteres)', () => {
    const result = validateNewPassword('12345');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('La contraseña debe tener al menos 6 caracteres');
  });

  it('debería rechazar password muy largo (más de 128 caracteres)', () => {
    const longPassword = 'a'.repeat(129);
    const result = validateNewPassword(longPassword);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('La contraseña no puede exceder 128 caracteres');
  });

  it('debería rechazar password de solo espacios', () => {
    const result = validateNewPassword('      ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('La contraseña no puede ser solo espacios');
  });

  it('debería aceptar password de exactamente 128 caracteres', () => {
    const maxPassword = 'a'.repeat(128);
    const result = validateNewPassword(maxPassword);
    expect(result.isValid).toBe(true);
  });
});

describe('authValidationHelpers - validatePasswordStrength', () => {
  it('debería validar password fuerte', () => {
    const result = validatePasswordStrength('StrongPass123');
    expect(result.isValid).toBe(true);
  });

  it('debería rechazar password sin mayúsculas', () => {
    const result = validatePasswordStrength('weakpass123');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('La contraseña debe contener al menos una letra mayúscula');
  });

  it('debería rechazar password sin minúsculas', () => {
    const result = validatePasswordStrength('WEAKPASS123');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('La contraseña debe contener al menos una letra minúscula');
  });

  it('debería rechazar password sin números', () => {
    const result = validatePasswordStrength('WeakPassword');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('La contraseña debe contener al menos un número');
  });

  it('debería validar con múltiples mayúsculas y números', () => {
    const result = validatePasswordStrength('VerySTRONG123Pass456');
    expect(result.isValid).toBe(true);
  });

  it('debería fallar con password corto aunque tenga mayúsculas, minúsculas y números', () => {
    const result = validatePasswordStrength('Aa1');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('La contraseña debe tener al menos 6 caracteres');
  });
});

describe('authValidationHelpers - validateRefreshToken', () => {
  it('debería validar refresh token con formato JWT correcto', () => {
    const validToken = 'header.payload.signature';
    const result = validateRefreshToken(validToken);
    expect(result.isValid).toBe(true);
  });

  it('debería rechazar si falta refresh token', () => {
    const result = validateRefreshToken(undefined);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Refresh token es requerido');
    expect(result.statusCode).toBe(400);
  });

  it('debería rechazar token con formato inválido (sin puntos)', () => {
    const result = validateRefreshToken('invalid-token-format');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Formato de refresh token inválido');
  });

  it('debería rechazar token con solo 2 partes', () => {
    const result = validateRefreshToken('header.payload');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Formato de refresh token inválido');
  });

  it('debería aceptar token JWT con datos reales', () => {
    const realJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const result = validateRefreshToken(realJWT);
    expect(result.isValid).toBe(true);
  });
});

describe('authValidationHelpers - sanitizeEmail', () => {
  it('debería convertir email a lowercase', () => {
    const result = sanitizeEmail('USER@EXAMPLE.COM');
    expect(result).toBe('user@example.com');
  });

  it('debería eliminar espacios en blanco', () => {
    const result = sanitizeEmail('  user@example.com  ');
    expect(result).toBe('user@example.com');
  });

  it('debería aplicar ambas transformaciones', () => {
    const result = sanitizeEmail('  USER@EXAMPLE.COM  ');
    expect(result).toBe('user@example.com');
  });
});

describe('authValidationHelpers - validateRegistrationData', () => {
  it('debería validar datos de registro completos y correctos', () => {
    const result = validateRegistrationData({
      email: 'newuser@example.com',
      password: 'SecurePass123',
      username: 'newuser123',
      nombre: 'Juan Pérez',
    });

    expect(result.isValid).toBe(true);
  });

  it('debería rechazar si falta email', () => {
    const result = validateRegistrationData({
      password: 'SecurePass123',
      username: 'newuser123',
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Email es requerido');
  });

  it('debería rechazar email con formato inválido', () => {
    const result = validateRegistrationData({
      email: 'invalid-email',
      password: 'SecurePass123',
      username: 'newuser123',
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Formato de email inválido');
  });

  it('debería rechazar password inválido', () => {
    const result = validateRegistrationData({
      email: 'user@example.com',
      password: '123', // muy corto
      username: 'newuser123',
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('La contraseña debe tener al menos 6 caracteres');
  });

  it('debería rechazar username muy corto (menos de 3 caracteres)', () => {
    const result = validateRegistrationData({
      email: 'user@example.com',
      password: 'SecurePass123',
      username: 'ab',
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('El nombre de usuario debe tener al menos 3 caracteres');
  });

  it('debería rechazar username muy largo (más de 50 caracteres)', () => {
    const result = validateRegistrationData({
      email: 'user@example.com',
      password: 'SecurePass123',
      username: 'a'.repeat(51),
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('El nombre de usuario no puede exceder 50 caracteres');
  });

  it('debería rechazar username con caracteres no permitidos', () => {
    const result = validateRegistrationData({
      email: 'user@example.com',
      password: 'SecurePass123',
      username: 'user@name!',
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('El nombre de usuario solo puede contener letras, números, guiones y guiones bajos');
  });

  it('debería rechazar nombre muy largo (más de 100 caracteres)', () => {
    const result = validateRegistrationData({
      email: 'user@example.com',
      password: 'SecurePass123',
      username: 'validuser',
      nombre: 'a'.repeat(101),
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('El nombre no puede exceder 100 caracteres');
  });

  it('debería aceptar username con guiones y guiones bajos', () => {
    const result = validateRegistrationData({
      email: 'user@example.com',
      password: 'SecurePass123',
      username: 'valid_user-name123',
    });

    expect(result.isValid).toBe(true);
  });

  it('debería aceptar registro sin nombre (campo opcional)', () => {
    const result = validateRegistrationData({
      email: 'user@example.com',
      password: 'SecurePass123',
      username: 'validuser',
    });

    expect(result.isValid).toBe(true);
  });
});

describe('authValidationHelpers - Constantes', () => {
  it('debería tener mensajes de autenticación definidos', () => {
    expect(AUTH_MESSAGES.LOGIN_SUCCESS).toBe('Login exitoso');
    expect(AUTH_MESSAGES.INVALID_CREDENTIALS).toBe('Credenciales inválidas');
    expect(AUTH_MESSAGES.PASSWORD_RESET_SENT).toBe('Si el email existe, recibirás un enlace de recuperación');
    expect(AUTH_MESSAGES.TOKEN_INVALID).toBe('Token inválido o expirado');
  });

  it('debería tener códigos de error definidos', () => {
    expect(AUTH_ERROR_CODES.MISSING_FIELDS).toBe('MISSING_FIELDS');
    expect(AUTH_ERROR_CODES.INVALID_EMAIL).toBe('INVALID_EMAIL');
    expect(AUTH_ERROR_CODES.INVALID_CREDENTIALS).toBe('INVALID_CREDENTIALS');
    expect(AUTH_ERROR_CODES.TOKEN_EXPIRED).toBe('TOKEN_EXPIRED');
  });
});
