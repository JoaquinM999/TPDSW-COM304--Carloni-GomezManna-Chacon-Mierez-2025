import { Request, Response, NextFunction } from 'express';

export const validateAutor = (req: Request, res: Response, next: NextFunction) => {
  const { nombre, apellido } = req.body;

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
    return res.status(400).json({ error: 'El nombre es obligatorio y debe ser una cadena no vacía' });
  }

  if (!apellido || typeof apellido !== 'string' || apellido.trim().length === 0) {
    return res.status(400).json({ error: 'El apellido es obligatorio y debe ser una cadena no vacía' });
  }

  const trimmedNombre = nombre.trim();
  const trimmedApellido = apellido.trim();

  if (trimmedNombre.length > 100) {
    return res.status(400).json({ error: 'El nombre no puede tener más de 100 caracteres' });
  }

  if (trimmedApellido.length > 100) {
    return res.status(400).json({ error: 'El apellido no puede tener más de 100 caracteres' });
  }

  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
  if (!nameRegex.test(trimmedNombre)) {
    return res.status(400).json({ error: 'El nombre solo puede contener letras, espacios, guiones y apóstrofes' });
  }

  if (!nameRegex.test(trimmedApellido)) {
    return res.status(400).json({ error: 'El apellido solo puede contener letras, espacios, guiones y apóstrofes' });
  }

  req.body.nombre = trimmedNombre;
  req.body.apellido = trimmedApellido;

  next();
};
