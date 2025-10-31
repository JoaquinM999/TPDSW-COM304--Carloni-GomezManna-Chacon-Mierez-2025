import { MikroORM } from '@mikro-orm/core';
import config from './mikro-orm.config';

async function detectDuplicateAutores() {
  console.log('🔍 Detectando autores duplicados...\n');
  
  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  try {
    // Query para encontrar duplicados
    const duplicates = await em.getConnection().execute(
      `SELECT nombre, apellido, COUNT(*) as count, GROUP_CONCAT(id) as ids
       FROM autor 
       GROUP BY nombre, apellido 
       HAVING COUNT(*) > 1 
       ORDER BY count DESC`
    );

    if (duplicates.length === 0) {
      console.log('✅ ¡No se encontraron autores duplicados!');
    } else {
      console.log(`❌ Se encontraron ${duplicates.length} grupos de autores duplicados:\n`);
      
      let totalDuplicates = 0;
      for (const dup of duplicates) {
        const ids = dup.ids.split(',');
        totalDuplicates += ids.length - 1; // -1 porque uno se queda como maestro
        
        console.log(`📚 "${dup.nombre} ${dup.apellido}"`);
        console.log(`   → Apariciones: ${dup.count}`);
        console.log(`   → IDs: ${dup.ids}`);
        
        // Contar libros por cada autor duplicado
        for (const id of ids) {
          const result = await em.getConnection().execute(
            'SELECT COUNT(*) as libros FROM libro WHERE autor_id = ?',
            [id]
          );
          console.log(`   → ID ${id}: ${result[0].libros} libros`);
        }
        console.log('');
      }
      
      console.log(`\n📊 Resumen:`);
      console.log(`   - Grupos duplicados: ${duplicates.length}`);
      console.log(`   - Total autores a eliminar: ${totalDuplicates}`);
      console.log(`   - Autores únicos después: ${253 - totalDuplicates}`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await orm.close();
  }
}

detectDuplicateAutores();
