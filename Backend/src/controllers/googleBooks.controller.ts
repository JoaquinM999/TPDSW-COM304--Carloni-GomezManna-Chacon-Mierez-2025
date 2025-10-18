import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { Libro } from '../entities/libro.entity';
import { Autor } from '../entities/autor.entity';
import { Categoria } from '../entities/categoria.entity';
import { Editorial } from '../entities/editorial.entity';
import { buscarLibro, getBookById } from '../services/googleBooks.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const obtenerLibros = async (req: Request, res: Response) => {
  const { q, startIndex, maxResults } = req.query;
  if (!q) return res.status(400).json({ message: 'Falta parámetro q' });

  const startIndexNum = startIndex ? parseInt(startIndex.toString(), 10) : 0;
  const maxResultsNum = maxResults ? parseInt(maxResults.toString(), 10) : 40;

  const libros = await buscarLibro(q.toString(), startIndexNum, maxResultsNum);
  res.json(libros);
};

export const obtenerLibroPorId = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: 'Falta parámetro id' });

  const libro = await getBookById(id);
  if (!libro) return res.status(404).json({ message: 'Libro no encontrado' });

  res.json(libro);
};

export const addGoogleBook = async (req: AuthRequest, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const em = orm.em.fork();

  const { googleBookId } = req.body;

  if (!googleBookId) {
    return res.status(400).json({ error: 'Se requiere el ID del libro de Google Books' });
  }

  try {
    // Check if book already exists
    const existingBook = await em.findOne(Libro, { externalId: googleBookId });
    if (existingBook) {
      console.log(`El libro con ID ${googleBookId} ya existe. Omitiendo creación.`);
      return res.status(200).json(existingBook);
    }

    // Get book details from Google Books
    const googleBook = await getBookById(googleBookId);
    if (!googleBook) {
      return res.status(404).json({ error: 'Libro no encontrado en Google Books' });
    }

    // Handle author - take the first author if available
    let autor: Autor | undefined;
    if (googleBook.autores && googleBook.autores.length > 0) {
      const autorNombreCompleto = googleBook.autores[0];
      // Split name into first and last name (simple split by space)
      const partesNombre = autorNombreCompleto.split(' ');
      const nombre = partesNombre[0] || autorNombreCompleto;
      const apellido = partesNombre.slice(1).join(' ') || '';
      
      autor = await em.findOne(Autor, { nombre, apellido }) || undefined;
      if (!autor) {
        autor = em.create(Autor, {
          nombre,
          apellido,
          createdAt: new Date()
        });
        await em.persist(autor); // No need to flush immediately, can be flushed with the book
      }
    }

    // Create the book (similar to favorites logic)
    const nuevoLibro = em.create(Libro, {
      externalId: googleBook.id,
      source: 'google',
      nombre: googleBook.titulo,
      sinopsis: googleBook.descripcion,
      imagen: googleBook.imagen,
      enlace: googleBook.enlace,
      autor: autor,
      createdAt: new Date()
    });

    console.log(`Creando nuevo libro con ID ${googleBookId}.`);
    await em.persistAndFlush(nuevoLibro);
    res.status(201).json(nuevoLibro);
  } catch (error) {
    console.error('Error adding Google Book:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
