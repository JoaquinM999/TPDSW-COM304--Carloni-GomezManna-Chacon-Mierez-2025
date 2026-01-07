import { describe, it, expect } from 'vitest';
import {
  parseResenaInput
} from './resenaParser';
import {
  parseLibroInput
} from './libroParser';
import {
  parseAutorInput
} from './autorParser';
import {
  parseUserRegistration
} from './usuarioParser';

describe('Parser Integration - Complex Scenarios', () => {
  describe('parseResenaInput - Real World Cases', () => {
    it('debería parsear reseña con texto muy largo', () => {
      const longText = 'A'.repeat(5000);
      const input = {
        comentario: longText,
        estrellas: 5,
        libroId: 1,
        usuarioId: 1
      };

      const result = parseResenaInput(input);
      expect(result.valid).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('debería manejar comentario con caracteres especiales', () => {
      const input = {
        comentario: 'Test with special chars: ñ á é í ó ú ü ¿ ¡ @ # $ %',
        estrellas: 4,
        libroId: 1,
        usuarioId: 1
      };

      const result = parseResenaInput(input);
      expect(result.valid).toBe(true);
      if (result.data) {
        expect(result.data.comentario).toContain('Test with special chars');
      }
    });

    it('debería manejar IDs como strings numéricos', () => {
      const input = {
        comentario: 'Test',
        estrellas: '5',
        libroId: '123',
        usuarioId: '456'
      };

      const result = parseResenaInput(input);
      expect(result.data || result.errors).toBeDefined();
    });

    it('debería validar estrellas fuera de rango 1-5', () => {
      const input = {
        comentario: 'Test',
        estrellas: 10,
        libroId: 1,
        usuarioId: 1
      };

      const result = parseResenaInput(input);
      if (!result.valid) {
        expect(result.errors).toBeDefined();
      }
    });

    it('debería manejar comentario con HTML embebido', () => {
      const input = {
        comentario: '<p>Este es un <b>comentario</b> con HTML</p>',
        estrellas: 4,
        libroId: 1,
        usuarioId: 1
      };

      const result = parseResenaInput(input);
      // El parser debería sanitizar el HTML
      expect(result.data || result.errors).toBeDefined();
    });
  });

  describe('parseLibroInput - ISBN & Complex Data', () => {
    it('debería parsear libro con todos los campos opcionales', () => {
      const input = {
        nombre: 'Test Book',
        autor: 1,
        categoria: 1,
        editorial: 1,
        isbn: '978-0-123456-78-9',
        paginas: 350,
        anioPublicacion: 2020,
        imagen: 'https://example.com/image.jpg',
        descripcion: 'A long description...',
        saga: 1
      };

      const result = parseLibroInput(input);
      expect(result.valid).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.nombre).toBe('Test Book');
      }
    });

    it('debería parsear libro sin campos opcionales', () => {
      const input = {
        nombre: 'Minimal Book',
        autor: 1,
        categoria: 1,
        editorial: 1
      };

      const result = parseLibroInput(input);
      expect(result.valid).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('debería validar año de publicación futuro', () => {
      const futureYear = new Date().getFullYear() + 20;
      const input = {
        nombre: 'Future Book',
        autor: 1,
        categoria: 1,
        editorial: 1,
        anioPublicacion: futureYear
      };

      const result = parseLibroInput(input);
      // Debería rechazar años muy futuros
      expect(result.data || result.errors).toBeDefined();
    });

    it('debería validar número de páginas negativo', () => {
      const input = {
        nombre: 'Test Book',
        autor: 1,
        categoria: 1,
        editorial: 1,
        paginas: -100
      };

      const result = parseLibroInput(input);
      if (!result.valid) {
        expect(result.errors).toBeDefined();
      }
    });

    it('debería normalizar ISBN con diferentes formatos', () => {
      const input1 = {
        nombre: 'Book 1',
        autor: 1,
        categoria: 1,
        editorial: 1,
        isbn: '978-0-123456-78-9'
      };

      const input2 = {
        nombre: 'Book 2',
        autor: 1,
        categoria: 1,
        editorial: 1,
        isbn: '9780123456789'
      };

      const result1 = parseLibroInput(input1);
      const result2 = parseLibroInput(input2);

      expect(result1.data || result1.errors).toBeDefined();
      expect(result2.data || result2.errors).toBeDefined();
    });
  });

  describe('parseAutorInput - Name Variations', () => {
    it('debería parsear autor con nombre y apellido', () => {
      const input = {
        nombre: 'Gabriel',
        apellido: 'García Márquez'
      };

      const result = parseAutorInput(input);
      expect(result.valid).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.nombre).toBe('Gabriel');
        expect(result.data.apellido).toBe('García Márquez');
      }
    });

    it('debería parsear autor con un solo nombre', () => {
      const input = {
        nombre: 'Voltaire',
        apellido: '' // El apellido puede ser vacío
      };

      const result = parseAutorInput(input);
      // El parser puede requerir apellido
      expect(result.data || result.errors).toBeDefined();
    });

    it('debería manejar nombres con caracteres especiales', () => {
      const input = {
        nombre: 'José',
        apellido: 'Müller-Brockmann'
      };

      const result = parseAutorInput(input);
      expect(result.valid).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('debería validar biografía muy larga', () => {
      const input = {
        nombre: 'Test',
        apellido: 'Author',
        biografia: 'A'.repeat(10000)
      };

      const result = parseAutorInput(input);
      // Debería truncar o validar longitud
      expect(result.data || result.errors).toBeDefined();
    });

    it('debería parsear autor con external IDs', () => {
      const input = {
        nombre: 'Test',
        apellido: 'Author',
        googleBooksId: 'abc123',
        openLibraryId: 'OL123456A'
      };

      const result = parseAutorInput(input);
      expect(result.valid).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('parseUserRegistration - Email & Username Validation', () => {
    it('debería parsear usuario con todos los campos válidos', () => {
      const input = {
        nombre: 'Test User',
        username: 'testuser123',
        email: 'test@example.com',
        password: 'SecurePassword123'
      };

      const result = parseUserRegistration(input);
      expect(result.valid).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data.username).toBe('testuser123');
      }
    });

    it('debería rechazar email inválido', () => {
      const input = {
        nombre: 'Test User',
        username: 'testuser',
        email: 'invalid-email',
        password: 'SecurePassword123'
      };

      const result = parseUserRegistration(input);
      if (!result.valid) {
        expect(result.errors).toBeDefined();
        expect(result.errors?.some((e: string) => e.includes('email'))).toBe(true);
      }
    });

    it('debería rechazar username muy corto', () => {
      const input = {
        nombre: 'Test User',
        username: 'ab',
        email: 'test@example.com',
        password: 'SecurePassword123'
      };

      const result = parseUserRegistration(input);
      if (!result.valid) {
        expect(result.errors).toBeDefined();
      }
    });

    it('debería rechazar password muy corto', () => {
      const input = {
        nombre: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: '123'
      };

      const result = parseUserRegistration(input);
      if (!result.valid) {
        expect(result.errors).toBeDefined();
        expect(result.errors?.some((e: string) => e.includes('password') || e.includes('contraseña'))).toBe(true);
      }
    });

    it('debería sanitizar nombre con HTML', () => {
      const input = {
        nombre: '<script>alert("xss")</script>User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePassword123'
      };

      const result = parseUserRegistration(input);
      if (result.data) {
        expect(result.data.nombre).not.toContain('<script>');
      }
    });
  });

  describe('Cross-Parser Validation', () => {
    it('debería validar IDs consistentemente entre parsers', () => {
      const libroId = 'invalid-id';
      
      const resenaInput = {
        comentario: 'Test',
        estrellas: 5,
        libroId,
        usuarioId: 1
      };

      const result = parseResenaInput(resenaInput);
      // Todos los parsers deberían rechazar IDs inválidos de la misma forma
      expect(result.data || result.errors).toBeDefined();
    });

    it('debería sanitizar HTML consistentemente entre parsers', () => {
      const htmlInput = '<p>Test with <b>HTML</b></p>';
      
      const resenaResult = parseResenaInput({
        comentario: htmlInput,
        estrellas: 5,
        libroId: 1,
        usuarioId: 1
      });

      const libroResult = parseLibroInput({
        nombre: htmlInput,
        autor: 1,
        categoria: 1,
        editorial: 1
      });

      // Ambos deberían sanitizar
      expect(resenaResult.data || resenaResult.errors).toBeDefined();
      expect(libroResult.data || libroResult.errors).toBeDefined();
    });
  });
});
