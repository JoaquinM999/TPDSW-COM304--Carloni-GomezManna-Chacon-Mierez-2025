// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: JwtPayload & { id?: number }; // indica que puede tener un id numérico
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'secretkey';
    const decoded = jwt.verify(token, secret);

    if (typeof decoded !== 'object' || decoded === null) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    // Si en tu payload JWT el usuario tiene un campo id numérico, acá lo aseguramos
    req.user = decoded as JwtPayload & { id?: number };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuthenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(); // No token, proceed without user
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(); // No token, proceed without user
  }

  try {
    const secret = process.env.JWT_SECRET || 'secretkey';
    const decoded = jwt.verify(token, secret);

    if (typeof decoded !== 'object' || decoded === null) {
      return next(); // Invalid token, proceed without user
    }

    req.user = decoded as JwtPayload & { id?: number };
    next();
  } catch (err) {
    return next(); // Invalid or expired token, proceed without user
  }
};
