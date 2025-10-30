import path from 'path';
import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '.env') });

import ormConfig from './src/mikro-orm.config';
import { MikroORM } from '@mikro-orm/mysql';
import { Saga } from './src/entities/saga.entity';

// Script para eliminar sagas de ejemplo
// Usage: ts-node delete-example-sagas.ts

(async () => {
  const orm = await MikroORM.init(ormConfig);
  const em = orm.em.fork();

  try {
    console.log('🔍 Buscando sagas de ejemplo...');

    // Buscar sagas que contengan "ejemplo", "Saga A", "Saga B", o "clásicas"
    const sagasToDelete = await em.find(Saga, {
      $or: [
        { nombre: { $like: '%ejemplo%' } },
        { nombre: { $like: '%Ejemplo%' } },
        { nombre: { $like: '%EJEMPLO%' } },
        { nombre: { $like: '%Saga A%' } },
        { nombre: { $like: '%Saga B%' } },
        { nombre: { $like: '%clásicas%' } },
        { nombre: { $like: '%clasicas%' } },
        { nombre: { $like: '%Clásicas%' } },
        { nombre: { $like: '%Clasicas%' } },
      ]
    });

    if (sagasToDelete.length === 0) {
      console.log('✅ No se encontraron sagas de ejemplo para eliminar');
      await orm.close();
      return;
    }

    console.log(`\n📋 Sagas encontradas (${sagasToDelete.length}):`);
    sagasToDelete.forEach((saga, index) => {
      console.log(`   ${index + 1}. ${saga.nombre} (ID: ${saga.id})`);
    });

    console.log('\n🗑️  Eliminando sagas...');
    await em.removeAndFlush(sagasToDelete);

    console.log(`\n✅ Se eliminaron ${sagasToDelete.length} sagas de ejemplo correctamente`);

  } catch (error) {
    console.error('❌ Error eliminando sagas de ejemplo:', error);
    throw error;
  } finally {
    await orm.close();
  }
})();
