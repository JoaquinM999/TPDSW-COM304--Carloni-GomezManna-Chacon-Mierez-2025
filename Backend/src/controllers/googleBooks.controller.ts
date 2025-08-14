import { Request, Response } from 'express';
import { buscarLibro } from '../services/googleBooks.service';

export const obtenerLibros = async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: 'Falta parámetro q' });

  const libros = await buscarLibro(q.toString());
  res.json(libros);
};
