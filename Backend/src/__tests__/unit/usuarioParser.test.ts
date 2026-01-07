import { describe, it, expect } from 'vitest';
import {
  parseUserRegistration,
  parseLoginCredentials,
  parseUserFilters,
  parseUserProfileUpdate,
  buildUserQuery,
  validateUserId,
  parsePasswordChange,
} from '../../utils/usuarioParser';
import { validateUserRole } from '../../services/validation.service';
import { RolUsuario } from '../../entities/usuario.entity';

describe('usuarioParser - parseUserRegistration', () => {
  it('debería parsear correctamente un usuario válido con todos los campos', () => {
    const input = {
      email: 'test@example.com',
      username: 'juanperez',
      password: 'SecurePass123!',
      rol: 'usuario',
      nombre: 'Juan',
      apellido: 'Pérez',
    };

    const result = parseUserRegistration(input);

    expect(result.valid).toBe(true);
    expect(result.data?.email).toBe('test@example.com');
    expect(result.data?.username).toBe('juanperez');
    expect(result.data?.password).toBe('SecurePass123!');
    expect(result.data?.nombre).toBe('Juan');
    expect(result.data?.apellido).toBe('Pérez');
    expect(result.errors).toBeUndefined();
  });

  it('debería fallar si falta el email', () => {
    const input = {
      username: 'juanperez',
      password: 'SecurePass123!',
    };

    const result = parseUserRegistration(input);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('El email es requerido');
  });

  it('debería fallar con email inválido', () => {
    const input = {
      email: 'invalid-email',
      username: 'juanperez',
      password: 'SecurePass123!',
    };

    const result = parseUserRegistration(input);
    expect(result.valid).toBe(false);
    expect(result.errors?.some(e => e.includes('email'))).toBe(true);
  });

  it('debería fallar si falta el username', () => {
    const input = {
      email: 'test@example.com',
      password: 'SecurePass123!',
    };

    const result = parseUserRegistration(input);
    expect(result.valid).toBe(false);
    expect(result.errors?.some(e => e.includes('nombre de usuario'))).toBe(true);
  });

  it('debería fallar si falta el password', () => {
    const input = {
      email: 'test@example.com',
      username: 'juanperez',
    };

    const result = parseUserRegistration(input);
    expect(result.valid).toBe(false);
    expect(result.errors?.some(e => e.includes('contraseña'))).toBe(true);
  });

  it('debería fallar con password débil (menos de 8 caracteres)', () => {
    const input = {
      email: 'test@example.com',
      username: 'juanperez',
      password: 'weak',
    };

    const result = parseUserRegistration(input);
    expect(result.valid).toBe(false);
    expect(result.errors?.some(e => e.includes('8 caracteres'))).toBe(true);
  });

  it('debería aceptar nombre y apellido opcionales', () => {
    const input = {
      email: 'test@example.com',
      username: 'juanperez',
      password: 'SecurePass123!',
    };

    const result = parseUserRegistration(input);
    expect(result.valid).toBe(true);
    expect(result.data?.nombre).toBeUndefined();
    expect(result.data?.apellido).toBeUndefined();
  });

  it('debería recolectar múltiples errores', () => {
    const input = {
      email: 'invalid',
      password: 'weak',
    };

    const result = parseUserRegistration(input);
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(1);
  });
});

describe('usuarioParser - parseLoginCredentials', () => {
  it('debería parsear correctamente credenciales válidas', () => {
    const input = {
      email: 'test@example.com',
      password: 'SecurePass123!',
    };

    const result = parseLoginCredentials(input);
    expect(result.valid).toBe(true);
    expect(result.data?.email).toBe('test@example.com');
    expect(result.data?.password).toBe('SecurePass123!');
  });

  it('debería fallar si falta el email', () => {
    const input = {
      password: 'SecurePass123!',
    };

    const result = parseLoginCredentials(input);
    expect(result.valid).toBe(false);
    expect(result.errors?.some(e => e.includes('email'))).toBe(true);
  });

  it('debería fallar si falta el password', () => {
    const input = {
      email: 'test@example.com',
    };

    const result = parseLoginCredentials(input);
    expect(result.valid).toBe(false);
    expect(result.errors?.some(e => e.includes('contraseña'))).toBe(true);
  });

  it('debería fallar con email inválido', () => {
    const input = {
      email: 'not-an-email',
      password: 'SecurePass123!',
    };

    const result = parseLoginCredentials(input);
    expect(result.valid).toBe(false);
    expect(result.errors?.some(e => e.includes('email'))).toBe(true);
  });
});

