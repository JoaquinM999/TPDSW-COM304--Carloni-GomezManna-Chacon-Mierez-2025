import path from 'path';
import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '..', '.env') });

import ormConfig from './src/mikro-orm.config';
import { MikroORM } from '@mikro-orm/mysql';
import { Saga } from './src/entities/saga.entity';
import { Libro } from './src/entities/libro.entity';

/**
 * Script para crear Sagas de ejemplo y asociarlas a libros existentes.
 * Uso: node dist/seed-sagas.js  (después de compilar TypeScript) o ts-node
 * El script evita duplicados consultando por nombre de saga.
 */

(async () => {
  const orm = await MikroORM.init(ormConfig);
  const em = orm.em.fork();

  // Lista de sagas a crear. Cada entrada puede incluir una lista de títulos o externalIds
  // que se usarán para asociar libros ya existentes en la base de datos.
  const sagasToCreate: Array<{ nombre: string; libroNombres?: string[]; libroExternalIds?: string[] }> = [
    { nombre: 'Saga de ejemplo A', libroNombres: ['Libro Ejemplo 1', 'Libro Ejemplo 2'] },
    { nombre: 'Saga de ejemplo B', libroExternalIds: ['EXTERNAL_ID_1', 'EXTERNAL_ID_2'] },
    { nombre: 'Saga clásica: Cronicas', libroNombres: ['Las crónicas del ejemplo'] },
  ];

  try {
    for (const s of sagasToCreate) {
      const existing = await em.findOne(Saga, { nombre: s.nombre });
      if (existing) {
        console.log(`Saga ya existe: ${s.nombre} (id=${existing.id})`);
        continue;
      }

      // Buscar libros por nombre o externalId
      const libroIds: number[] = [];

      if (s.libroNombres && s.libroNombres.length > 0) {
        for (const nombre of s.libroNombres) {
          const libro = await em.findOne(Libro, { nombre });
          if (libro) libroIds.push(libro.id);
          else console.warn(`No se encontró libro por nombre para asociar a saga '${s.nombre}': ${nombre}`);
        }
      }

      if (s.libroExternalIds && s.libroExternalIds.length > 0) {
        for (const extId of s.libroExternalIds) {
          const libro = await em.findOne(Libro, { externalId: extId });
          if (libro) libroIds.push(libro.id);
          else console.warn(`No se encontró libro por externalId para asociar a saga '${s.nombre}': ${extId}`);
        }
      }

      // Crear saga en transacción
      await em.transactional(async (trx) => {
        const saga = trx.create(Saga, { nombre: s.nombre, createdAt: new Date() });
        if (libroIds.length > 0) {
          const libros = await trx.find(Libro, { id: { $in: libroIds } });
          saga.libros.set(libros);
        }
        await trx.persistAndFlush(saga);
        console.log(`Saga creada: ${s.nombre} (id=${saga.id}) con ${saga.libros.length} libros asociados`);
      });
    }
  } catch (error) {
    console.error('Error ejecutando seed de sagas:', error);
  } finally {
    await orm.close();
  }
})().catch((err) => {
  console.error(err);
});
