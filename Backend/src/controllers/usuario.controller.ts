// src/controllers/usuario.controller.ts
import { Response } from 'express';
import { MikroORM } from '@mikro-orm/mysql';
import { Usuario, RolUsuario } from '../entities/usuario.entity';
import { AuthRequest } from '../middleware/auth.middleware';

// Create user
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const { email, username, password, rol } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await orm.em.findOne(Usuario, { email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const userRole: RolUsuario = rol ?? RolUsuario.USUARIO;

    const newUser = orm.em.create(Usuario, {
      email,
      username,
      password,
      rol: userRole,
      createdAt: new Date(),
    });

    await orm.em.persistAndFlush(newUser);

    const { password: _, refreshToken, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get all users
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;

    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const users = await orm.em.find(Usuario, {});
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving users' });
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
    const userId = +req.params.id;

    if (!req.user || (typeof req.user === 'object' && req.user.id !== userId)) {
      return res.status(403).json({ error: 'Not authorized to update this user' });
    }

    const user = await orm.em.findOne(Usuario, { id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    orm.em.assign(user, req.body);
    await orm.em.persistAndFlush(user);

    res.json({
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error updating user' });
  }
};

// Get current user profile
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;

    if (!req.user || typeof req.user !== 'object') {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await orm.em.findOne(Usuario, { id: req.user.id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, refreshToken, ...userWithoutSensitiveData } = user;
    res.json(userWithoutSensitiveData);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving user profile' });
  }
};

// Update current user
export const updateCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;

    if (!req.user || typeof req.user !== 'object') {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await orm.em.findOne(Usuario, { id: req.user.id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only allow updating profile fields, not sensitive data like password or role
    const allowedFields = ['nombre', 'biografia', 'ubicacion', 'genero', 'email', 'username', 'avatar'];
    const updates: any = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    orm.em.assign(user, updates);
    await orm.em.persistAndFlush(user);

    const { password, refreshToken, ...userWithoutSensitiveData } = user;
    res.json({
      message: 'User updated successfully',
      user: userWithoutSensitiveData,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error updating user' });
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

    // Optional: Add authorization check here if needed
    // For example, check if user is admin: if (!req.user || req.user.rol !== RolUsuario.ADMIN) { ... }

    const users = await orm.em.find(Usuario, {});
    await orm.em.removeAndFlush(users);

    res.json({ message: 'All users deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting users' });
  }
};
