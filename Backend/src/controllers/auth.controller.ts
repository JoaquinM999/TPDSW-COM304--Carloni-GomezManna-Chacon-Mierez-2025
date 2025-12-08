import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/mysql';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { promisify } from 'util';
import crypto from 'crypto';
import { Usuario } from '../entities/usuario.entity';
import { PasswordResetToken } from '../entities/passwordResetToken.entity';
import jwtConfig from '../shared/jwt.config';
import { StringValue } from 'ms';
import { registerUser } from '../services/auth.service';
import { sendPasswordReset } from '../services/email.service';

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

/**
 * Solicitar recuperación de contraseña
 * Genera un token y envía email con enlace de reseteo
 */
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requerido' });
    }

    const user = await em.findOne(Usuario, { email });
    
    // Por seguridad, siempre responder con éxito aunque el usuario no exista
    if (!user) {
      return res.json({ 
        message: 'Si el email existe, recibirás un enlace de recuperación' 
      });
    }

    // Generar token aleatorio seguro
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Crear registro de token
    const passwordResetToken = new PasswordResetToken(user, resetToken);
    await em.persistAndFlush(passwordResetToken);

    // Enviar email
    try {
      await sendPasswordReset(email, resetToken, user.nombre);
    } catch (emailError) {
      console.error('Error al enviar email de reseteo:', emailError);
      // No fallar si el email no se puede enviar
    }

    return res.json({ 
      message: 'Si el email existe, recibirás un enlace de recuperación' 
    });
  } catch (error: any) {
    console.error('Error en requestPasswordReset:', error);
    return res.status(500).json({ error: 'Error del servidor' });
  }
};

/**
 * Restablecer contraseña con token
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token y nueva contraseña requeridos' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Buscar token válido
    const resetToken = await em.findOne(PasswordResetToken, 
      { token, usado: false },
      { populate: ['usuario'] }
    );

    if (!resetToken) {
      return res.status(400).json({ error: 'Token inválido o ya usado' });
    }

    // Verificar que no haya expirado
    if (resetToken.fechaExpiracion < new Date()) {
      return res.status(400).json({ error: 'Token expirado' });
    }

    // Actualizar contraseña del usuario
    const user = resetToken.usuario;
    user.password = newPassword; // El entity debería tener un hook para hashear
    
    // Marcar token como usado
    resetToken.usado = true;

    await em.persistAndFlush([user, resetToken]);

    return res.json({ 
      message: 'Contraseña actualizada exitosamente' 
    });
  } catch (error: any) {
    console.error('Error en resetPassword:', error);
    return res.status(500).json({ error: 'Error del servidor' });
  }
};

export { registerUser };