describe('usuarioParser - parseUserFilters', () => {
  it('debería retornar filtros vacíos sin parámetros', () => {
    const result = parseUserFilters({});

    expect(result.search).toBeUndefined();
    expect(result.rol).toBeUndefined();
    expect(result.page).toBe(1);
    expect(result.limit).toBeLessThanOrEqual(20);
  });

  it('debería parsear búsqueda correctamente', () => {
    const result = parseUserFilters({ search: 'juan' });
    expect(result.search).toBe('juan');
  });

  it('debería rechazar búsqueda con menos de 2 caracteres', () => {
    const result = parseUserFilters({ search: 'a' });
    expect(result.search).toBeUndefined();
  });

  it('debería parsear filtro por rol válido', () => {
    const result = parseUserFilters({ rol: 'admin' });
    expect(result.rol).toBe('admin');
  });

  it('debería rechazar rol inválido', () => {
    const result = parseUserFilters({ rol: 'superadmin' });
    expect(result.rol).toBeUndefined();
  });

  it('debería limitar el máximo de resultados a 100', () => {
    const result = parseUserFilters({ limit: '200' });
    expect(result.limit).toBeLessThanOrEqual(100);
  });

  it('debería parsear paginación correctamente', () => {
    const result = parseUserFilters({ page: '3', limit: '50' });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(50);
  });
});

describe('usuarioParser - parseUserProfileUpdate', () => {
  it('debería parsear actualización parcial correctamente', () => {
    const input = {
      nombre: 'Juan Carlos',
      apellido: 'Pérez García',
    };

    const result = parseUserProfileUpdate(input);
    expect(result.valid).toBe(true);
    expect(result.data?.nombre).toBe('Juan Carlos');
    expect(result.data?.apellido).toBe('Pérez García');
  });

  it('debería aceptar actualización de email', () => {
    const input = {
      email: 'newemail@example.com',
    };

    const result = parseUserProfileUpdate(input);
    expect(result.valid).toBe(true);
    expect(result.data?.email).toBe('newemail@example.com');
  });

  it('debería aceptar actualización de username', () => {
    const input = {
      username: 'newusername',
    };

    const result = parseUserProfileUpdate(input);
    expect(result.valid).toBe(true);
    expect(result.data?.username).toBe('newusername');
  });

  it('debería aceptar actualización de password', () => {
    const input = {
      password: 'NewPassword123!',
    };

    const result = parseUserProfileUpdate(input);
    expect(result.valid).toBe(true);
    expect(result.data?.password).toBe('NewPassword123!');
  });

  it('debería aceptar biografía opcional', () => {
    const input = {
      biografia: 'Nueva biografía del usuario',
    };

    const result = parseUserProfileUpdate(input);
    expect(result.valid).toBe(true);
    expect(result.data?.biografia).toBe('Nueva biografía del usuario');
  });

  it('debería rechazar objeto vacío', () => {
    const result = parseUserProfileUpdate({});
    expect(result.valid).toBe(false);
    expect(result.errors?.some(e => e.includes('proporcionaron datos'))).toBe(true);
  });

  it('debería validar longitud máxima de nombre', () => {
    const input = {
      nombre: 'A'.repeat(101),
    };

    const result = parseUserProfileUpdate(input);
    expect(result.valid).toBe(false);
    expect(result.errors?.some(e => e.includes('100 caracteres'))).toBe(true);
  });
});

