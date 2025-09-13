import { Request, Response, NextFunction } from 'express';

export const validateSaga = (req: Request, res: Response, next: NextFunction) => {
  const { nombre } = req.body;

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
    return res.status(400).json({ error: 'El nombre de la saga es obligatorio y debe ser una cadena no vacía' });
  }

  const trimmedNombre = nombre.trim();

  if (trimmedNombre.length > 100) {
    return res.status(400).json({ error: 'El nombre de la saga no puede tener más de 100 caracteres' });
  }

  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
  if (!nameRegex.test(trimmedNombre)) {
    return res.status(400).json({ error: 'El nombre de la saga solo puede contener letras, espacios, guiones y apóstrofes' });
  }

  req.body.nombre = trimmedNombre;

  next();
};
