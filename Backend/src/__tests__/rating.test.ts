import request from 'supertest';
import app from '../app';
import { orm } from './setup';
import { Usuario } from '../entities/usuario.entity';
import { Libro } from '../entities/libro.entity';
import bcrypt from 'bcrypt';

describe('Rating Libro Controller Tests', () => {
  let authToken: string;
  let testUser: Usuario;
  let testLibro: Libro;

  beforeEach(async () => {
    const em = orm.em.fork();
    
    // Crear usuario
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    testUser = em.create(Usuario, {
      nombre: 'Test',
      apellido: 'User',
      email: 'rater@example.com',
      nombreUsuario: 'rateruser',
      password: hashedPassword,
      rol: 'USUARIO',
      fechaNacimiento: new Date('1990-01-01')
    });

    // Crear libro
    const autor = em.create('Autor', {
      nombre: 'Test',
      apellido: 'Author',
      createdAt: new Date()
    });

    const categoria = em.create('Categoria', {
      nombre: 'Test',
      createdAt: new Date()
    });

    testLibro = em.create(Libro, {
      titulo: 'Test Book',
      autor,
      categoria,
      isbn: '1234567890',
      anioPublicacion: 2020
    });
    
    await em.persistAndFlush([testUser, autor, categoria, testLibro]);

    // Login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'rater@example.com',
        password: 'Password123!'
      });

    authToken = loginResponse.body.token;
  });

  describe('POST /api/rating-libro', () => {
    it('debería crear calificación exitosamente', async () => {
      const response = await request(app)
        .post('/api/rating-libro')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          libroId: testLibro.id,
          rating: 4
        });

      expect(response.status).toBe(201);
      expect(response.body.rating).toHaveProperty('rating', 4);
      expect(response.body.rating).toHaveProperty('libroId', testLibro.id);
    });

    it('debería actualizar calificación existente', async () => {
      // Primera calificación
      await request(app)
        .post('/api/rating-libro')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          libroId: testLibro.id,
          rating: 3
        });

      // Actualizar calificación
      const response = await request(app)
        .post('/api/rating-libro')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          libroId: testLibro.id,
          rating: 5
        });

      expect(response.status).toBe(200);
      expect(response.body.rating).toHaveProperty('rating', 5);

      // Verificar que solo existe 1 rating
      const em = orm.em.fork();
      const ratings = await em.find('RatingLibro', {
        usuario: testUser.id,
        libro: testLibro.id
      });
      expect(ratings.length).toBe(1);
    });

    it('debería rechazar rating fuera de rango (menor a 1)', async () => {
      const response = await request(app)
        .post('/api/rating-libro')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          libroId: testLibro.id,
          rating: 0
        });

      expect(response.status).toBe(400);
    });

    it('debería rechazar rating fuera de rango (mayor a 5)', async () => {
      const response = await request(app)
        .post('/api/rating-libro')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          libroId: testLibro.id,
          rating: 6
        });

      expect(response.status).toBe(400);
    });

    it('debería rechazar calificación sin autenticación', async () => {
      const response = await request(app)
        .post('/api/rating-libro')
        .send({
          libroId: testLibro.id,
          rating: 4
        });

      expect(response.status).toBe(401);
    });

    it('debería rechazar calificación de libro inexistente', async () => {
      const response = await request(app)
        .post('/api/rating-libro')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          libroId: 99999,
          rating: 4
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/rating-libro/:libroId', () => {
    beforeEach(async () => {
      // Crear una calificación
      await request(app)
        .post('/api/rating-libro')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          libroId: testLibro.id,
          rating: 4
        });
    });

    it('debería eliminar calificación exitosamente', async () => {
      const response = await request(app)
        .delete(`/api/rating-libro/${testLibro.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // Verificar que se eliminó
      const em = orm.em.fork();
      const rating = await em.findOne('RatingLibro', {
        usuario: testUser.id,
        libro: testLibro.id
      });
      expect(rating).toBeNull();
    });

    it('debería manejar eliminación de calificación inexistente', async () => {
      const response = await request(app)
        .delete(`/api/rating-libro/99999`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('debería rechazar eliminación sin autenticación', async () => {
      const response = await request(app)
        .delete(`/api/rating-libro/${testLibro.id}`);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/rating-libro/libro/:id', () => {
    beforeEach(async () => {
      const em = orm.em.fork();
      
      // Crear usuarios adicionales
      const user2 = em.create(Usuario, {
        nombre: 'User2',
        apellido: 'Test',
        email: 'user2@example.com',
        nombreUsuario: 'user2rating',
        password: await bcrypt.hash('pass', 10),
        rol: 'USUARIO',
        fechaNacimiento: new Date('1990-01-01')
      });

      const user3 = em.create(Usuario, {
        nombre: 'User3',
        apellido: 'Test',
        email: 'user3@example.com',
        nombreUsuario: 'user3rating',
        password: await bcrypt.hash('pass', 10),
        rol: 'USUARIO',
        fechaNacimiento: new Date('1990-01-01')
      });

      await em.persistAndFlush([user2, user3]);

      // Crear ratings: 5, 4, 3 (promedio = 4)
      const rating1 = em.create('RatingLibro', {
        usuario: testUser,
        libro: testLibro,
        rating: 5
      });

      const rating2 = em.create('RatingLibro', {
        usuario: user2,
        libro: testLibro,
        rating: 4
      });

      const rating3 = em.create('RatingLibro', {
        usuario: user3,
        libro: testLibro,
        rating: 3
      });

      await em.persistAndFlush([rating1, rating2, rating3]);
    });

    it('debería obtener promedio de calificaciones', async () => {
      const response = await request(app)
        .get(`/api/rating-libro/libro/${testLibro.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('promedio', 4);
      expect(response.body).toHaveProperty('total', 3);
    });

    it('debería incluir calificación del usuario si está autenticado', async () => {
      const response = await request(app)
        .get(`/api/rating-libro/libro/${testLibro.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('miRating', 5);
    });

    it('debería retornar 0 para libro sin calificaciones', async () => {
      const em = orm.em.fork();
      const autor = await em.findOneOrFail('Autor', {});
      const categoria = await em.findOneOrFail('Categoria', {});
      
      const nuevoLibro = em.create(Libro, {
        titulo: 'Sin Ratings',
        autor,
        categoria,
        isbn: '9999999999',
        anioPublicacion: 2020
      });
      await em.persistAndFlush(nuevoLibro);

      const response = await request(app)
        .get(`/api/rating-libro/libro/${nuevoLibro.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('promedio', 0);
      expect(response.body).toHaveProperty('total', 0);
    });
  });

  describe('GET /api/rating-libro/mis-ratings', () => {
    beforeEach(async () => {
      const em = orm.em.fork();
      const autor = await em.findOneOrFail('Autor', {});
      const categoria = await em.findOneOrFail('Categoria', {});

      // Crear más libros
      const libro2 = em.create(Libro, {
        titulo: 'Book 2',
        autor,
        categoria,
        isbn: '1111111111',
        anioPublicacion: 2021
      });

      const libro3 = em.create(Libro, {
        titulo: 'Book 3',
        autor,
        categoria,
        isbn: '2222222222',
        anioPublicacion: 2022
      });

      await em.persistAndFlush([libro2, libro3]);

      // Crear ratings
      const rating1 = em.create('RatingLibro', {
        usuario: testUser,
        libro: testLibro,
        rating: 5
      });

      const rating2 = em.create('RatingLibro', {
        usuario: testUser,
        libro: libro2,
        rating: 3
      });

      await em.persistAndFlush([rating1, rating2]);
    });

    it('debería obtener todos los ratings del usuario', async () => {
      const response = await request(app)
        .get('/api/rating-libro/mis-ratings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ratings');
      expect(response.body.ratings.length).toBe(2);
      expect(response.body.ratings[0]).toHaveProperty('libro');
      expect(response.body.ratings[0]).toHaveProperty('rating');
    });

    it('debería rechazar solicitud sin autenticación', async () => {
      const response = await request(app)
        .get('/api/rating-libro/mis-ratings');

      expect(response.status).toBe(401);
    });
  });
});
