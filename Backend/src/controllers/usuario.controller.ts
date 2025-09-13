// src/controllers/usuario.controller.ts
import { Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { Usuario, RolUsuario } from '../entities/usuario.entity';
import { AuthRequest } from '../middleware/auth.middleware';
import { LRUCache } from 'lru-cache';

// Cache for usuarios with 5 minute TTL
const usuariosCache = new LRUCache<string, any>({
  max: 50,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export { usuariosCache };

// Create user
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em;
    const { email, username, password, rol } = req.body;

    // Validate required fields
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username y password son requeridos' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    // Validate username length
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ error: 'El username debe tener entre 3 y 30 caracteres' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Check if email already exists
    const existingUserByEmail = await em.findOne(Usuario, { email });
    if (existingUserByEmail) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Check if username already exists
    const existingUserByUsername = await em.findOne(Usuario, { username });
    if (existingUserByUsername) {
      return res.status(409).json({ error: 'El username ya está en uso' });
    }

    const userRole: RolUsuario = rol ?? RolUsuario.USUARIO;

    const newUser = em.create(Usuario, {
      email,
      username,
      password,
      rol: userRole,
      createdAt: new Date(),
    });

    await em.persistAndFlush(newUser);

    // Clear cache
    usuariosCache.clear();

    const { password: _, refreshToken, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
};

// Get all users
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em;

    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;

    // Search parameters
    const search = req.query.search as string;

    // Build cache key
    const cacheKey = `usuarios:${page}:${limit}:${search || ''}`;

    // Check cache first
    const cached = usuariosCache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Build query filters
    const filters: any = {};
    if (search) {
      filters.$or = [
        { nombre: { $ilike: `%${search}%` } },
        { username: { $ilike: `%${search}%` } },
        { email: { $ilike: `%${search}%` } }
      ];
    }

    const [users, total] = await em.findAndCount(Usuario, filters, {
      limit,
      offset,
      orderBy: { createdAt: 'DESC' }
    });

    // Remove sensitive data from response
    const usersWithoutSensitiveData = users.map(user => {
      const { password, refreshToken, ...userWithoutSensitiveData } = user;
      return userWithoutSensitiveData;
    });

    const result = {
      data: usersWithoutSensitiveData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache the result
    usuariosCache.set(cacheKey, result);

    res.json(result);
  } catch (error) {
    console.error('Error fetching usuarios:', error);
    res.status(500).json({ error: 'Error fetching usuarios from database' });
  }
};

// Get user by ID
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const userId = +req.params.id;

    if (!req.user || (typeof req.user === 'object' && req.user.id !== userId)) {
      return res.status(403).json({ error: 'Not authorized to view this user' });
    }

    const user = await orm.em.findOne(Usuario, { id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving user' });
  }
};

// Update user
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em;
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    if (!req.user || (typeof req.user === 'object' && req.user.id !== userId)) {
      return res.status(403).json({ error: 'No autorizado para actualizar este usuario' });
    }

    const user = await em.findOne(Usuario, { id: userId });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { email, username } = req.body;

    // Check for duplicate email if email is being updated
    if (email && email !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Formato de email inválido' });
      }

      const existingUserByEmail = await em.findOne(Usuario, { email, id: { $ne: userId } });
      if (existingUserByEmail) {
        return res.status(409).json({ error: 'El email ya está registrado por otro usuario' });
      }
    }

    // Check for duplicate username if username is being updated
    if (username && username !== user.username) {
      if (username.length < 3 || username.length > 30) {
        return res.status(400).json({ error: 'El username debe tener entre 3 y 30 caracteres' });
      }

      const existingUserByUsername = await em.findOne(Usuario, { username, id: { $ne: userId } });
      if (existingUserByUsername) {
        return res.status(409).json({ error: 'El username ya está en uso por otro usuario' });
      }
    }

    em.assign(user, req.body);
    await em.persistAndFlush(user);

    // Clear cache
    usuariosCache.clear();

    const { password, refreshToken, ...userWithoutSensitiveData } = user;

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: userWithoutSensitiveData,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Get current user profile
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em;

    if (!req.user || typeof req.user !== 'object') {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const user = await em.findOne(Usuario, { id: req.user.id });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { password, refreshToken, ...userWithoutSensitiveData } = user;
    res.json(userWithoutSensitiveData);
  } catch (error) {
    console.error('Error retrieving current user:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Update current user
export const updateCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em;

    if (!req.user || typeof req.user !== 'object') {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const user = await em.findOne(Usuario, { id: req.user.id });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Only allow updating profile fields, not sensitive data like password or role
    const allowedFields = ['nombre', 'biografia', 'ubicacion', 'genero', 'email', 'username', 'avatar'];
    const updates: any = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Validate email format if being updated
    if (updates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        return res.status(400).json({ error: 'Formato de email inválido' });
      }
    }

    // Validate username length if being updated
    if (updates.username && (updates.username.length < 3 || updates.username.length > 30)) {
      return res.status(400).json({ error: 'El username debe tener entre 3 y 30 caracteres' });
    }

    em.assign(user, updates);
    await em.persistAndFlush(user);

    // Clear cache
    usuariosCache.clear();

    const { password, refreshToken, ...userWithoutSensitiveData } = user;
    res.json({
      message: 'Usuario actualizado exitosamente',
      user: userWithoutSensitiveData,
    });
  } catch (error) {
    console.error('Error updating current user:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Check if username or email already exists
export const checkUserExists = async (req: AuthRequest, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const { username, email } = req.body;

    if (!username && !email) {
      return res.status(400).json({ error: 'Username or email is required' });
    }

    const existingUserByEmail = email ? await orm.em.findOne(Usuario, { email }) : null;
    const existingUserByUsername = username ? await orm.em.findOne(Usuario, { username }) : null;

    const result: any = {};

    if (existingUserByEmail) {
      result.emailExists = true;
    }

    if (existingUserByUsername) {
      result.usernameExists = true;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Delete all users
export const deleteAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em;

    // Check if user is admin
    if (!req.user || (typeof req.user === 'object' && req.user.rol !== RolUsuario.ADMIN)) {
      return res.status(403).json({ error: 'Solo los administradores pueden eliminar todos los usuarios' });
    }

    const users = await em.find(Usuario, {});
    await em.removeAndFlush(users);

    // Clear cache
    usuariosCache.clear();

    res.json({ message: 'Todos los usuarios eliminados exitosamente' });
  } catch (error) {
    console.error('Error deleting all users:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
