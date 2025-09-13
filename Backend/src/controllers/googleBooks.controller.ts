import { Request, Response } from 'express';
import { buscarLibro, getSuggestions } from '../services/googleBooks.service';

export const obtenerLibros = async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: 'Falta parámetro q' });

  const libros = await buscarLibro(q.toString());
  res.json(libros);
};

export const obtenerSugerencias = async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: 'Falta parámetro q' });

  const sugerencias = await getSuggestions(q.toString());
  res.json(sugerencias);
};
