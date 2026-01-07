import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  serializarResenaCompleta,
  ordenarRespuestasPorFecha
} from '../../src/utils/resenaHelpers';
import { Resena } from '../../src/entities/resena.entity';
import { Collection } from '@mikro-orm/core';

describe('resenaSerializationHelpers - serializarResenaCompleta', () => {
  it('debería serializar una reseña con todas sus relaciones', () => {
    const mockResena = {
      id: 1,
      comentario: 'Excelente libro',
      estrellas: 5,
      estado: 'APPROVED',
      fechaResena: new Date('2024-01-01'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      usuario: {
        id: 10,
        nombre: 'Juan Pérez',
        username: 'juanp',
        email: 'juan@example.com',
        avatar: 'avatar.jpg'
      },
      libro: {
        id: 5,
        nombre: 'El Quijote',
        externalId: 'ext-123',
        imagen: 'libro.jpg',
        autor: {
          id: 2,
          nombre: 'Cervantes'
        }
      },
      reacciones: [
        { id: 1, tipo: 'like', usuario: { id: 11 }, fecha: new Date() },
        { id: 2, tipo: 'like', usuario: { id: 12 }, fecha: new Date() },
        { id: 3, tipo: 'dislike', usuario: { id: 13 }, fecha: new Date() }
      ],
      respuestas: []
    };

    const result = serializarResenaCompleta(mockResena);

    expect(result).toMatchObject({
      id: 1,
      comentario: 'Excelente libro',
      estrellas: 5,
      estado: 'APPROVED',
      usuario: {
        id: 10,
        nombre: 'Juan Pérez',
        username: 'juanp'
      },
      libro: {
        id: 5,
        nombre: 'El Quijote'
      },
      reaccionesCount: {
        likes: 2,
        dislikes: 1,
        corazones: 0,
        total: 3
      }
    });
  });

  it('debería serializar reseña con reacciones usando getItems()', () => {
    const mockReacciones = [
      { id: 1, tipo: 'like', usuario: { id: 10 }, fecha: new Date() },
      { id: 2, tipo: 'corazon', usuario: { id: 11 }, fecha: new Date() }
    ];

    const mockResena = {
      id: 1,
      comentario: 'Test',
      estrellas: 4,
      estado: 'APPROVED',
      fechaResena: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      usuario: { id: 5, nombre: 'User', username: 'user1', email: 'user@example.com' },
      libro: null,
      reacciones: {
        getItems: () => mockReacciones
      },
      respuestas: []
    };

    const result = serializarResenaCompleta(mockResena);

    expect(result.reaccionesCount).toEqual({
      likes: 1,
      dislikes: 0,
      corazones: 1,
      total: 2
    });
    expect(result.reacciones).toHaveLength(2);
  });

  it('debería serializar reseña con respuestas recursivamente', () => {
    const mockRespuesta = {
      id: 2,
      comentario: 'Respuesta 1',
      estrellas: 4,
      estado: 'APPROVED',
      fechaResena: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      usuario: { id: 20, nombre: 'Responder', username: 'resp1', email: 'resp@example.com' },
      libro: null,
      reacciones: [],
      respuestas: []
    };

    const mockResena = {
      id: 1,
      comentario: 'Comentario principal',
      estrellas: 5,
      estado: 'APPROVED',
      fechaResena: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      usuario: { id: 10, nombre: 'Author', username: 'auth1', email: 'auth@example.com' },
      libro: null,
      reacciones: [],
      respuestas: [mockRespuesta]
    };

    const result = serializarResenaCompleta(mockResena);

    expect(result.respuestas).toHaveLength(1);
    expect(result.respuestas[0]).toMatchObject({
      id: 2,
      comentario: 'Respuesta 1',
      usuario: {
        id: 20,
        nombre: 'Responder'
      }
    });
  });

  it('debería incluir resenaPadre si includeParent es true', () => {
    const mockResenaPadre = {
      id: 5,
      comentario: 'Comentario padre',
      usuario: { id: 50, username: 'padre' }
    };

    const mockResena = {
      id: 10,
      comentario: 'Comentario hijo',
      estrellas: 4,
      estado: 'APPROVED',
      fechaResena: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      usuario: { id: 20, nombre: 'Hijo', username: 'hijo1', email: 'hijo@example.com' },
      libro: null,
      reacciones: [],
      respuestas: [],
      resenaPadre: mockResenaPadre
    };

    const result = serializarResenaCompleta(mockResena, true);

    expect(result.resenaPadre).toBeDefined();
    expect(result.resenaPadre).toMatchObject({
      id: 5,
      comentario: 'Comentario padre',
      usuario: {
        id: 50,
        username: 'padre'
      }
    });
  });

  it('NO debería incluir resenaPadre si includeParent es false', () => {
    const mockResenaPadre = {
      id: 5,
      comentario: 'Comentario padre',
      usuario: { id: 50, username: 'padre' }
    };

    const mockResena = {
      id: 10,
      comentario: 'Comentario hijo',
      estrellas: 4,
      estado: 'APPROVED',
      fechaResena: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      usuario: { id: 20, nombre: 'Hijo', username: 'hijo1', email: 'hijo@example.com' },
      libro: null,
      reacciones: [],
      respuestas: [],
      resenaPadre: mockResenaPadre
    };

    const result = serializarResenaCompleta(mockResena, false);

    expect(result.resenaPadre).toBeUndefined();
  });

  it('debería manejar reseña sin libro', () => {
    const mockResena = {
      id: 1,
      comentario: 'Sin libro',
      estrellas: 3,
      estado: 'APPROVED',
      fechaResena: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      usuario: { id: 10, nombre: 'User', username: 'user1', email: 'user@example.com' },
      libro: null,
      reacciones: [],
      respuestas: []
    };

    const result = serializarResenaCompleta(mockResena);

    expect(result.libro).toBeNull();
  });

  it('debería manejar libro sin autor', () => {
    const mockResena = {
      id: 1,
      comentario: 'Test',
      estrellas: 4,
      estado: 'APPROVED',
      fechaResena: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      usuario: { id: 10, nombre: 'User', username: 'user1', email: 'user@example.com' },
      libro: {
        id: 5,
        nombre: 'Libro sin autor',
        externalId: 'ext-456',
        imagen: 'libro.jpg',
        autor: null
      },
      reacciones: [],
      respuestas: []
    };

    const result = serializarResenaCompleta(mockResena);

    expect(result.libro).toBeDefined();
    expect(result.libro.autor).toBeNull();
  });

  it('debería contar correctamente diferentes tipos de reacciones', () => {
    const mockResena = {
      id: 1,
      comentario: 'Test',
      estrellas: 5,
      estado: 'APPROVED',
      fechaResena: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      usuario: { id: 10, nombre: 'User', username: 'user1', email: 'user@example.com' },
      libro: null,
      reacciones: [
        { id: 1, tipo: 'like', usuario: { id: 1 }, fecha: new Date() },
        { id: 2, tipo: 'like', usuario: { id: 2 }, fecha: new Date() },
        { id: 3, tipo: 'like', usuario: { id: 3 }, fecha: new Date() },
        { id: 4, tipo: 'dislike', usuario: { id: 4 }, fecha: new Date() },
        { id: 5, tipo: 'dislike', usuario: { id: 5 }, fecha: new Date() },
        { id: 6, tipo: 'corazon', usuario: { id: 6 }, fecha: new Date() },
        { id: 7, tipo: 'corazon', usuario: { id: 7 }, fecha: new Date() },
        { id: 8, tipo: 'corazon', usuario: { id: 8 }, fecha: new Date() },
        { id: 9, tipo: 'corazon', usuario: { id: 9 }, fecha: new Date() }
      ],
      respuestas: []
    };

    const result = serializarResenaCompleta(mockResena);

    expect(result.reaccionesCount).toEqual({
      likes: 3,
      dislikes: 2,
      corazones: 4,
      total: 9
    });
  });

  it('debería serializar respuestas con getItems()', () => {
    const mockRespuestas = [
      {
        id: 2,
        comentario: 'Respuesta 1',
        estrellas: 4,
        estado: 'APPROVED',
        fechaResena: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        usuario: { id: 20, nombre: 'User2', username: 'user2', email: 'user2@example.com' },
        libro: null,
        reacciones: [],
        respuestas: []
      }
    ];

    const mockResena = {
      id: 1,
      comentario: 'Principal',
      estrellas: 5,
      estado: 'APPROVED',
      fechaResena: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      usuario: { id: 10, nombre: 'User1', username: 'user1', email: 'user1@example.com' },
      libro: null,
      reacciones: [],
      respuestas: {
        getItems: () => mockRespuestas
      }
    };

    const result = serializarResenaCompleta(mockResena);

    expect(result.respuestas).toHaveLength(1);
    expect(result.respuestas[0].id).toBe(2);
  });

  it('debería serializar respuestas multinivel (respuestas de respuestas)', () => {
    const mockRespuestaNivel2 = {
      id: 3,
      comentario: 'Respuesta nivel 2',
      estrellas: 3,
      estado: 'APPROVED',
      fechaResena: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      usuario: { id: 30, nombre: 'User3', username: 'user3', email: 'user3@example.com' },
      libro: null,
      reacciones: [],
      respuestas: []
    };

    const mockRespuestaNivel1 = {
      id: 2,
      comentario: 'Respuesta nivel 1',
      estrellas: 4,
      estado: 'APPROVED',
      fechaResena: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      usuario: { id: 20, nombre: 'User2', username: 'user2', email: 'user2@example.com' },
      libro: null,
      reacciones: [],
      respuestas: [mockRespuestaNivel2]
    };

    const mockResena = {
      id: 1,
      comentario: 'Comentario principal',
      estrellas: 5,
      estado: 'APPROVED',
      fechaResena: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      usuario: { id: 10, nombre: 'User1', username: 'user1', email: 'user1@example.com' },
      libro: null,
      reacciones: [],
      respuestas: [mockRespuestaNivel1]
    };

    const result = serializarResenaCompleta(mockResena);

    expect(result.respuestas).toHaveLength(1);
    expect(result.respuestas[0].respuestas).toHaveLength(1);
    expect(result.respuestas[0].respuestas[0].id).toBe(3);
  });
});

describe('resenaSerializationHelpers - ordenarRespuestasPorFecha', () => {
  it('debería ordenar respuestas por fecha ascendente', () => {
    const mockRespuesta1 = {
      id: 1,
      fechaResena: new Date('2024-01-03'),
      respuestas: new Collection<Resena>({} as any)
    } as Resena;

    const mockRespuesta2 = {
      id: 2,
      fechaResena: new Date('2024-01-01'),
      respuestas: new Collection<Resena>({} as any)
    } as Resena;

    const mockRespuesta3 = {
      id: 3,
      fechaResena: new Date('2024-01-02'),
      respuestas: new Collection<Resena>({} as any)
    } as Resena;

    const mockRespuestas = [mockRespuesta1, mockRespuesta2, mockRespuesta3];
    const mockCollection = {
      isInitialized: () => true,
      getItems: () => mockRespuestas,
      set: vi.fn()
    } as any;

    const mockResena = {
      respuestas: mockCollection
    } as Resena;

    ordenarRespuestasPorFecha(mockResena);

    expect(mockCollection.set).toHaveBeenCalled();
    const sortedItems = mockCollection.set.mock.calls[0][0];
    expect(sortedItems[0].id).toBe(2); // 2024-01-01
    expect(sortedItems[1].id).toBe(3); // 2024-01-02
    expect(sortedItems[2].id).toBe(1); // 2024-01-03
  });

  it('NO debería procesar si respuestas no está inicializada', () => {
    const mockCollection = {
      isInitialized: () => false,
      getItems: vi.fn(),
      set: vi.fn()
    } as any;

    const mockResena = {
      respuestas: mockCollection
    } as Resena;

    ordenarRespuestasPorFecha(mockResena);

    expect(mockCollection.getItems).not.toHaveBeenCalled();
    expect(mockCollection.set).not.toHaveBeenCalled();
  });

  it('debería ordenar recursivamente respuestas anidadas', () => {
    // Respuestas nivel 2 (hijas)
    const mockRespuestaNivel2_1 = {
      id: 21,
      fechaResena: new Date('2024-01-05'),
      respuestas: new Collection<Resena>({} as any)
    } as Resena;

    const mockRespuestaNivel2_2 = {
      id: 22,
      fechaResena: new Date('2024-01-04'),
      respuestas: new Collection<Resena>({} as any)
    } as Resena;

    const mockCollectionNivel2 = {
      isInitialized: () => true,
      getItems: () => [mockRespuestaNivel2_1, mockRespuestaNivel2_2],
      set: vi.fn()
    } as any;

    // Respuesta nivel 1 con hijas
    const mockRespuestaNivel1 = {
      id: 10,
      fechaResena: new Date('2024-01-02'),
      respuestas: mockCollectionNivel2
    } as Resena;

    const mockCollectionNivel1 = {
      isInitialized: () => true,
      getItems: () => [mockRespuestaNivel1],
      set: vi.fn()
    } as any;

    const mockResena = {
      respuestas: mockCollectionNivel1
    } as Resena;

    ordenarRespuestasPorFecha(mockResena);

    // Verificar que se ordenó el nivel 1
    expect(mockCollectionNivel1.set).toHaveBeenCalled();
    
    // Verificar que se ordenó el nivel 2 (recursivo)
    expect(mockCollectionNivel2.set).toHaveBeenCalled();
    const sortedNivel2 = mockCollectionNivel2.set.mock.calls[0][0];
    expect(sortedNivel2[0].id).toBe(22); // 2024-01-04 (primero)
    expect(sortedNivel2[1].id).toBe(21); // 2024-01-05 (segundo)
  });

  it('debería manejar respuestas sin hijas', () => {
    const mockRespuesta = {
      id: 1,
      fechaResena: new Date('2024-01-01'),
      respuestas: new Collection<Resena>({} as any)
    } as Resena;

    const mockCollection = {
      isInitialized: () => true,
      getItems: () => [mockRespuesta],
      set: vi.fn()
    } as any;

    const mockResena = {
      respuestas: mockCollection
    } as Resena;

    // No debería lanzar error
    expect(() => ordenarRespuestasPorFecha(mockResena)).not.toThrow();
  });

  it('debería manejar colección vacía de respuestas', () => {
    const mockCollection = {
      isInitialized: () => true,
      getItems: () => [],
      set: vi.fn()
    } as any;

    const mockResena = {
      respuestas: mockCollection
    } as Resena;

    ordenarRespuestasPorFecha(mockResena);

    expect(mockCollection.set).toHaveBeenCalled();
    const sortedItems = mockCollection.set.mock.calls[0][0];
    expect(sortedItems).toHaveLength(0);
  });

  it('debería ordenar correctamente con fechas idénticas', () => {
    const fechaComun = new Date('2024-01-01T12:00:00');
    
    const mockRespuesta1 = {
      id: 1,
      fechaResena: fechaComun,
      respuestas: new Collection<Resena>({} as any)
    } as Resena;

    const mockRespuesta2 = {
      id: 2,
      fechaResena: fechaComun,
      respuestas: new Collection<Resena>({} as any)
    } as Resena;

    const mockCollection = {
      isInitialized: () => true,
      getItems: () => [mockRespuesta1, mockRespuesta2],
      set: vi.fn()
    } as any;

    const mockResena = {
      respuestas: mockCollection
    } as Resena;

    ordenarRespuestasPorFecha(mockResena);

    expect(mockCollection.set).toHaveBeenCalled();
    // No debería fallar con fechas idénticas
  });
});
