// src/controllers/hardcoverController.ts
import { Request, Response } from 'express';
import { getTrendingBooks } from '../services/hardcoverService';

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
