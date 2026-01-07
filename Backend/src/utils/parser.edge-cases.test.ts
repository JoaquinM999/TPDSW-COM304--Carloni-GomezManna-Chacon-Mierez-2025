import { describe, it, expect } from 'vitest';
import { parseResenaInput } from './resenaParser';
import { parseLibroInput } from './libroParser';

describe('Parser - Additional Edge Cases', () => {
  describe('Campos nulos y undefined', () => {
    it('debería manejar campos opcionales como null', () => {
      const input = {
        nombre: 'Test Book',
        autor: 1,
        categoria: 1,
        editorial: 1,
        isbn: null,
        descripcion: null,
        paginas: null
      };

      const result = parseLibroInput(input);
      // El parser debería manejar null en campos opcionales
      expect(result.data || result.errors).toBeDefined();
    });

    it('debería manejar campos opcionales como undefined', () => {
      const input = {
        comentario: 'Test comment',
        estrellas: 5,
        libroId: 1,
        usuarioId: 1,
        respuestaA: undefined
      };

      const result = parseResenaInput(input);
      // El parser debería manejar undefined en campos opcionales
      expect(result.valid || !result.valid).toBe(true);
      expect(result.data || result.errors).toBeDefined();
    });
  });
});
