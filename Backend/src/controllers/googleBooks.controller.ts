import { Request, Response } from 'express';
import { buscarLibro, getBookById } from '../services/googleBooks.service';

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
