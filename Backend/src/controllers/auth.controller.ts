import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/mysql';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { promisify } from 'util';
import { Usuario } from '../entities/usuario.entity';
import jwtConfig from '../shared/jwt.config';
import { StringValue } from 'ms';

// Función auxiliar para generar un token de acceso
const generateToken = (user: Usuario): string => {
  if (!jwtConfig.secret) {
    throw new Error('JWT secret not configured');
  }

  const signOptions: SignOptions = {
    expiresIn: jwtConfig.expiresIn as StringValue,
  };

  return jwt.sign(
    { id: user.id, email: user.email, username: user.username, rol: user.rol },
    jwtConfig.secret,
    signOptions
  );
};

// Función auxiliar para verificar el refresh token como Promise
const verifyToken = (token: string, secret: string): Promise<JwtPayload> =>
  new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err || typeof decoded !== 'object' || !decoded) {
        return reject(err);
      }
      resolve(decoded as JwtPayload);
    });
  });

// Login de usuario
export const loginUser = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await orm.em.findOne(Usuario, { email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const validPassword = await user.validatePassword(password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user);

    const refreshToken = jwt.sign(
      { id: user.id },
      jwtConfig.secret!,
      { expiresIn: '7d' }
    );

    user.refreshToken = refreshToken;
    await orm.em.persistAndFlush(user);

    res.json({ token, refreshToken, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Renovar token con refresh token
export const refreshTokenUser = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token missing' });
    }

    let decoded: JwtPayload;
    try {
      decoded = await verifyToken(refreshToken, jwtConfig.secret!);
    } catch {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const user = await orm.em.findOne(Usuario, { id: decoded.id });
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = generateToken(user);
    res.json({ token: newAccessToken });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
