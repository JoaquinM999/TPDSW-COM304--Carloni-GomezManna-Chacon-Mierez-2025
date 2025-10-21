// src/controllers/contenidoLista.controller.ts
import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/mysql';
import { ContenidoLista } from '../entities/contenidoLista.entity';
import { Libro } from '../entities/libro.entity';
import { Lista } from '../entities/lista.entity'; // Asegúrate de importar la entidad Lista
import { Categoria } from '../entities/categoria.entity';
import { Autor } from '../entities/autor.entity';
import { getBookById } from '../services/googleBooks.service';

export const getContenidoLista = async (req: Request, res: Response): Promise<void> => {
  const orm = req.app.get('orm') as MikroORM;
  const em = orm.em.fork(); // Usar un fork para posibles escrituras
  const listaId = Number(req.params.listaId);

  if (isNaN(listaId)) {
    res.status(400).json({ error: 'ID de lista inválido' });
    return;
  }

  const contenidos = await orm.em.find(
    ContenidoLista,
    { lista: { id: listaId } },
    { populate: ['libro.autor', 'libro.categoria', 'lista'] }
  );

  // Map to include externalId and autores array with autocorrección
  const mappedContenidos = await Promise.all(contenidos.map(async contenido => {
    let autores = ['Autor desconocido'];

    if (contenido.libro.autor) {
      autores = [`${contenido.libro.autor.nombre} ${contenido.libro.autor.apellido}`.trim() || 'Autor desconocido'];
    } else if (contenido.libro.externalId) { // Si no hay autor pero sí ID externo, intentamos arreglarlo
      try {
        const googleBook = await getBookById(contenido.libro.externalId);
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
          contenido.libro.autor = autorEntity;
          await em.flush(); // Guardamos los cambios en la BD
        }
      } catch (error) {
        console.error('Error fetching author from Google Books:', error);
      }
    }

    return {
      ...contenido,
      libro: {
        ...contenido.libro,
        externalId: contenido.libro.externalId,
        autores
      }
    };
  }));

  res.json(mappedContenidos);
};

export const addLibroALista = async (req: Request, res: Response): Promise<void> => {
  const orm = req.app.get('orm') as MikroORM;
  // --- CAMBIOS AQUÍ ---
  const { libro, listaId } = req.body; // 1. Lee el libro completo y listaId del body

  if (!libro || !listaId) {
    res.status(400).json({ error: 'Faltan libro o listaId' });
    return;
  }

  // 2. Busca la lista
  const lista = await orm.em.findOne(Lista, { id: listaId });
  if (!lista) {
    res.status(404).json({ error: 'Lista no encontrada' });
    return;
  }

  // 3. Busca el libro por externalId, si no existe, créalo
  let libroEntity = await orm.em.findOne(Libro, { externalId: libro.id });
  if (!libroEntity) {
    // Buscar o crear categoría por defecto
    let autor: Autor | undefined;
    if (libro.autores && libro.autores.length > 0) {
      const autorNombreCompleto = libro.autores[0];
      // Buscar autor por nombre completo para evitar errores de división
      autor = await orm.em.findOne(Autor, { nombre: autorNombreCompleto }) ?? undefined;
      if (!autor) {
        autor = orm.em.create(Autor, {
          nombre: autorNombreCompleto,
          apellido: '', // Dejamos el apellido vacío para simplificar
          createdAt: new Date()
        });
        await orm.em.persist(autor);
      }
    }


    let categoria = await orm.em.findOne(Categoria, { nombre: 'Sin categoría' });
    if (!categoria) {
      categoria = orm.em.create(Categoria, { nombre: 'Sin categoría', createdAt: new Date() });
      await orm.em.persistAndFlush(categoria);
    }
    // Crear el libro si no existe
    libroEntity = orm.em.create(Libro, {
      externalId: libro.id,
      nombre: libro.titulo,
      sinopsis: libro.descripcion,
      imagen: libro.imagen,
      enlace: libro.enlace,
      source: libro.source,
      autor,
      categoria,
      createdAt: new Date(),
    });
    await orm.em.persistAndFlush(libroEntity);
  }
  // --- FIN DE LOS CAMBIOS ---

  const existente = await orm.em.findOne(ContenidoLista, { lista: { id: lista.id }, libro: { externalId: libro.id } });
  if (existente) {
    res.status(400).json({ error: 'El libro ya está en la lista' });
    return;
  }

  const contenido = orm.em.create(ContenidoLista, { lista, libro: libroEntity, createdAt: new Date() });
  lista.ultimaModificacion = new Date();

  await orm.em.persistAndFlush(contenido);
  // La segunda llamada a flush no es necesaria si usas persistAndFlush
  // await orm.em.flush();

  res.status(201).json(contenido);
};

export const removeLibroDeLista = async (req: Request, res: Response): Promise<void> => {
  const orm = req.app.get('orm') as MikroORM;
  const lista = (req as any).lista;
  const libroId = req.params.libroId;

  const contenido = await orm.em.findOne(ContenidoLista, { lista: { id: lista.id }, libro: { externalId: libroId } });
  if (!contenido) {
    res.status(404).json({ error: 'No encontrado' });
    return;
  }

  await orm.em.removeAndFlush(contenido);

  lista.ultimaModificacion = new Date();
  await orm.em.flush();

  res.json({ mensaje: 'Eliminado' });
};

export const getAllUserContenido = async (req: Request, res: Response): Promise<void> => {
  const orm = req.app.get('orm') as MikroORM;
  const em = orm.em.fork(); // Usar un fork para posibles escrituras
  const usuarioId = (req as any).user?.id;

  if (!usuarioId) {
    res.status(401).json({ error: 'Usuario no autenticado' });
    return;
  }

  const contenidos = await orm.em.find(
    ContenidoLista,
    { lista: { usuario: { id: usuarioId } } },
    { populate: ['libro.autor', 'libro.categoria', 'lista'] }
  );

  // Map to include externalId and autores array with autocorrección
  const mappedContenidos = await Promise.all(contenidos.map(async contenido => {
    let autores = ['Autor desconocido'];

    if (contenido.libro.autor) {
      autores = [`${contenido.libro.autor.nombre} ${contenido.libro.autor.apellido}`.trim() || 'Autor desconocido'];
    } else if (contenido.libro.externalId) { // Si no hay autor pero sí ID externo, intentamos arreglarlo
      try {
        const googleBook = await getBookById(contenido.libro.externalId);
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
          contenido.libro.autor = autorEntity;
          await em.flush(); // Guardamos los cambios en la BD
        }
      } catch (error) {
        console.error('Error fetching author from Google Books:', error);
      }
    }

    return {
      ...contenido,
      libro: {
        ...contenido.libro,
        externalId: contenido.libro.externalId,
        autores
      }
    };
  }));

  res.json(mappedContenidos);
};
