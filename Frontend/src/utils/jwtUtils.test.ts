/**
 * Tests Unitarios para jwtUtils.ts
 * Coverage target: 100%
 * Patrón AAA (Arrange, Act, Assert) — Vitest con globals: true (Frontend)
 *
 * Se mockea localStorage globalmente para aislar los tests.
 */

import { decodeJwt, getUserRole, getToken, isAdmin } from './jwtUtils';

// ── Helper: crear un token JWT fake con payload ───────────────────
function createFakeJwt(payload: Record<string, unknown>): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    const signature = 'fake-signature';
    return `${header}.${body}.${signature}`;
}

describe('jwtUtils - decodeJwt()', () => {
    // ── Éxito ──
    it('debe decodificar correctamente el payload de un JWT', () => {
        // Arrange
        const payload = { id: 42, rol: 'admin', email: 'test@example.com' };
        const token = createFakeJwt(payload);

        // Act
        const result = decodeJwt(token);

        // Assert
        expect(result).toEqual(payload);
        expect(result.id).toBe(42);
        expect(result.rol).toBe('admin');
    });

    it('debe manejar payloads con caracteres especiales', () => {
        const payload = { nombre: 'José García', city: 'São Paulo' };
        const token = createFakeJwt(payload);

        const result = decodeJwt(token);
        expect(result.nombre).toBe('José García');
    });

    // ── Error ──
    it('debe retornar null para token inválido (no es base64)', () => {
        const result = decodeJwt('not.a.valid.jwt');
        expect(result).toBeNull();
    });

    it('debe retornar null para string vacío', () => {
        const result = decodeJwt('');
        expect(result).toBeNull();
    });

    it('debe retornar null para token sin punto separador', () => {
        const result = decodeJwt('tokensinpuntos');
        expect(result).toBeNull();
    });

    it('debe retornar null para token con payload corrupto', () => {
        const result = decodeJwt('header.%%%corrupt%%%.signature');
        expect(result).toBeNull();
    });
});

describe('jwtUtils - getUserRole()', () => {
    afterEach(() => {
        localStorage.clear();
    });

    it('debe retornar el rol del usuario desde el token almacenado', () => {
        // Arrange
        const token = createFakeJwt({ id: 1, rol: 'moderador' });
        localStorage.setItem('accessToken', token);

        // Act
        const role = getUserRole();

        // Assert
        expect(role).toBe('moderador');
    });

    it('debe retornar null si no hay token en localStorage', () => {
        expect(getUserRole()).toBeNull();
    });

    it('debe retornar null si el token no tiene campo "rol"', () => {
        const token = createFakeJwt({ id: 1, email: 'test@test.com' });
        localStorage.setItem('accessToken', token);

        expect(getUserRole()).toBeNull();
    });
});

describe('jwtUtils - getToken()', () => {
    afterEach(() => {
        localStorage.clear();
    });

    it('debe retornar el token almacenado en localStorage', () => {
        localStorage.setItem('accessToken', 'my-access-token');

        expect(getToken()).toBe('my-access-token');
    });

    it('debe retornar null si no hay token', () => {
        expect(getToken()).toBeNull();
    });
});

describe('jwtUtils - isAdmin()', () => {
    afterEach(() => {
        localStorage.clear();
    });

    it('debe retornar true si el rol del usuario es "admin"', () => {
        const token = createFakeJwt({ id: 1, rol: 'admin' });
        localStorage.setItem('accessToken', token);

        expect(isAdmin()).toBe(true);
    });

    it('debe retornar false si el rol es "usuario"', () => {
        const token = createFakeJwt({ id: 2, rol: 'usuario' });
        localStorage.setItem('accessToken', token);

        expect(isAdmin()).toBe(false);
    });

    it('debe retornar false si el rol es "moderador"', () => {
        const token = createFakeJwt({ id: 3, rol: 'moderador' });
        localStorage.setItem('accessToken', token);

        expect(isAdmin()).toBe(false);
    });

    it('debe retornar false si no hay token almacenado', () => {
        expect(isAdmin()).toBe(false);
    });

    it('debe retornar false si el token no tiene campo rol', () => {
        const token = createFakeJwt({ id: 5, email: 'norol@test.com' });
        localStorage.setItem('accessToken', token);

        expect(isAdmin()).toBe(false);
    });
});
