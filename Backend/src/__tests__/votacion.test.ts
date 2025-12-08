import request from 'supertest';
import app from '../app';
import { orm } from './setup';
import { Usuario } from '../entities/usuario.entity';
import { Libro } from '../entities/libro.entity';
import { Autor } from '../entities/autor.entity';
import { Categoria } from '../entities/categoria.entity';
import bcrypt from 'bcrypt';

describe('Votacion Controller Tests', () => {
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
      email: 'voter@example.com',
      nombreUsuario: 'voteruser',
      password: hashedPassword,
      rol: 'USUARIO',
      fechaNacimiento: new Date('1990-01-01')
    });

    // Crear autor
    const autor = em.create(Autor, {
      nombre: 'Test Author'
    });

    // Crear categoría
    const categoria = em.create(Categoria, {
      nombre: 'Test Category'
    });

    // Crear libro
    testLibro = em.create(Libro, {
      titulo: 'Test Book',
      autor: autor,
      categoria: categoria,
      isbn: '1234567890',
      descripcion: 'Test description',
      anioPublicacion: 2020
    });
    
    await em.persistAndFlush([testUser, autor, categoria, testLibro]);

    // Login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'voter@example.com',
        password: 'Password123!'
      });

    authToken = loginResponse.body.token;
  });

  describe('POST /api/votacion/votar', () => {
    it('debería registrar voto positivo exitosamente', async () => {
      const response = await request(app)
        .post('/api/votacion/votar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          libroId: testLibro.id,
          voto: 'positivo'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.votacion).toHaveProperty('voto', 'positivo');
    });

    it('debería registrar voto negativo exitosamente', async () => {
      const response = await request(app)
        .post('/api/votacion/votar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          libroId: testLibro.id,
          voto: 'negativo'
        });

      expect(response.status).toBe(200);
      expect(response.body.votacion).toHaveProperty('voto', 'negativo');
    });

    it('debería cambiar voto de positivo a negativo', async () => {
      // Primer voto positivo
      await request(app)
        .post('/api/votacion/votar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          libroId: testLibro.id,
          voto: 'positivo'
        });

      // Cambiar a negativo
      const response = await request(app)
        .post('/api/votacion/votar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          libroId: testLibro.id,
          voto: 'negativo'
        });

      expect(response.status).toBe(200);
      expect(response.body.votacion).toHaveProperty('voto', 'negativo');

      // Verificar que solo existe 1 voto
      const em = orm.em.fork();
      const votos = await em.find('VotacionLibro', { 
        usuario: testUser.id,
        libro: testLibro.id 
      });
      expect(votos.length).toBe(1);
    });

    it('debería eliminar voto si se vota lo mismo dos veces', async () => {
      // Primer voto positivo
      await request(app)
        .post('/api/votacion/votar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          libroId: testLibro.id,
          voto: 'positivo'
        });

      // Segundo voto positivo (debería eliminar)
      const response = await request(app)
        .post('/api/votacion/votar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          libroId: testLibro.id,
          voto: 'positivo'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('removed', true);

      // Verificar que no existe voto
      const em = orm.em.fork();
      const voto = await em.findOne('VotacionLibro', { 
        usuario: testUser.id,
        libro: testLibro.id 
      });
      expect(voto).toBeNull();
    });

    it('debería rechazar voto sin autenticación', async () => {
      const response = await request(app)
        .post('/api/votacion/votar')
        .send({
          libroId: testLibro.id,
          voto: 'positivo'
        });

      expect(response.status).toBe(401);
    });

    it('debería rechazar voto a libro inexistente', async () => {
      const response = await request(app)
        .post('/api/votacion/votar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          libroId: 99999,
          voto: 'positivo'
        });

      expect(response.status).toBe(404);
    });

    it('debería rechazar tipo de voto inválido', async () => {
      const response = await request(app)
        .post('/api/votacion/votar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          libroId: testLibro.id,
          voto: 'neutral' // Tipo inválido
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/votacion/libro/:id', () => {
    beforeEach(async () => {
      const em = orm.em.fork();
      
      // Crear usuarios adicionales
      const user2 = em.create(Usuario, {
        nombre: 'User2',
        apellido: 'Test',
        email: 'user2@example.com',
        nombreUsuario: 'user2',
        password: await bcrypt.hash('pass', 10),
        rol: 'USUARIO',
        fechaNacimiento: new Date('1990-01-01')
      });

      const user3 = em.create(Usuario, {
        nombre: 'User3',
        apellido: 'Test',
        email: 'user3@example.com',
        nombreUsuario: 'user3',
        password: await bcrypt.hash('pass', 10),
        rol: 'USUARIO',
        fechaNacimiento: new Date('1990-01-01')
      });

      await em.persistAndFlush([user2, user3]);

      // Crear votos
      const voto1 = em.create('VotacionLibro', {
        usuario: testUser,
        libro: testLibro,
        voto: 'positivo'
      });

      const voto2 = em.create('VotacionLibro', {
        usuario: user2,
        libro: testLibro,
        voto: 'positivo'
      });

      const voto3 = em.create('VotacionLibro', {
        usuario: user3,
        libro: testLibro,
        voto: 'negativo'
      });

      await em.persistAndFlush([voto1, voto2, voto3]);
    });

    it('debería obtener estadísticas de votación de un libro', async () => {
      const response = await request(app)
        .get(`/api/votacion/libro/${testLibro.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('votosPositivos', 2);
      expect(response.body).toHaveProperty('votosNegativos', 1);
      expect(response.body).toHaveProperty('total', 3);
    });

    it('debería incluir voto del usuario si está autenticado', async () => {
      const response = await request(app)
        .get(`/api/votacion/libro/${testLibro.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('miVoto', 'positivo');
    });

    it('debería retornar 0 votos para libro sin votaciones', async () => {
      const em = orm.em.fork();
      const nuevoLibro = em.create(Libro, {
        titulo: 'Sin Votos',
        autor: await em.findOneOrFail(Autor, {}),
        categoria: await em.findOneOrFail(Categoria, {}),
        isbn: '9999999999',
        anioPublicacion: 2020
      });
      await em.persistAndFlush(nuevoLibro);

      const response = await request(app)
        .get(`/api/votacion/libro/${nuevoLibro.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('votosPositivos', 0);
      expect(response.body).toHaveProperty('votosNegativos', 0);
    });
  });

  describe('GET /api/votacion/mis-votos', () => {
    beforeEach(async () => {
      const em = orm.em.fork();
      
      // Crear más libros
      const autor = await em.findOneOrFail(Autor, {});
      const categoria = await em.findOneOrFail(Categoria, {});

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

      // Crear votos
      const voto1 = em.create('VotacionLibro', {
        usuario: testUser,
        libro: testLibro,
        voto: 'positivo'
      });

      const voto2 = em.create('VotacionLibro', {
        usuario: testUser,
        libro: libro2,
        voto: 'negativo'
      });

      await em.persistAndFlush([voto1, voto2]);
    });

    it('debería obtener todos los votos del usuario autenticado', async () => {
      const response = await request(app)
        .get('/api/votacion/mis-votos')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('votos');
      expect(response.body.votos.length).toBe(2);
      expect(response.body.votos[0]).toHaveProperty('libro');
      expect(response.body.votos[0]).toHaveProperty('voto');
    });

    it('debería rechazar solicitud sin autenticación', async () => {
      const response = await request(app)
        .get('/api/votacion/mis-votos');

      expect(response.status).toBe(401);
    });
  });
});
