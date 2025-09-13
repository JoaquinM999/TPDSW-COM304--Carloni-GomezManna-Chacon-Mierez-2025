// src/controllers/hardcoverController.ts
import { Request, Response } from 'express';
import { getTrendingBooks, buscarLibroHardcover } from '../services/hardcoverService';

export async function trendingBooksController(req: Request, res: Response) {
  try {
    const books = await getTrendingBooks();

    // Handle null return from getTrendingBooks (indicates loading state)
    if (books === null) {
      return res.status(202).json({ loading: true, books: [] });
    }

    res.json({ loading: false, books });
  } catch (error: any) {
    console.error('Hardcover trending error:', error?.message || error);
    res.status(500).json({ error: 'No se pudieron obtener libros', details: error?.message });
  }
}

export async function buscarLibroHardcoverController(req: Request, res: Response) {
  const query = req.query.q as string | undefined;
  if (!query) {
    return res.status(400).json({ error: 'Parámetro de búsqueda "q" es requerido' });
  }

  try {
    const books = await buscarLibroHardcover(query);
    res.json(books);
  } catch (error: any) {
    console.error('Error buscando libros en Hardcover:', error?.message || error);
    res.status(500).json({ error: 'Error buscando libros en Hardcover', details: error?.message });
  }
}
