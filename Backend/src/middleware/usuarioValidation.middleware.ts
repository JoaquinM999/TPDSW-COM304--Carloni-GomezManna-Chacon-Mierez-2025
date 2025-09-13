import { Request, Response, NextFunction } from 'express';

export const validateUsuario = (req: Request, res: Response, next: NextFunction) => {
  const { nombre, email, password } = req.body;

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
    return res.status(400).json({ error: 'El nombre es obligatorio y debe ser una cadena no vacía' });
  }

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return res.status(400).json({ error: 'El email es obligatorio y debe ser una cadena no vacía' });
  }

  // Simple email regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'El email no tiene un formato válido' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'La contraseña es obligatoria y debe tener al menos 6 caracteres' });
  }

  req.body.nombre = nombre.trim();
  req.body.email = email.trim();

  next();
};
