// src/controllers/saga.controller.ts
import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/mysql';
import { Saga } from '../entities/saga.entity';
import { AuthRequest } from '../middleware/auth.middleware';
import { Libro } from '../entities/libro.entity';
import { getBookById } from '../services/googleBooks.service';
import { Autor } from '../entities/autor.entity';

export const getSagas = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const em = orm.em.fork(); // Usar un fork para posibles escrituras
  const sagas = await orm.em.find(Saga, {}, { populate: ['libros.autor'] });

  const sagasWithCount = await Promise.all(sagas.map(async saga => {
    const librosTransformados = await Promise.all(saga.libros.getItems().map(async (libro) => {
      let autores = ['Autor desconocido'];

      if (libro.autor) {
        autores = [`${libro.autor.nombre} ${libro.autor.apellido}`.trim() || 'Autor desconocido'];
      } else if (libro.externalId) { // Si no hay autor pero sí ID externo, intentamos arreglarlo
        try {
          const googleBook = await getBookById(libro.externalId);
          if (googleBook && googleBook.autores && googleBook.autores.length > 0) {
            autores = googleBook.autores;

            // --- LÓGICA DE AUTOCORRECCIÓN ---
            // 1. Buscar o crear el autor
            const autorNombreCompleto = googleBook.autores[0];
            const partesNombre = autorNombreCompleto.split(' ');
            const nombre = partesNombre[0] || autorNombreCompleto;
            const apellido = partesNombre.slice(1).join(' ') || '';

            let autorEntity = await em.findOne(Autor, { nombre, apellido });
            if (!autorEntity) {
              autorEntity = em.create(Autor, { nombre, apellido, createdAt: new Date() });
              await em.persist(autorEntity);
            }
            // 2. Asignar el autor al libro y guardar el cambio
            libro.autor = autorEntity;
            await em.flush(); // Guardamos los cambios en la BD
          }
        } catch (error) {
          console.error('Error fetching author from Google Books:', error);
        }
      }

      return {
        id: libro.id,
        titulo: libro.nombre || 'Título desconocido',
        autores,
        descripcion: libro.sinopsis || null,
        imagen: libro.imagen || null,
        enlace: libro.enlace || null,
        externalId: libro.externalId || null,
      };
    }));

    return {
      ...saga,
      libros: librosTransformados,
      cantidadLibros: saga.libros.length
    };
  }));
  res.json(sagasWithCount);
};

export const getSagaById = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const em = orm.em.fork(); // Usar un fork para posibles escrituras
  const saga = await orm.em.findOne(Saga, { id: +req.params.id }, { populate: ['libros.autor'] });
  if (!saga) return res.status(404).json({ error: 'No encontrada' });

  // Transformar libros para incluir externalId si existe
  const librosTransformados = await Promise.all(saga.libros.getItems().map(async (libro) => {
    let autores = ['Autor desconocido'];

    if (libro.autor) {
      autores = [`${libro.autor.nombre} ${libro.autor.apellido}`.trim() || 'Autor desconocido'];
    } else if (libro.externalId) { // Si no hay autor pero sí ID externo, intentamos arreglarlo
      try {
        const googleBook = await getBookById(libro.externalId);
        if (googleBook && googleBook.autores && googleBook.autores.length > 0) {
          autores = googleBook.autores;

          // --- LÓGICA DE AUTOCORRECCIÓN ---
          // 1. Buscar o crear el autor
          const autorNombreCompleto = googleBook.autores[0];
          const partesNombre = autorNombreCompleto.split(' ');
          const nombre = partesNombre[0] || autorNombreCompleto;
          const apellido = partesNombre.slice(1).join(' ') || '';

          let autorEntity = await em.findOne(Autor, { nombre, apellido });
          if (!autorEntity) {
            autorEntity = em.create(Autor, { nombre, apellido, createdAt: new Date() });
            await em.persist(autorEntity);
          }
          // 2. Asignar el autor al libro y guardar el cambio
          libro.autor = autorEntity;
          await em.flush(); // Guardamos los cambios en la BD
        }
      } catch (error) {
        console.error('Error fetching author from Google Books:', error);
      }
    }

    return {
      id: libro.id,
      titulo: libro.nombre || 'Título desconocido',
      autores,
      descripcion: libro.sinopsis || null,
      imagen: libro.imagen || null,
      enlace: libro.enlace || null,
      externalId: libro.externalId || null,
    };
  }));

  res.json({
    ...saga,
    libros: librosTransformados,
  });
};

export const createSaga = async (req: AuthRequest, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const { nombre, libroIds } = req.body;

  try {
    // Validation
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la saga es requerido' });
    }

    if (!Array.isArray(libroIds) || libroIds.length === 0) {
      return res.status(400).json({ error: 'Debe seleccionar al menos un libro' });
    }

    // Verify all books exist
    const libros = await orm.em.find(Libro, { id: { $in: libroIds } });
    if (libros.length !== libroIds.length) {
      return res.status(400).json({ error: 'Uno o más libros no existen' });
    }

    // Create saga and associate books in transaction
    await orm.em.transactional(async (em) => {
      const saga = em.create(Saga, { nombre: nombre.trim(), createdAt: new Date() });
      saga.libros.set(libros);
      await em.persistAndFlush(saga);
    });

    // Fetch the created saga with populated books
    const createdSaga = await orm.em.findOne(Saga, { nombre: nombre.trim() }, { populate: ['libros.autor'] });
    res.status(201).json(createdSaga);
  } catch (error) {
    console.error('Error creating saga:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateSaga = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const saga = await orm.em.findOne(Saga, { id: +req.params.id });
  if (!saga) return res.status(404).json({ error: 'No encontrada' });
  orm.em.assign(saga, req.body);
  await orm.em.flush();
  res.json(saga);
};

export const deleteSaga = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const saga = await orm.em.findOne(Saga, { id: +req.params.id });
  if (!saga) return res.status(404).json({ error: 'No encontrada' });
  await orm.em.removeAndFlush(saga);
  res.json({ mensaje: 'Eliminada' });
};
