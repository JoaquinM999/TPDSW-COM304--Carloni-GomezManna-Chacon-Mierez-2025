/**
 * Tests Unitarios para slugUtils.ts
 * Coverage target: 100%
 * Patrón AAA (Arrange, Act, Assert) — Vitest con globals: true (Frontend)
 *
 * Tests puramente unitarios, sin dependencias externas.
 */

import {
    createSlug,
    createGoogleBookSlug,
    extractGoogleIdFromSlug,
    extractTitleFromSlug,
} from './slugUtils';

describe('slugUtils - createSlug()', () => {
    // ── Éxito ──
    it('debe convertir título a minúsculas', () => {
        expect(createSlug('HOLA MUNDO')).toBe('hola-mundo');
    });

    it('debe reemplazar espacios por guiones', () => {
        expect(createSlug('Cien Años de Soledad')).toBe('cien-anos-de-soledad');
    });

    it('debe remover acentos y diacríticos', () => {
        expect(createSlug('café résumé über')).toBe('cafe-resume-uber');
    });

    it('debe remover la tilde de la ñ y normalizar', () => {
        // NFD descompone ñ → n + tilde combinante, luego se elimina
        const result = createSlug('El niño soñador');
        expect(result).toBe('el-nino-sonador');
    });

    it('debe eliminar caracteres especiales', () => {
        expect(createSlug('Harry Potter: La Piedra Filosofal')).toBe('harry-potter-la-piedra-filosofal');
        expect(createSlug('¿Quién mató al comendador?')).toBe('quien-mato-al-comendador');
    });

    it('debe colapsar múltiples guiones consecutivos en uno solo', () => {
        expect(createSlug('Título---con---guiones')).toBe('titulo-con-guiones');
    });

    it('debe trimear espacios al inicio y final', () => {
        expect(createSlug('  Hola Mundo  ')).toBe('hola-mundo');
    });

    // ── Edge cases ──
    it('debe manejar string vacío', () => {
        expect(createSlug('')).toBe('');
    });

    it('debe manejar texto con solo caracteres especiales', () => {
        const result = createSlug('!@#$%^&*()');
        expect(result).toBe('');
    });

    it('debe manejar texto con múltiples espacios internos', () => {
        expect(createSlug('Hola    Mundo    Feliz')).toBe('hola-mundo-feliz');
    });

    it('debe manejar números en el título', () => {
        expect(createSlug('1984 por George Orwell')).toBe('1984-por-george-orwell');
    });
});

describe('slugUtils - createGoogleBookSlug()', () => {
    // ── Éxito ──
    it('debe combinar slug del título con los primeros 8 chars del ID', () => {
        // Arrange
        const libro = { titulo: 'Cien Años de Soledad', id: 'abc123xyz456def' };

        // Act
        const result = createGoogleBookSlug(libro);

        // Assert
        expect(result).toBe('cien-anos-de-soledad-abc123xy');
    });

    it('debe convertir el ID a minúsculas', () => {
        const libro = { titulo: 'Test', id: 'ABCD1234XYZ' };
        const result = createGoogleBookSlug(libro);

        expect(result).toBe('test-abcd1234');
    });

    // ── Edge cases ──
    it('debe manejar IDs cortos (< 8 chars)', () => {
        const libro = { titulo: 'Breve', id: 'AB12' };
        const result = createGoogleBookSlug(libro);

        // slice(0, 8) de un string de 4 chars = el string completo
        expect(result).toBe('breve-ab12');
    });

    it('debe manejar título vacío', () => {
        const libro = { titulo: '', id: 'abc12345' };
        const result = createGoogleBookSlug(libro);

        expect(result).toBe('-abc12345');
    });

    it('debe manejar ID de exactamente 8 chars', () => {
        const libro = { titulo: 'Libro', id: '12345678' };
        const result = createGoogleBookSlug(libro);

        expect(result).toBe('libro-12345678');
    });
});

describe('slugUtils - extractGoogleIdFromSlug()', () => {
    // ── Éxito ──
    it('debe extraer el último segmento como ID', () => {
        expect(extractGoogleIdFromSlug('cien-anos-soledad-abc123xy')).toBe('abc123xy');
    });

    it('debe funcionar con slug de un solo segmento', () => {
        expect(extractGoogleIdFromSlug('abc123xy')).toBe('abc123xy');
    });

    // ── Edge cases ──
    it('debe manejar slug con muchos guiones', () => {
        expect(extractGoogleIdFromSlug('a-b-c-d-e-id123')).toBe('id123');
    });

    it('debe manejar string vacío', () => {
        expect(extractGoogleIdFromSlug('')).toBe('');
    });
});

describe('slugUtils - extractTitleFromSlug()', () => {
    // ── Éxito ──
    it('debe reconstruir el título sin el ID final', () => {
        const result = extractTitleFromSlug('cien-anos-soledad-abc123xy');
        expect(result).toBe('cien anos soledad');
    });

    it('debe unir segmentos con espacios', () => {
        const result = extractTitleFromSlug('el-quijote-de-la-mancha-id12');
        expect(result).toBe('el quijote de la mancha');
    });

    // ── Edge cases ──
    it('debe retornar string vacío si slug tiene un solo segmento', () => {
        expect(extractTitleFromSlug('soloId')).toBe('');
    });

    it('debe manejar string vacío', () => {
        expect(extractTitleFromSlug('')).toBe('');
    });

    it('debe manejar slug con dos segmentos', () => {
        expect(extractTitleFromSlug('titulo-id123')).toBe('titulo');
    });
});
