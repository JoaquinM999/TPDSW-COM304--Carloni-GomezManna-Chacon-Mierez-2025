/**
 * Tests Unitarios para tokenUtil.ts
 * Coverage target: 100%
 * Patrón AAA (Arrange, Act, Assert) — Vitest con globals: true (Frontend)
 *
 * Cada test limpia localStorage con afterEach según requerimiento del usuario.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { saveTokens, getAccessToken, getRefreshToken, clearTokens } from './tokenUtil';

describe('tokenUtil', () => {
    // ── Limpieza obligatoria después de cada test ──
    afterEach(() => {
        localStorage.clear();
    });

    // ================================================================
    // saveTokens()
    // ================================================================
    describe('saveTokens()', () => {
        it('debe guardar accessToken y refreshToken en localStorage', () => {
            // Arrange & Act
            saveTokens('access-123', 'refresh-456');

            // Assert
            expect(localStorage.getItem('accessToken')).toBe('access-123');
            expect(localStorage.getItem('refreshToken')).toBe('refresh-456');
        });

        it('debe sobreescribir tokens existentes', () => {
            // Arrange
            localStorage.setItem('accessToken', 'old-access');
            localStorage.setItem('refreshToken', 'old-refresh');

            // Act
            saveTokens('new-access', 'new-refresh');

            // Assert
            expect(localStorage.getItem('accessToken')).toBe('new-access');
            expect(localStorage.getItem('refreshToken')).toBe('new-refresh');
        });

        it('debe manejar tokens como strings vacíos', () => {
            saveTokens('', '');

            expect(localStorage.getItem('accessToken')).toBe('');
            expect(localStorage.getItem('refreshToken')).toBe('');
        });

        it('debe manejar tokens muy largos', () => {
            const longToken = 'x'.repeat(10000);
            saveTokens(longToken, longToken);

            expect(localStorage.getItem('accessToken')).toBe(longToken);
            expect(localStorage.getItem('refreshToken')).toBe(longToken);
        });
    });

    // ================================================================
    // getAccessToken()
    // ================================================================
    describe('getAccessToken()', () => {
        it('debe retornar el accessToken almacenado', () => {
            localStorage.setItem('accessToken', 'my-access-token');

            expect(getAccessToken()).toBe('my-access-token');
        });

        it('debe retornar null si no hay accessToken', () => {
            expect(getAccessToken()).toBeNull();
        });
    });

    // ================================================================
    // getRefreshToken()
    // ================================================================
    describe('getRefreshToken()', () => {
        it('debe retornar el refreshToken almacenado', () => {
            localStorage.setItem('refreshToken', 'my-refresh-token');

            expect(getRefreshToken()).toBe('my-refresh-token');
        });

        it('debe retornar null si no hay refreshToken', () => {
            expect(getRefreshToken()).toBeNull();
        });
    });

    // ================================================================
    // clearTokens()
    // ================================================================
    describe('clearTokens()', () => {
        it('debe eliminar ambos tokens de localStorage', () => {
            // Arrange
            localStorage.setItem('accessToken', 'access-to-remove');
            localStorage.setItem('refreshToken', 'refresh-to-remove');

            // Act
            clearTokens();

            // Assert
            expect(localStorage.getItem('accessToken')).toBeNull();
            expect(localStorage.getItem('refreshToken')).toBeNull();
        });

        it('no debe lanzar error si no hay tokens que eliminar', () => {
            // Act & Assert — no debería lanzar
            expect(() => clearTokens()).not.toThrow();
        });

        it('no debe afectar otras claves en localStorage', () => {
            // Arrange
            localStorage.setItem('accessToken', 'access');
            localStorage.setItem('refreshToken', 'refresh');
            localStorage.setItem('otherKey', 'should-survive');

            // Act
            clearTokens();

            // Assert
            expect(localStorage.getItem('otherKey')).toBe('should-survive');
        });
    });

    // ================================================================
    // Integración entre funciones
    // ================================================================
    describe('flujo completo (integración)', () => {
        it('debe guardar, leer y limpiar tokens correctamente', () => {
            // Save
            saveTokens('acc-token', 'ref-token');
            expect(getAccessToken()).toBe('acc-token');
            expect(getRefreshToken()).toBe('ref-token');

            // Clear
            clearTokens();
            expect(getAccessToken()).toBeNull();
            expect(getRefreshToken()).toBeNull();
        });
    });
});
