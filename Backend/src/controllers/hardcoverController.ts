// src/controllers/hardcoverController.ts
import { Request, Response } from 'express';
import { getTrendingBooks } from '../services/hardcoverService';

export async function trendingBooksController(req: Request, res: Response) {
  try {
    const books = await getTrendingBooks();
    res.json(books);
  } catch (error: any) {
    console.error('Hardcover trending error:', error?.message || error);
    res.status(500).json({ error: 'No se pudieron obtener libros', details: error?.message });
  }
}
