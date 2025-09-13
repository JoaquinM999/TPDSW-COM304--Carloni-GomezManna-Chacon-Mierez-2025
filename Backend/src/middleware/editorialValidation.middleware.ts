import { Request, Response, NextFunction } from 'express';

export const validateEditorial = (req: Request, res: Response, next: NextFunction) => {
  const { nombre, idioma } = req.body;

  // Check if required fields are present
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
    return res.status(400).json({ error: 'El nombre de la editorial es obligatorio y debe ser una cadena no vacía' });
  }

  // Trim whitespace and validate length constraints
  const trimmedNombre = nombre.trim();
  if (trimmedNombre.length > 100) {
    return res.status(400).json({ error: 'El nombre de la editorial no puede tener más de 100 caracteres' });
  }

  // Check for valid characters (only letters, spaces, hyphens, apostrophes, numbers)
  const nameRegex = /^[a-zA-ZÀ-ÿ0-9\s\-'&]+$/;
  if (!nameRegex.test(trimmedNombre)) {
    return res.status(400).json({ error: 'El nombre de la editorial contiene caracteres no válidos' });
  }

  // Validate idioma if provided
  if (idioma !== undefined) {
    if (typeof idioma !== 'string') {
      return res.status(400).json({ error: 'El idioma debe ser una cadena de texto' });
    }
    const trimmedIdioma = idioma.trim();
    if (trimmedIdioma.length > 50) {
      return res.status(400).json({ error: 'El idioma no puede tener más de 50 caracteres' });
    }
    // Check for valid language format (e.g., "Español", "English", "Français")
    const idiomaRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
    if (!idiomaRegex.test(trimmedIdioma)) {
      return res.status(400).json({ error: 'El idioma contiene caracteres no válidos' });
    }
    req.body.idioma = trimmedIdioma;
  }

  // Sanitize by trimming
  req.body.nombre = trimmedNombre;

  next();
};
