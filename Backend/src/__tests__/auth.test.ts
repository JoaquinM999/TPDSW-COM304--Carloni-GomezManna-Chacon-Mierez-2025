import request from 'supertest';
import { MikroORM } from '@mikro-orm/core';
import app from '../app';
import { orm } from './setup';
import { Usuario } from '../entities/usuario.entity';
import bcrypt from 'bcryptjs';

describe('Auth Controller - Authentication Tests', () => {
  let testUser: any;

  beforeEach(async () => {
    const em = orm.em.fork();
    
    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    testUser = em.create(Usuario, {
      nombre: 'Test User',
      apellido: 'Testing',
      email: 'test@example.com',
      nombreUsuario: 'testuser',
      password: hashedPassword,
      rol: 'usuario',
      fechaNacimiento: new Date('1990-01-01')
    });
    
    await em.persistAndFlush(testUser);
  });

  describe('POST /api/auth/register', () => {
    it('debería registrar un nuevo usuario exitosamente', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Nuevo',
          apellido: 'Usuario',
          email: 'nuevo@example.com',
          nombreUsuario: 'nuevousuario',
          password: 'Password123!',
          fechaNacimiento: '1995-05-15'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.usuario).toHaveProperty('email', 'nuevo@example.com');
      expect(response.body.usuario).not.toHaveProperty('password');
    });

    it('debería rechazar registro con email duplicado', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Test',
          apellido: 'Duplicate',
          email: 'test@example.com', // Email ya existe
          nombreUsuario: 'testdup',
          password: 'Password123!',
          fechaNacimiento: '1995-05-15'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('debería rechazar registro con username duplicado', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Test',
          apellido: 'Duplicate',
          email: 'otro@example.com',
          nombreUsuario: 'testuser', // Username ya existe
          password: 'Password123!',
          fechaNacimiento: '1995-05-15'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('debería rechazar registro sin campos requeridos', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Test'
          // Faltan campos requeridos
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('debería hacer login exitosamente con credenciales correctas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.usuario).toHaveProperty('email', 'test@example.com');
      expect(response.body.usuario).not.toHaveProperty('password');
    });

    it('debería rechazar login con email incorrecto', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('debería rechazar login con contraseña incorrecta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('debería rechazar login sin credenciales', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('debería refrescar el token exitosamente', async () => {
      // Primero hacer login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      const { refreshToken } = loginResponse.body;

      // Refrescar token
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('debería rechazar refresh sin token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('debería rechazar refresh con token inválido', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'token-invalido' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/request-password-reset', () => {
    it('debería generar token de reseteo de contraseña', async () => {
      const response = await request(app)
        .post('/api/auth/request-password-reset')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      
      // Verificar que el token se creó en la BD
      const em = orm.em.fork();
      const tokens = await em.find('PasswordResetToken', { usuario: testUser.id });
      expect(tokens.length).toBeGreaterThan(0);
    });

    it('debería manejar solicitud de reseteo para email no existente', async () => {
      const response = await request(app)
        .post('/api/auth/request-password-reset')
        .send({
          email: 'noexiste@example.com'
        });

      // Por seguridad, debería responder con éxito aunque el email no exista
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('debería resetear contraseña con token válido', async () => {
      // Primero solicitar reset
      await request(app)
        .post('/api/auth/request-password-reset')
        .send({ email: 'test@example.com' });

      // Obtener el token de la BD
      const em = orm.em.fork();
      const tokenEntity = await em.findOne('PasswordResetToken', { usuario: testUser.id });
      expect(tokenEntity).toBeDefined();

      // Resetear contraseña
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: tokenEntity!.token,
          newPassword: 'NewPassword456!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verificar que puede hacer login con la nueva contraseña
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'NewPassword456!'
        });

      expect(loginResponse.status).toBe(200);
    });

    it('debería rechazar token expirado', async () => {
      const em = orm.em.fork();
      
      // Crear token expirado
      const expiredToken = em.create('PasswordResetToken', {
        token: 'expired-token',
        usuario: testUser,
        expiresAt: new Date(Date.now() - 3600000), // Hace 1 hora
        usado: false
      });
      await em.persistAndFlush(expiredToken);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'expired-token',
          newPassword: 'NewPassword456!'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('debería rechazar token ya usado', async () => {
      const em = orm.em.fork();
      
      // Crear token usado
      const usedToken = em.create('PasswordResetToken', {
        token: 'used-token',
        usuario: testUser,
        expiresAt: new Date(Date.now() + 3600000),
        usado: true // Ya usado
      });
      await em.persistAndFlush(usedToken);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'used-token',
          newPassword: 'NewPassword456!'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});
