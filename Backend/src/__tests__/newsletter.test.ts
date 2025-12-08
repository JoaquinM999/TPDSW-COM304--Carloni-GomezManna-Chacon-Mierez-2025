import request from 'supertest';
import app from '../app';
import { orm } from './setup';
import { Usuario } from '../entities/usuario.entity';
import bcrypt from 'bcrypt';

describe('Newsletter Controller Tests', () => {
  let authToken: string;
  let testUser: Usuario;

  beforeEach(async () => {
    const em = orm.em.fork();
    
    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    testUser = em.create(Usuario, {
      nombre: 'Test',
      apellido: 'User',
      email: 'testuser@example.com',
      nombreUsuario: 'testuser',
      password: hashedPassword,
      rol: 'USUARIO',
      fechaNacimiento: new Date('1990-01-01')
    });
    
    await em.persistAndFlush(testUser);

    // Obtener token de autenticación
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'Password123!'
      });

    authToken = loginResponse.body.token;
  });

  describe('POST /api/newsletter/subscribe', () => {
    it('debería suscribirse al newsletter exitosamente', async () => {
      const response = await request(app)
        .post('/api/newsletter/subscribe')
        .send({
          email: 'suscriptor@example.com',
          nombre: 'Juan Pérez'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body.subscription).toHaveProperty('email', 'suscriptor@example.com');
      expect(response.body.subscription).toHaveProperty('activo', true);
    });

    it('debería rechazar email duplicado activo', async () => {
      // Primera suscripción
      await request(app)
        .post('/api/newsletter/subscribe')
        .send({
          email: 'duplicado@example.com',
          nombre: 'Test'
        });

      // Segunda suscripción con mismo email
      const response = await request(app)
        .post('/api/newsletter/subscribe')
        .send({
          email: 'duplicado@example.com',
          nombre: 'Test'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('debería reactivar suscripción inactiva', async () => {
      const em = orm.em.fork();
      
      // Crear suscripción inactiva
      const inactiveSub = em.create('Newsletter', {
        email: 'inactivo@example.com',
        nombre: 'Test',
        activo: false,
        fechaBaja: new Date()
      });
      await em.persistAndFlush(inactiveSub);

      // Intentar suscribirse de nuevo
      const response = await request(app)
        .post('/api/newsletter/subscribe')
        .send({
          email: 'inactivo@example.com',
          nombre: 'Test'
        });

      expect(response.status).toBe(200);
      expect(response.body.subscription).toHaveProperty('activo', true);
      expect(response.body.subscription.fechaBaja).toBeNull();
    });

    it('debería rechazar email inválido', async () => {
      const response = await request(app)
        .post('/api/newsletter/subscribe')
        .send({
          email: 'email-invalido',
          nombre: 'Test'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('debería permitir suscripción sin nombre', async () => {
      const response = await request(app)
        .post('/api/newsletter/subscribe')
        .send({
          email: 'sinnombre@example.com'
        });

      expect(response.status).toBe(201);
      expect(response.body.subscription).toHaveProperty('email', 'sinnombre@example.com');
    });
  });

  describe('POST /api/newsletter/unsubscribe', () => {
    beforeEach(async () => {
      // Crear suscripción activa
      await request(app)
        .post('/api/newsletter/subscribe')
        .send({
          email: 'activo@example.com',
          nombre: 'Test Activo'
        });
    });

    it('debería cancelar suscripción exitosamente', async () => {
      const response = await request(app)
        .post('/api/newsletter/unsubscribe')
        .send({
          email: 'activo@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verificar que está inactiva en BD
      const em = orm.em.fork();
      const sub = await em.findOne('Newsletter', { email: 'activo@example.com' });
      expect(sub?.activo).toBe(false);
      expect(sub?.fechaBaja).toBeDefined();
    });

    it('debería manejar desuscripción de email no existente', async () => {
      const response = await request(app)
        .post('/api/newsletter/unsubscribe')
        .send({
          email: 'noexiste@example.com'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/newsletter/subscriptions', () => {
    beforeEach(async () => {
      // Crear varias suscripciones
      await request(app).post('/api/newsletter/subscribe').send({ email: 'sub1@example.com' });
      await request(app).post('/api/newsletter/subscribe').send({ email: 'sub2@example.com' });
      await request(app).post('/api/newsletter/subscribe').send({ email: 'sub3@example.com' });
      
      // Cancelar una
      await request(app).post('/api/newsletter/unsubscribe').send({ email: 'sub3@example.com' });
    });

    it('debería obtener todas las suscripciones (admin)', async () => {
      const response = await request(app)
        .get('/api/newsletter/subscriptions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('subscriptions');
      expect(response.body).toHaveProperty('stats');
      expect(response.body.subscriptions.length).toBeGreaterThanOrEqual(3);
      expect(response.body.stats).toHaveProperty('total');
      expect(response.body.stats).toHaveProperty('activas');
      expect(response.body.stats).toHaveProperty('inactivas');
    });
  });
});
