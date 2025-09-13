import { Request, Response, NextFunction } from 'express';

export const validateLibro = (req: Request, res: Response, next: NextFunction) => {
  const { nombre, sinopsis, categoria, editorial, autor, saga } = req.body;

  // Check if required fields are present
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
    return res.status(400).json({ error: 'El nombre del libro es obligatorio y debe ser una cadena no vacía' });
  }

  if (!sinopsis || typeof sinopsis !== 'string' || sinopsis.trim().length === 0) {
    return res.status(400).json({ error: 'La sinopsis es obligatoria y debe ser una cadena no vacía' });
  }

  if (!categoria || typeof categoria !== 'number' || categoria <= 0) {
    return res.status(400).json({ error: 'El ID de categoría es obligatorio y debe ser un número positivo' });
  }

  if (!editorial || typeof editorial !== 'number' || editorial <= 0) {
    return res.status(400).json({ error: 'El ID de editorial es obligatorio y debe ser un número positivo' });
  }

  if (!autor || typeof autor !== 'number' || autor <= 0) {
    return res.status(400).json({ error: 'El ID de autor es obligatorio y debe ser un número positivo' });
  }

  // Validate saga if provided (optional field)
  if (saga !== undefined && saga !== null) {
    if (typeof saga !== 'number' || saga <= 0) {
      return res.status(400).json({ error: 'El ID de saga debe ser un número positivo' });
    }
  }

  // Trim whitespace and validate length constraints
  const trimmedNombre = nombre.trim();
  if (trimmedNombre.length > 255) {
    return res.status(400).json({ error: 'El nombre del libro no puede tener más de 255 caracteres' });
  }

  const trimmedSinopsis = sinopsis.trim();
  if (trimmedSinopsis.length > 2000) {
    return res.status(400).json({ error: 'La sinopsis no puede tener más de 2000 caracteres' });
  }

  // Check for valid characters in nombre
  const nameRegex = /^[a-zA-ZÀ-ÿ0-9\s\-'":.,!?()&]+$/;
  if (!nameRegex.test(trimmedNombre)) {
    return res.status(400).json({ error: 'El nombre del libro contiene caracteres no válidos' });
  }

  // Sanitize by trimming
  req.body.nombre = trimmedNombre;
  req.body.sinopsis = trimmedSinopsis;

  next();
};
