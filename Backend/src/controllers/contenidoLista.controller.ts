// src/controllers/contenidoLista.controller.ts
import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/mysql';
import { ContenidoLista } from '../entities/contenidoLista.entity';
import { Libro } from '../entities/libro.entity';
import { Lista } from '../entities/lista.entity'; // Asegúrate de importar la entidad Lista
import { Categoria } from '../entities/categoria.entity';
import { Autor } from '../entities/autor.entity';

export const getContenidoLista = async (req: Request, res: Response): Promise<void> => {
  const orm = req.app.get('orm') as MikroORM;
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

  // Map to include externalId
  const mappedContenidos = contenidos.map(contenido => ({
    ...contenido,
    libro: {
      ...contenido.libro,
      externalId: contenido.libro.externalId
    }
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
      // Split name into first and last name (simple split by space)
      const partesNombre = autorNombreCompleto.split(' ');
      const nombre = partesNombre[0] || autorNombreCompleto;
      const apellido = partesNombre.slice(1).join(' ') || '';

      autor = await orm.em.findOne(Autor, { nombre, apellido }) || undefined;
      if (!autor) {
        autor = orm.em.create(Autor, {
          nombre,
          apellido,
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

  // Map to include externalId
  const mappedContenidos = contenidos.map(contenido => ({
    ...contenido,
    libro: {
      ...contenido.libro,
      externalId: contenido.libro.externalId
    }
  }));

  res.json(mappedContenidos);
};
