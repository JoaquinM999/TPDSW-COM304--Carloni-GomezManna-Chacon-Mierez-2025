import { Request, Response, NextFunction } from 'express';

export const validateCategoria = (req: Request, res: Response, next: NextFunction) => {
  const { nombre } = req.body;

  // Check if required fields are present
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
    return res.status(400).json({ error: 'El nombre de la categoría es obligatorio y debe ser una cadena no vacía' });
  }

  // Trim whitespace and validate length constraints
  const trimmedNombre = nombre.trim();
  if (trimmedNombre.length > 100) {
    return res.status(400).json({ error: 'El nombre de la categoría no puede tener más de 100 caracteres' });
  }

  // Check for valid characters (only letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
  if (!nameRegex.test(trimmedNombre)) {
    return res.status(400).json({ error: 'El nombre de la categoría solo puede contener letras, espacios, guiones y apóstrofes' });
  }

  // Sanitize by trimming
  req.body.nombre = trimmedNombre;

  next();
};