describe('usuarioParser - buildUserQuery', () => {
  it('debería construir query vacía sin filtros', () => {
    const filters = parseUserFilters({});
    const query = buildUserQuery(filters);

    expect(query).toEqual({});
  });

  it('debería construir query con búsqueda (username, email, nombre, apellido)', () => {
    const filters = parseUserFilters({ search: 'juan' });
    const query = buildUserQuery(filters);

    expect(query.$or).toBeDefined();
    expect(query.$or).toHaveLength(4);
    expect(query.$or[0].username).toEqual({ $like: '%juan%' });
    expect(query.$or[1].email).toEqual({ $like: '%juan%' });
    expect(query.$or[2].nombre).toEqual({ $like: '%juan%' });
    expect(query.$or[3].apellido).toEqual({ $like: '%juan%' });
  });

  it('debería combinar búsqueda con filtro por rol', () => {
    const filters = parseUserFilters({ search: 'juan', rol: 'admin' });
    const query = buildUserQuery(filters);

    expect(query.$or).toBeDefined();
    expect(query.rol).toBe('admin');
  });
});

describe('usuarioParser - validateUserId', () => {
  it('debería aceptar ID numérico válido', () => {
    const result = validateUserId(42);
    expect(result.valid).toBe(true);
    expect(result.id).toBe(42);
  });

  it('debería aceptar string numérico válido', () => {
    const result = validateUserId('42');
    expect(result.valid).toBe(true);
    expect(result.id).toBe(42);
  });

  it('debería rechazar ID cero', () => {
    const result = validateUserId(0);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('debería rechazar ID negativo', () => {
    const result = validateUserId(-5);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('debería rechazar string no numérico', () => {
    const result = validateUserId('abc');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('debería rechazar null o undefined', () => {
    const result1 = validateUserId(null as any);
    const result2 = validateUserId(undefined as any);
    expect(result1.valid).toBe(false);
    expect(result2.valid).toBe(false);
  });
});

describe('usuarioParser - parsePasswordChange', () => {
  it('debería parsear cambio de password correctamente', () => {
    const input = {
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass456!',
    };

    const result = parsePasswordChange(input);
    expect(result.valid).toBe(true);
    expect(result.data?.currentPassword).toBe('OldPass123!');
    expect(result.data?.newPassword).toBe('NewPass456!');
  });

  it('debería fallar si falta currentPassword', () => {
    const input = {
      newPassword: 'NewPass456!',
    };

    const result = parsePasswordChange(input);
    expect(result.valid).toBe(false);
    expect(result.errors?.some(e => e.includes('actual'))).toBe(true);
  });

  it('debería fallar si falta newPassword', () => {
    const input = {
      currentPassword: 'OldPass123!',
    };

    const result = parsePasswordChange(input);
    expect(result.valid).toBe(false);
    expect(result.errors?.some(e => e.includes('nueva'))).toBe(true);
  });

  it('debería fallar con newPassword débil', () => {
    const input = {
      currentPassword: 'OldPass123!',
      newPassword: 'weak',
    };

    const result = parsePasswordChange(input);
    expect(result.valid).toBe(false);
    expect(result.errors?.some(e => e.includes('8 caracteres'))).toBe(true);
  });

  it('debería fallar si las contraseñas son iguales', () => {
    const input = {
      currentPassword: 'SamePass123!',
      newPassword: 'SamePass123!',
    };

    const result = parsePasswordChange(input);
    expect(result.valid).toBe(false);
    expect(result.errors?.some(e => e.includes('diferente'))).toBe(true);
  });
});

describe('validation.service - validateUserRole', () => {
  it('debería aceptar rol de usuario válido', () => {
    expect(validateUserRole('usuario')).toBe(true);
  });

  it('debería aceptar rol de admin válido', () => {
    expect(validateUserRole('admin')).toBe(true);
  });

  it('debería aceptar rol de moderador válido', () => {
    expect(validateUserRole('moderador')).toBe(true);
  });

  it('debería rechazar rol inválido', () => {
    expect(validateUserRole('superadmin')).toBe(false);
  });

  it('debería rechazar rol vacío', () => {
    expect(validateUserRole('')).toBe(false);
  });
});
