import { describe, it, expect } from 'vitest';
import { validateSagaData } from '../../utils/sagaHelpers';

describe('sagaHelpers - validateSagaData', () => {
  it('debería validar datos correctos', () => {
    const result = validateSagaData('Harry Potter', [1, 2, 3]);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('debería rechazar nombre null', () => {
    const result = validateSagaData(null, [1, 2]);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('El nombre de la saga es requerido');
  });

  it('debería rechazar nombre undefined', () => {
    const result = validateSagaData(undefined, [1, 2]);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('El nombre de la saga es requerido');
  });

  it('debería rechazar nombre vacío', () => {
    const result = validateSagaData('', [1, 2]);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('El nombre de la saga es requerido');
  });

  it('debería rechazar nombre con solo espacios', () => {
    const result = validateSagaData('   ', [1, 2]);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('El nombre de la saga es requerido');
  });

  it('debería rechazar nombre que no es string (número)', () => {
    const result = validateSagaData(123, [1, 2]);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('El nombre de la saga es requerido');
  });

  it('debería rechazar nombre que no es string (objeto)', () => {
    const result = validateSagaData({ name: 'Saga' }, [1, 2]);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('El nombre de la saga es requerido');
  });

  it('debería rechazar nombre que no es string (array)', () => {
    const result = validateSagaData(['Saga'], [1, 2]);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('El nombre de la saga es requerido');
  });

  it('debería rechazar libroIds que no es array', () => {
    const result = validateSagaData('Saga Name', 'not an array');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Debe seleccionar al menos un libro');
  });

  it('debería rechazar libroIds null', () => {
    const result = validateSagaData('Saga Name', null);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Debe seleccionar al menos un libro');
  });

  it('debería rechazar libroIds undefined', () => {
    const result = validateSagaData('Saga Name', undefined);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Debe seleccionar al menos un libro');
  });

  it('debería rechazar libroIds array vacío', () => {
    const result = validateSagaData('Saga Name', []);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Debe seleccionar al menos un libro');
  });

  it('debería aceptar un solo libro', () => {
    const result = validateSagaData('Saga Name', [1]);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('debería aceptar múltiples libros', () => {
    const result = validateSagaData('Saga Name', [1, 2, 3, 4, 5]);
    expect(result.valid).toBe(true);
  });

  it('debería aceptar nombre con espacios', () => {
    const result = validateSagaData('The Lord of the Rings', [1, 2, 3]);
    expect(result.valid).toBe(true);
  });

  it('debería aceptar nombre con caracteres especiales', () => {
    const result = validateSagaData('Crónicas de Narnia', [1, 2]);
    expect(result.valid).toBe(true);
  });

  it('debería aceptar nombre con números', () => {
    const result = validateSagaData('Fundación 3', [1]);
    expect(result.valid).toBe(true);
  });

  it('debería aceptar libroIds con IDs negativos', () => {
    // Aunque los IDs negativos no son normales, la validación no lo restringe
    const result = validateSagaData('Saga', [-1, -2]);
    expect(result.valid).toBe(true);
  });

  it('debería aceptar libroIds con strings (validación no es estricta)', () => {
    // La validación solo verifica que sea array no vacío
    const result = validateSagaData('Saga', ['1', '2']);
    expect(result.valid).toBe(true);
  });

  it('debería rechazar ambos parámetros inválidos', () => {
    const result = validateSagaData('', []);
    expect(result.valid).toBe(false);
    // Verifica que el error sea del nombre (primera validación)
    expect(result.error).toBe('El nombre de la saga es requerido');
  });

  it('debería preservar espacios alrededor del nombre válido', () => {
    // La función hace trim internamente, pero acepta el nombre
    const result = validateSagaData('  Saga Name  ', [1]);
    expect(result.valid).toBe(true);
  });
});

// ============================================
// TESTS CON MOCKS DE ENTITYMANAGER
// ============================================

import { vi } from 'vitest';
import type { EntityManager } from '@mikro-orm/mysql';
import {
  findOrCreateAutor,
  getAuthorFromExternalAPI,
  assignAutorToLibro,
  getLibroAutores,
  transformarLibro,
  transformarLibros,
} from '../../utils/sagaHelpers';
import type { Autor } from '../../entities/autor.entity';
import type { Libro } from '../../entities/libro.entity';

// Mock del servicio de Google Books
vi.mock('../../services/googleBooks.service', () => ({
  getBookById: vi.fn(),
}));

import { getBookById } from '../../services/googleBooks.service';

describe('sagaHelpers - findOrCreateAutor (con mock)', () => {
  it('debería encontrar autor existente', async () => {
    const mockAutor = { 
      id: 1, 
      nombre: 'Gabriel', 
      apellido: 'García Márquez',
      createdAt: new Date()
    };
    
    const mockEM = {
      findOne: vi.fn().mockResolvedValue(mockAutor),
    } as unknown as EntityManager;

    const result = await findOrCreateAutor(mockEM, 'Gabriel García Márquez');

    expect(result).toEqual(mockAutor);
    expect(mockEM.findOne).toHaveBeenCalledWith(
      expect.anything(),
      { nombre: 'Gabriel', apellido: 'García Márquez' }
    );
  });

  it('debería crear autor si no existe', async () => {
    const mockAutor = { 
      id: 2, 
      nombre: 'Isabel', 
      apellido: 'Allende',
      createdAt: expect.any(Date)
    };
    
    const mockEM = {
      findOne: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockReturnValue(mockAutor),
      persist: vi.fn().mockResolvedValue(undefined),
    } as unknown as EntityManager;

    const result = await findOrCreateAutor(mockEM, 'Isabel Allende');

    expect(mockEM.findOne).toHaveBeenCalledTimes(1);
    expect(mockEM.create).toHaveBeenCalledWith(
      expect.anything(),
      { nombre: 'Isabel', apellido: 'Allende', createdAt: expect.any(Date) }
    );
    expect(mockEM.persist).toHaveBeenCalledWith(mockAutor);
    expect(result).toEqual(mockAutor);
  });

  it('debería manejar nombre sin apellido', async () => {
    const mockAutor = { 
      id: 3, 
      nombre: 'Shakespeare', 
      apellido: '',
      createdAt: expect.any(Date)
    };
    
    const mockEM = {
      findOne: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockReturnValue(mockAutor),
      persist: vi.fn().mockResolvedValue(undefined),
    } as unknown as EntityManager;

    await findOrCreateAutor(mockEM, 'Shakespeare');

    expect(mockEM.create).toHaveBeenCalledWith(
      expect.anything(),
      { nombre: 'Shakespeare', apellido: '', createdAt: expect.any(Date) }
    );
  });

  it('debería manejar nombre con múltiples apellidos', async () => {
    const mockEM = {
      findOne: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockReturnValue({}),
      persist: vi.fn().mockResolvedValue(undefined),
    } as unknown as EntityManager;

    await findOrCreateAutor(mockEM, 'Juan Pablo Pérez García');

    expect(mockEM.findOne).toHaveBeenCalledWith(
      expect.anything(),
      { nombre: 'Juan', apellido: 'Pablo Pérez García' }
    );
  });
});

describe('sagaHelpers - getAuthorFromExternalAPI (con mock)', () => {
  it('debería retornar autores desde Google Books API', async () => {
    const mockGoogleBook = {
      autores: ['J.K. Rowling', 'Mary GrandPré'],
    };
    
    vi.mocked(getBookById).mockResolvedValue(mockGoogleBook as any);

    const result = await getAuthorFromExternalAPI('abc123');

    expect(result).toEqual(['J.K. Rowling', 'Mary GrandPré']);
    expect(getBookById).toHaveBeenCalledWith('abc123');
  });

  it('debería retornar null si no hay autores en el resultado', async () => {
    const mockGoogleBook = {
      autores: [],
    };
    
    vi.mocked(getBookById).mockResolvedValue(mockGoogleBook as any);

    const result = await getAuthorFromExternalAPI('abc123');

    expect(result).toBeNull();
  });

  it('debería retornar null si la API falla', async () => {
    vi.mocked(getBookById).mockRejectedValue(new Error('API Error'));

    const result = await getAuthorFromExternalAPI('abc123');

    expect(result).toBeNull();
  });

  it('debería retornar null si el libro no tiene campo autores', async () => {
    const mockGoogleBook = {
      titulo: 'Libro sin autores',
    };
    
    vi.mocked(getBookById).mockResolvedValue(mockGoogleBook as any);

    const result = await getAuthorFromExternalAPI('abc123');

    expect(result).toBeNull();
  });
});

describe('sagaHelpers - assignAutorToLibro (con mock)', () => {
  it('debería asignar autor al libro', async () => {
    const mockAutor = { 
      id: 1, 
      nombre: 'Stephen', 
      apellido: 'King',
      createdAt: new Date()
    };
    
    const mockLibro = {
      id: 100,
      nombre: 'It',
      autor: null,
    } as unknown as Libro;

    const mockEM = {
      findOne: vi.fn().mockResolvedValue(mockAutor),
      flush: vi.fn().mockResolvedValue(undefined),
    } as unknown as EntityManager;

    await assignAutorToLibro(mockEM, mockLibro, 'Stephen King');

    expect(mockLibro.autor).toEqual(mockAutor);
    expect(mockEM.flush).toHaveBeenCalledTimes(1);
  });

  it('debería crear y asignar autor si no existe', async () => {
    const mockAutor = { 
      id: 2, 
      nombre: 'Brandon', 
      apellido: 'Sanderson',
      createdAt: expect.any(Date)
    };
    
    const mockLibro = {
      id: 101,
      nombre: 'Mistborn',
      autor: null,
    } as unknown as Libro;

    const mockEM = {
      findOne: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockReturnValue(mockAutor),
      persist: vi.fn().mockResolvedValue(undefined),
      flush: vi.fn().mockResolvedValue(undefined),
    } as unknown as EntityManager;

    await assignAutorToLibro(mockEM, mockLibro, 'Brandon Sanderson');

    expect(mockLibro.autor).toEqual(mockAutor);
    expect(mockEM.flush).toHaveBeenCalledTimes(1);
  });
});

describe('sagaHelpers - getLibroAutores (con mock)', () => {
  it('debería retornar autor si el libro ya tiene autor', async () => {
    const mockLibro = {
      id: 1,
      autor: { nombre: 'J.R.R.', apellido: 'Tolkien' },
    } as unknown as Libro;

    const mockEM = {} as EntityManager;

    const result = await getLibroAutores(mockEM, mockLibro);

    expect(result).toEqual(['J.R.R. Tolkien']);
  });

  it('debería buscar en API si libro tiene externalId pero no autor', async () => {
    const mockLibro = {
      id: 2,
      externalId: 'google123',
      autor: null,
    } as unknown as Libro;

    vi.mocked(getBookById).mockResolvedValue({
      autores: ['George Orwell'],
    } as any);

    const mockEM = {
      findOne: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockReturnValue({ nombre: 'George', apellido: 'Orwell' }),
      persist: vi.fn().mockResolvedValue(undefined),
      flush: vi.fn().mockResolvedValue(undefined),
    } as unknown as EntityManager;

    const result = await getLibroAutores(mockEM, mockLibro);

    expect(result).toEqual(['George Orwell']);
    expect(getBookById).toHaveBeenCalledWith('google123');
  });

  it('debería retornar "Autor desconocido" si no hay autor ni externalId', async () => {
    const mockLibro = {
      id: 3,
      autor: null,
      externalId: null,
    } as unknown as Libro;

    const mockEM = {} as EntityManager;

    const result = await getLibroAutores(mockEM, mockLibro);

    expect(result).toEqual(['Autor desconocido']);
  });

  it('debería retornar "Autor desconocido" si API falla', async () => {
    const mockLibro = {
      id: 4,
      externalId: 'google456',
      autor: null,
    } as unknown as Libro;

    vi.mocked(getBookById).mockRejectedValue(new Error('API Error'));

    const mockEM = {} as EntityManager;

    const result = await getLibroAutores(mockEM, mockLibro);

    expect(result).toEqual(['Autor desconocido']);
  });
});

describe('sagaHelpers - transformarLibro (con mock)', () => {
  it('debería transformar libro con autor', async () => {
    const mockLibro = {
      id: 1,
      nombre: 'El Señor de los Anillos',
      sinopsis: 'Épica fantasía',
      imagen: 'https://cover.jpg',
      enlace: 'https://libro.com',
      externalId: 'google789',
      autor: { nombre: 'J.R.R.', apellido: 'Tolkien' },
    } as unknown as Libro;

    const mockEM = {} as EntityManager;

    const result = await transformarLibro(mockEM, mockLibro);

    expect(result).toEqual({
      id: 1,
      titulo: 'El Señor de los Anillos',
      autores: ['J.R.R. Tolkien'],
      descripcion: 'Épica fantasía',
      imagen: 'https://cover.jpg',
      enlace: 'https://libro.com',
      externalId: 'google789',
    });
  });

  it('debería manejar libro sin datos opcionales', async () => {
    const mockLibro = {
      id: 2,
      nombre: 'Libro Básico',
      sinopsis: null,
      imagen: null,
      enlace: null,
      externalId: null,
      autor: null,
    } as unknown as Libro;

    const mockEM = {} as EntityManager;

    const result = await transformarLibro(mockEM, mockLibro);

    expect(result).toEqual({
      id: 2,
      titulo: 'Libro Básico',
      autores: ['Autor desconocido'],
      descripcion: null,
      imagen: null,
      enlace: null,
      externalId: null,
    });
  });

  it('debería usar "Título desconocido" si nombre está vacío', async () => {
    const mockLibro = {
      id: 3,
      nombre: null,
      autor: null,
    } as unknown as Libro;

    const mockEM = {} as EntityManager;

    const result = await transformarLibro(mockEM, mockLibro);

    expect(result.titulo).toBe('Título desconocido');
  });
});

describe('sagaHelpers - transformarLibros (con mock)', () => {
  it('debería transformar múltiples libros', async () => {
    const mockLibros = [
      {
        id: 1,
        nombre: 'Libro 1',
        autor: { nombre: 'Autor', apellido: 'Uno' },
      },
      {
        id: 2,
        nombre: 'Libro 2',
        autor: { nombre: 'Autor', apellido: 'Dos' },
      },
    ] as unknown as Libro[];

    const mockEM = {} as EntityManager;

    const result = await transformarLibros(mockEM, mockLibros);

    expect(result).toHaveLength(2);
    expect(result[0].titulo).toBe('Libro 1');
    expect(result[0].autores).toEqual(['Autor Uno']);
    expect(result[1].titulo).toBe('Libro 2');
    expect(result[1].autores).toEqual(['Autor Dos']);
  });

  it('debería retornar array vacío si no hay libros', async () => {
    const mockEM = {} as EntityManager;

    const result = await transformarLibros(mockEM, []);

    expect(result).toEqual([]);
  });

  it('debería manejar libros sin autor', async () => {
    const mockLibros = [
      {
        id: 1,
        nombre: 'Libro sin autor',
        autor: null,
        externalId: null,
      },
    ] as unknown as Libro[];

    const mockEM = {} as EntityManager;

    const result = await transformarLibros(mockEM, mockLibros);

    expect(result).toHaveLength(1);
    expect(result[0].autores).toEqual(['Autor desconocido']);
  });
});
