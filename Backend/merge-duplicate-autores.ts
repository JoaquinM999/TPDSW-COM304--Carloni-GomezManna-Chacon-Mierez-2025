import { MikroORM } from '@mikro-orm/core';
import config from './mikro-orm.config';

async function mergeDuplicateAutores() {
  console.log('🔄 Fusionando autores duplicados...\n');
  
  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  try {
    // Encontrar duplicados
    const duplicates = await em.getConnection().execute(
      `SELECT nombre, apellido, COUNT(*) as count, GROUP_CONCAT(id ORDER BY id) as ids
       FROM autor 
       GROUP BY nombre, apellido 
       HAVING COUNT(*) > 1 
       ORDER BY count DESC`
    );

    if (duplicates.length === 0) {
      console.log('✅ No hay duplicados para fusionar');
      return;
    }

    console.log(`📋 Encontrados ${duplicates.length} grupos de duplicados\n`);
    
    for (const dup of duplicates) {
      const ids = dup.ids.split(',').map((id: string) => parseInt(id));
      const maestroId = ids[0]; // El ID más bajo será el maestro
      const duplicadosIds = ids.slice(1); // Los demás se eliminarán

      console.log(`\n🔀 Procesando: "${dup.nombre} ${dup.apellido}"`);
      console.log(`   ✓ Maestro: ID ${maestroId}`);
      console.log(`   ✗ Duplicados a eliminar: ${duplicadosIds.join(', ')}`);

      // Reasignar todos los libros al autor maestro
      for (const dupId of duplicadosIds) {
        await em.getConnection().execute(
          'UPDATE libro SET autor_id = ? WHERE autor_id = ?',
          [maestroId, dupId]
        );
        // Contar libros reasignados
        const count = await em.getConnection().execute(
          'SELECT COUNT(*) as total FROM libro WHERE autor_id = ?',
          [maestroId]
        );
        console.log(`   → Libros reasignados de ID ${dupId} a ID ${maestroId}`);
      }

      // Eliminar autores duplicados
      for (const dupId of duplicadosIds) {
        await em.getConnection().execute(
          'DELETE FROM autor WHERE id = ?',
          [dupId]
        );
        console.log(`   ✓ Eliminado autor duplicado ID ${dupId}`);
      }
    }

    console.log('\n\n✅ Fusión completada exitosamente!');
    console.log(`   - Autores fusionados: ${duplicates.length}`);
    console.log(`   - Autores eliminados: ${duplicates.reduce((acc: number, d: any) => acc + d.count - 1, 0)}`);

  } catch (error) {
    console.error('❌ Error durante la fusión:', error);
  } finally {
    await orm.close();
  }
}

mergeDuplicateAutores();
