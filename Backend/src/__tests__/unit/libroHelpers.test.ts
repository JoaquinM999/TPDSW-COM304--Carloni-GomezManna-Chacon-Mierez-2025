// src/__tests__/unit/libroHelpers.test.ts
import { describe, it, expect, vi } from 'vitest';
import type { EntityManager } from '@mikro-orm/mysql';
import {
  findOrCreateAutorLibro,
  findLibroRelatedEntities,
  createLibroEntity,
  validateLibroCreationData,
  type LibroRelatedEntities,
} from '../../utils/libroHelpers';
import type { Autor } from '../../entities/autor.entity';
import type { Categoria } from '../../entities/categoria.entity';
import type { Editorial } from '../../entities/editorial.entity';
import type { Saga } from '../../entities/saga.entity';
import type { Libro } from '../../entities/libro.entity';

describe('libroHelpers - validateLibroCreationData (función pura)', () => {
  it('debería validar datos correctos', () => {
    const data = {
      nombreAutor: 'Gabriel',
      apellidoAutor: 'García Márquez',
      categoriaId: 1,
      editorialId: 2,
      nombre: 'Cien años de soledad',
    };

    const result = validateLibroCreationData(data);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('debería rechazar si falta nombreAutor', () => {
    const data = {
      apellidoAutor: 'García Márquez',
      categoriaId: 1,
      editorialId: 2,
      nombre: 'Libro',
    };

    const result = validateLibroCreationData(data);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Nombre y apellido del autor son requeridos');
  });

  it('debería rechazar si falta apellidoAutor', () => {
    const data = {
      nombreAutor: 'Gabriel',
      categoriaId: 1,
      editorialId: 2,
      nombre: 'Libro',
    };

    const result = validateLibroCreationData(data);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Nombre y apellido del autor son requeridos');
  });

  it('debería rechazar si falta categoriaId', () => {
    const data = {
      nombreAutor: 'Gabriel',
      apellidoAutor: 'García Márquez',
      editorialId: 2,
      nombre: 'Libro',
    };

    const result = validateLibroCreationData(data);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('La categoría es requerida');
  });

  it('debería rechazar si falta editorialId', () => {
    const data = {
      nombreAutor: 'Gabriel',
      apellidoAutor: 'García Márquez',
      categoriaId: 1,
      nombre: 'Libro',
    };

    const result = validateLibroCreationData(data);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('La editorial es requerida');
  });

  it('debería rechazar si falta nombre del libro', () => {
    const data = {
      nombreAutor: 'Gabriel',
      apellidoAutor: 'García Márquez',
      categoriaId: 1,
      editorialId: 2,
    };

    const result = validateLibroCreationData(data);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('El nombre del libro es requerido');
  });

  it('debería aceptar sagaId opcional', () => {
    const data = {
      nombreAutor: 'J.K.',
      apellidoAutor: 'Rowling',
      categoriaId: 1,
      editorialId: 2,
      nombre: 'Harry Potter',
      sagaId: 5,
    };

    const result = validateLibroCreationData(data);

    expect(result.valid).toBe(true);
  });
});

describe('libroHelpers - findOrCreateAutorLibro (con mock)', () => {
  it('debería encontrar autor existente', async () => {
    const mockAutor = {
      id: 1,
      nombre: 'J.R.R.',
      apellido: 'Tolkien',
      createdAt: new Date(),
    } as Autor;

    const mockEM = {
      findOne: vi.fn().mockResolvedValue(mockAutor),
    } as unknown as EntityManager;

    const result = await findOrCreateAutorLibro(mockEM, 'J.R.R.', 'Tolkien');

    expect(result).toEqual(mockAutor);
    expect(mockEM.findOne).toHaveBeenCalledWith(expect.anything(), {
      nombre: 'J.R.R.',
      apellido: 'Tolkien',
    });
  });

  it('debería crear autor si no existe', async () => {
    const mockAutor = {
      id: 2,
      nombre: 'Brandon',
      apellido: 'Sanderson',
      createdAt: expect.any(Date),
    } as Autor;

    const mockEM = {
      findOne: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockReturnValue(mockAutor),
      persist: vi.fn().mockResolvedValue(undefined),
    } as unknown as EntityManager;

    const result = await findOrCreateAutorLibro(mockEM, 'Brandon', 'Sanderson');

    expect(mockEM.findOne).toHaveBeenCalledTimes(1);
    expect(mockEM.create).toHaveBeenCalledWith(expect.anything(), {
      nombre: 'Brandon',
      apellido: 'Sanderson',
      createdAt: expect.any(Date),
    });
    expect(mockEM.persist).toHaveBeenCalledWith(mockAutor);
    expect(result).toEqual(mockAutor);
  });

  it('debería manejar nombres con espacios', async () => {
    const mockEM = {
      findOne: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockReturnValue({} as Autor),
      persist: vi.fn().mockResolvedValue(undefined),
    } as unknown as EntityManager;

    await findOrCreateAutorLibro(mockEM, 'Gabriel García', 'Márquez');

    expect(mockEM.findOne).toHaveBeenCalledWith(expect.anything(), {
      nombre: 'Gabriel García',
      apellido: 'Márquez',
    });
  });
});

describe('libroHelpers - findLibroRelatedEntities (con mock)', () => {
  it('debería encontrar todas las entidades relacionadas sin saga', async () => {
    const mockCategoria = { id: 1, nombre: 'Ficción' } as Categoria;
    const mockEditorial = { id: 2, nombre: 'Editorial Planeta' } as Editorial;

    const mockEM = {
      findOne: vi.fn()
        .mockResolvedValueOnce(mockCategoria)
        .mockResolvedValueOnce(mockEditorial),
    } as unknown as EntityManager;

    const result = await findLibroRelatedEntities(mockEM, 1, 2);

    expect(result).not.toHaveProperty('error');
    expect((result as LibroRelatedEntities).categoria).toEqual(mockCategoria);
    expect((result as LibroRelatedEntities).editorial).toEqual(mockEditorial);
    expect((result as LibroRelatedEntities).saga).toBeUndefined();
  });

  it('debería encontrar todas las entidades relacionadas con saga', async () => {
    const mockCategoria = { id: 1, nombre: 'Ficción' } as Categoria;
    const mockEditorial = { id: 2, nombre: 'Editorial' } as Editorial;
    const mockSaga = { id: 3, nombre: 'Harry Potter' } as Saga;

    const mockEM = {
      findOne: vi.fn()
        .mockResolvedValueOnce(mockCategoria)
        .mockResolvedValueOnce(mockEditorial)
        .mockResolvedValueOnce(mockSaga),
    } as unknown as EntityManager;

    const result = await findLibroRelatedEntities(mockEM, 1, 2, 3);

    expect(result).not.toHaveProperty('error');
    expect((result as LibroRelatedEntities).categoria).toEqual(mockCategoria);
    expect((result as LibroRelatedEntities).editorial).toEqual(mockEditorial);
    expect((result as LibroRelatedEntities).saga).toEqual(mockSaga);
  });

  it('debería retornar error si categoría no existe', async () => {
    const mockEditorial = { id: 2, nombre: 'Editorial' } as Editorial;

    const mockEM = {
      findOne: vi.fn()
        .mockResolvedValueOnce(null) // categoría no existe
        .mockResolvedValueOnce(mockEditorial),
    } as unknown as EntityManager;

    const result = await findLibroRelatedEntities(mockEM, 1, 2);

    expect(result).toHaveProperty('error');
    expect((result as any).error).toBe('Categoría o editorial no encontrada');
  });

  it('debería retornar error si editorial no existe', async () => {
    const mockCategoria = { id: 1, nombre: 'Ficción' } as Categoria;

    const mockEM = {
      findOne: vi.fn()
        .mockResolvedValueOnce(mockCategoria)
        .mockResolvedValueOnce(null), // editorial no existe
    } as unknown as EntityManager;

    const result = await findLibroRelatedEntities(mockEM, 1, 2);

    expect(result).toHaveProperty('error');
    expect((result as any).error).toBe('Categoría o editorial no encontrada');
  });

  it('debería retornar error si ambas no existen', async () => {
    const mockEM = {
      findOne: vi.fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null),
    } as unknown as EntityManager;

    const result = await findLibroRelatedEntities(mockEM, 1, 2);

    expect(result).toHaveProperty('error');
    expect((result as any).error).toBe('Categoría o editorial no encontrada');
  });

  it('debería manejar saga no encontrada (no es error)', async () => {
    const mockCategoria = { id: 1, nombre: 'Ficción' } as Categoria;
    const mockEditorial = { id: 2, nombre: 'Editorial' } as Editorial;

    const mockEM = {
      findOne: vi.fn()
        .mockResolvedValueOnce(mockCategoria)
        .mockResolvedValueOnce(mockEditorial)
        .mockResolvedValueOnce(null), // saga no existe
    } as unknown as EntityManager;

    const result = await findLibroRelatedEntities(mockEM, 1, 2, 999);

    expect(result).not.toHaveProperty('error');
    expect((result as LibroRelatedEntities).saga).toBeUndefined();
  });
});

describe('libroHelpers - createLibroEntity (con mock)', () => {
  it('debería crear entidad de libro con todas las relaciones', () => {
    const mockAutor = { id: 1, nombre: 'J.K.', apellido: 'Rowling' } as Autor;
    const mockCategoria = { id: 2, nombre: 'Fantasía' } as Categoria;
    const mockEditorial = { id: 3, nombre: 'Bloomsbury' } as Editorial;
    const mockSaga = { id: 4, nombre: 'Harry Potter' } as Saga;

    const mockLibro = {
      id: 100,
      nombre: 'Harry Potter y la Piedra Filosofal',
      autor: mockAutor,
      categoria: mockCategoria,
      editorial: mockEditorial,
      saga: mockSaga,
    } as Libro;

    const mockEM = {
      create: vi.fn().mockReturnValue(mockLibro),
    } as unknown as EntityManager;

    const libroData = {
      nombre: 'Harry Potter y la Piedra Filosofal',
      isbn: '123456789',
    };

    const relatedEntities: LibroRelatedEntities = {
      autor: mockAutor,
      categoria: mockCategoria,
      editorial: mockEditorial,
      saga: mockSaga,
    };

    const result = createLibroEntity(mockEM, libroData, relatedEntities);

    expect(mockEM.create).toHaveBeenCalledWith(expect.anything(), {
      nombre: 'Harry Potter y la Piedra Filosofal',
      isbn: '123456789',
      autor: mockAutor,
      categoria: mockCategoria,
      editorial: mockEditorial,
      saga: mockSaga,
    });
    expect(result).toEqual(mockLibro);
  });

  it('debería crear libro sin saga', () => {
    const mockAutor = { id: 1, nombre: 'George', apellido: 'Orwell' } as Autor;
    const mockCategoria = { id: 2, nombre: 'Distopía' } as Categoria;
    const mockEditorial = { id: 3, nombre: 'Secker' } as Editorial;

    const mockLibro = {
      id: 101,
      nombre: '1984',
      autor: mockAutor,
      categoria: mockCategoria,
      editorial: mockEditorial,
    } as Libro;

    const mockEM = {
      create: vi.fn().mockReturnValue(mockLibro),
    } as unknown as EntityManager;

    const libroData = {
      nombre: '1984',
    };

    const relatedEntities: LibroRelatedEntities = {
      autor: mockAutor,
      categoria: mockCategoria,
      editorial: mockEditorial,
    };

    const result = createLibroEntity(mockEM, libroData, relatedEntities);

    expect(mockEM.create).toHaveBeenCalledWith(expect.anything(), {
      nombre: '1984',
      autor: mockAutor,
      categoria: mockCategoria,
      editorial: mockEditorial,
      saga: undefined,
    });
    expect(result).toEqual(mockLibro);
  });

  it('debería incluir campos adicionales del libroData', () => {
    const mockEM = {
      create: vi.fn().mockReturnValue({} as Libro),
    } as unknown as EntityManager;

    const libroData = {
      nombre: 'Libro',
      isbn: '111',
      sinopsis: 'Descripción',
      imagen: 'https://imagen.jpg',
      anio_edicion: 2020,
    };

    const relatedEntities: LibroRelatedEntities = {
      autor: {} as Autor,
      categoria: {} as Categoria,
      editorial: {} as Editorial,
    };

    createLibroEntity(mockEM, libroData, relatedEntities);

    expect(mockEM.create).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        nombre: 'Libro',
        isbn: '111',
        sinopsis: 'Descripción',
        imagen: 'https://imagen.jpg',
        anio_edicion: 2020,
      })
    );
  });
});
