import path from 'path';
import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '..', '.env') });

import ormConfig from './mikro-orm.config';
import { MikroORM } from '@mikro-orm/mysql';
import { Saga } from './entities/saga.entity';
import { Libro } from './entities/libro.entity';
import fetch from 'node-fetch';
import { buscarLibro, getBookById } from './services/googleBooks.service';
import { Autor } from './entities/autor.entity';
import { Categoria } from './entities/categoria.entity';
import { Editorial } from './entities/editorial.entity';

// Usage: ts-node src/seed-sagas.ts "Nombre de la Saga" "query libros opcional"
// Ej: ts-node src/seed-sagas.ts "Harry Potter" "Harry Potter"

(async () => {
  const args = process.argv.slice(2);
  if (!args[0]) {
    console.error('Debe proveer el nombre de la saga como primer argumento');
    process.exit(1);
  }
  const sagaNombre = args[0];
  const librosQuery = args[1] || sagaNombre; // si no provee query, usamos el nombre de saga

  const orm = await MikroORM.init(ormConfig);
  const em = orm.em.fork();

  try {
    const existing = await em.findOne(Saga, { nombre: sagaNombre });
    if (existing) {
      console.log(`Saga ya existe: ${sagaNombre} (id=${existing.id})`);
      await orm.close();
      return;
    }

    // Intentar obtener libros desde la API interna (si el servidor está corriendo)
    let librosEncontrados: Array<{ id?: number; nombre?: string; externalId?: string }> = [];
    try {
      const baseUrl = process.env.BACKEND_URL || 'http://localhost:3000';
      const searchUrl = `${baseUrl}/api/libro/search?q=${encodeURIComponent(librosQuery)}`;
      console.log('Intentando buscar libros en API interna:', searchUrl);
      const resp = await fetch(searchUrl);
      if (resp.ok) {
        const data: any = await resp.json();
        // Data puede ser array de libros (según controller: uniqueLibros)
        librosEncontrados = Array.isArray(data) ? data.map((b: any) => ({ id: b.id, nombre: b.nombre, externalId: b.externalId })) : [];
        console.log(`Libros encontrados via API: ${librosEncontrados.length}`);
      } else {
        console.warn('La API interna respondió con error, fallback a ORM');
      }
    } catch (err: unknown) {
      console.warn('No fue posible conectar con la API interna, fallback a ORM:', String(err));
    }

    // Si no obtuvimos libros desde la API, buscar en la BD local con ORM por nombre
    if (librosEncontrados.length === 0) {
      console.log('Buscando libros con ORM por nombre...');
      const libros = await em.find(Libro, { nombre: { $like: `%${librosQuery}%` } });
      librosEncontrados = libros.map(l => ({ id: l.id, nombre: l.nombre, externalId: l.externalId }));
      console.log(`Libros encontrados via ORM: ${librosEncontrados.length}`);
    }

    // Si aún no hay libros, buscar en Google Books y crear libros mínimos en la BD
    if (librosEncontrados.length === 0) {
      console.log('No se encontraron libros localmente. Buscando en Google Books...');
      const gbResults = await buscarLibro(librosQuery, 0, 10);
      console.log(`Google Books retornó ${gbResults.length} items`);
      for (const gb of gbResults) {
        // Verificar si ya existe por externalId
        let libro = await em.findOne(Libro, { externalId: gb.id });
        if (!libro) {
          // Crear autor si hay info
          let autorEntity: Autor | undefined = undefined;
          if (gb.autores && gb.autores.length > 0) {
            const nombreCompleto = gb.autores[0];
            const partes = nombreCompleto.split(' ');
            const nombre = partes[0] || nombreCompleto;
            const apellido = partes.slice(1).join(' ') || '';
            const foundAutor = await em.findOne(Autor, { nombre, apellido });
            autorEntity = foundAutor ?? undefined;
            if (!autorEntity) {
              autorEntity = em.create(Autor, { nombre, apellido, createdAt: new Date() });
              await em.persistAndFlush(autorEntity);
            }
          }

          // Categoria/editorial por defecto null (puedes ajustar si quieres crear categorías)
          libro = em.create(Libro, {
            externalId: gb.id,
            nombre: gb.titulo,
            sinopsis: gb.descripcion,
            imagen: gb.imagen,
            enlace: gb.enlace,
            source: 'google_books',
            autor: autorEntity,
            createdAt: new Date()
          });
          await em.persistAndFlush(libro);
        }
        librosEncontrados.push({ id: libro.id, nombre: libro.nombre, externalId: libro.externalId });
      }
      console.log(`Libros creados en BD desde Google Books: ${librosEncontrados.length}`);
    }

    // Crear saga y asociar los libros encontrados
    await em.transactional(async (trx) => {
      const saga = trx.create(Saga, { nombre: sagaNombre, createdAt: new Date() });
      if (librosEncontrados.length > 0) {
        // Si los IDs internos están presentes, usarlos; si no, intentar buscar por externalId
        const ids = librosEncontrados.filter(b => b.id).map(b => b.id) as number[];
        let librosToSet: Libro[] = [];
        if (ids.length > 0) {
          librosToSet = await trx.find(Libro, { id: { $in: ids } });
        } else {
          // Buscar por externalId
          const externalIds = librosEncontrados.filter(b => b.externalId).map(b => b.externalId) as string[];
          if (externalIds.length > 0) librosToSet = await trx.find(Libro, { externalId: { $in: externalIds } });
        }

        if (librosToSet.length > 0) saga.libros.set(librosToSet);
      }
      await trx.persistAndFlush(saga);
      console.log(`Saga creada: ${sagaNombre} (id=${saga.id}) con ${saga.libros.length} libros asociados`);
    });

  } catch (error) {
    console.error('Error ejecutando seed de sagas:', error);
  } finally {
    await orm.close();
  }
})();
