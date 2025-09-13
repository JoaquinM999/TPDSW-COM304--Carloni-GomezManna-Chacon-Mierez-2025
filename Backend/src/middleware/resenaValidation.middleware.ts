import { Request, Response, NextFunction } from 'express';
import { EstadoResena } from '../entities/resena.entity';

export const validateResena = (req: Request, res: Response, next: NextFunction) => {
  const { comentario, estrellas, libro, estado } = req.body;

  // Check if required fields are present
  if (!comentario || typeof comentario !== 'string' || comentario.trim().length === 0) {
    return res.status(400).json({ error: 'El comentario es obligatorio y debe ser una cadena no vacía' });
  }

  if (estrellas === undefined || estrellas === null || typeof estrellas !== 'number') {
    return res.status(400).json({ error: 'Las estrellas son obligatorias y deben ser un número' });
  }

  if (!libro || typeof libro !== 'number' || libro <= 0) {
    return res.status(400).json({ error: 'El ID del libro es obligatorio y debe ser un número positivo' });
  }

  // Validate estrellas range (1-5)
  if (estrellas < 1 || estrellas > 5 || !Number.isInteger(estrellas)) {
    return res.status(400).json({ error: 'Las estrellas deben ser un número entero entre 1 y 5' });
  }

  // Validate comentario length
  const trimmedComentario = comentario.trim();
  if (trimmedComentario.length < 10) {
    return res.status(400).json({ error: 'El comentario debe tener al menos 10 caracteres' });
  }

  if (trimmedComentario.length > 1000) {
    return res.status(400).json({ error: 'El comentario no puede tener más de 1000 caracteres' });
  }

  // Validate estado if provided (optional, defaults to PENDING)
  if (estado !== undefined) {
    const validStates = Object.values(EstadoResena);
    if (!validStates.includes(estado)) {
      return res.status(400).json({ 
        error: `El estado debe ser uno de: ${validStates.join(', ')}` 
      });
    }
  }

  // Check for inappropriate content (basic profanity filter)
  const inappropriateWords = ['spam', 'fake', 'scam', 'hate'];
  const lowerComment = trimmedComentario.toLowerCase();
  const hasInappropriateContent = inappropriateWords.some(word => 
    lowerComment.includes(word)
  );

  if (hasInappropriateContent) {
    // Flag for moderation instead of rejecting
    req.body.estado = EstadoResena.FLAGGED;
  }

  // Sanitize by trimming
  req.body.comentario = trimmedComentario;

  next();
};

export const validateResenaUpdate = (req: Request, res: Response, next: NextFunction) => {
  const { comentario, estrellas, estado } = req.body;

  // For updates, fields are optional but must be valid if provided
  if (comentario !== undefined) {
    if (typeof comentario !== 'string' || comentario.trim().length === 0) {
      return res.status(400).json({ error: 'El comentario debe ser una cadena no vacía' });
    }

    const trimmedComentario = comentario.trim();
    if (trimmedComentario.length < 10) {
      return res.status(400).json({ error: 'El comentario debe tener al menos 10 caracteres' });
    }

    if (trimmedComentario.length > 1000) {
      return res.status(400).json({ error: 'El comentario no puede tener más de 1000 caracteres' });
    }

    req.body.comentario = trimmedComentario;
  }

  if (estrellas !== undefined) {
    if (typeof estrellas !== 'number' || estrellas < 1 || estrellas > 5 || !Number.isInteger(estrellas)) {
      return res.status(400).json({ error: 'Las estrellas deben ser un número entero entre 1 y 5' });
    }
  }

  if (estado !== undefined) {
    const validStates = Object.values(EstadoResena);
    if (!validStates.includes(estado)) {
      return res.status(400).json({ 
        error: `El estado debe ser uno de: ${validStates.join(', ')}` 
      });
    }
  }

  next();
};
