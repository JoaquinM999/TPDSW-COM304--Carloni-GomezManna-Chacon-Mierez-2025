import { Request, Response, NextFunction } from 'express';
import { TipoLista } from '../entities/lista.entity';

export const validateLista = (req: Request, res: Response, next: NextFunction) => {
  const { nombre, tipo } = req.body;

  // Check if required fields are present
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
    return res.status(400).json({ error: 'El nombre de la lista es obligatorio y debe ser una cadena no vacía' });
  }

  // Trim whitespace and validate length constraints
  const trimmedNombre = nombre.trim();
  if (trimmedNombre.length > 100) {
    return res.status(400).json({ error: 'El nombre de la lista no puede tener más de 100 caracteres' });
  }

  if (trimmedNombre.length < 3) {
    return res.status(400).json({ error: 'El nombre de la lista debe tener al menos 3 caracteres' });
  }

  // Check for valid characters in nombre
  const nameRegex = /^[a-zA-ZÀ-ÿ0-9\s\-'":.,!?()&]+$/;
  if (!nameRegex.test(trimmedNombre)) {
    return res.status(400).json({ error: 'El nombre de la lista contiene caracteres no válidos' });
  }

  // Validate tipo if provided (optional, defaults to CUSTOM)
  if (tipo !== undefined) {
    const validTypes = Object.values(TipoLista);
    if (!validTypes.includes(tipo)) {
      return res.status(400).json({ 
        error: `El tipo de lista debe ser uno de: ${validTypes.join(', ')}` 
      });
    }
  }

  // Sanitize by trimming
  req.body.nombre = trimmedNombre;

  next();
};

export const validateListaUpdate = (req: Request, res: Response, next: NextFunction) => {
  const { nombre, tipo } = req.body;

  // For updates, fields are optional but must be valid if provided
  if (nombre !== undefined) {
    if (typeof nombre !== 'string' || nombre.trim().length === 0) {
      return res.status(400).json({ error: 'El nombre de la lista debe ser una cadena no vacía' });
    }

    const trimmedNombre = nombre.trim();
    if (trimmedNombre.length > 100) {
      return res.status(400).json({ error: 'El nombre de la lista no puede tener más de 100 caracteres' });
    }

    if (trimmedNombre.length < 3) {
      return res.status(400).json({ error: 'El nombre de la lista debe tener al menos 3 caracteres' });
    }

    const nameRegex = /^[a-zA-ZÀ-ÿ0-9\s\-'":.,!?()&]+$/;
    if (!nameRegex.test(trimmedNombre)) {
      return res.status(400).json({ error: 'El nombre de la lista contiene caracteres no válidos' });
    }

    req.body.nombre = trimmedNombre;
  }

  if (tipo !== undefined) {
    const validTypes = Object.values(TipoLista);
    if (!validTypes.includes(tipo)) {
      return res.status(400).json({ 
        error: `El tipo de lista debe ser uno de: ${validTypes.join(', ')}` 
      });
    }
  }

  next();
};

export const validateAddLibroToLista = (req: Request, res: Response, next: NextFunction) => {
  const { libroId } = req.body;

  if (!libroId || typeof libroId !== 'number' || libroId <= 0) {
    return res.status(400).json({ error: 'El ID del libro es obligatorio y debe ser un número positivo' });
  }

  next();
};
