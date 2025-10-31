import { MikroORM } from '@mikro-orm/core';
import config from './mikro-orm.config';

/**
 * Script para limpiar listas duplicadas en la base de datos
 * 
 * Este script:
 * 1. Elimina TODAS las listas de todos los usuarios
 * 2. Elimina TODOS los contenidos de listas relacionados
 * 3. Permite empezar desde cero sin duplicados
 * 
 * ADVERTENCIA: Esta operación es IRREVERSIBLE
 */

async function limpiarListas() {
  console.log('🚀 Iniciando limpieza de listas...\n');

  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  try {
    // 1. Contar listas antes de eliminar
    const totalListas = await em.getConnection().execute('SELECT COUNT(*) as count FROM lista');
    const totalContenidos = await em.getConnection().execute('SELECT COUNT(*) as count FROM contenido_lista');
    
    console.log('📊 Estado actual:');
    console.log(`   - Listas totales: ${totalListas[0].count}`);
    console.log(`   - Contenidos de listas: ${totalContenidos[0].count}\n`);

    // 2. Mostrar listas duplicadas (para registro)
    const duplicados = await em.getConnection().execute(`
      SELECT 
        usuario_id,
        tipo,
        nombre,
        COUNT(*) as cantidad
      FROM lista
      GROUP BY usuario_id, tipo, nombre
      HAVING COUNT(*) > 1
    `);

    if (duplicados.length > 0) {
      console.log('⚠️  Listas duplicadas encontradas:');
      duplicados.forEach((dup: any) => {
        console.log(`   - Usuario ${dup.usuario_id}: tipo="${dup.tipo}", nombre="${dup.nombre}" (${dup.cantidad} copias)`);
      });
      console.log('');
    } else {
      console.log('✅ No se encontraron duplicados explícitos\n');
    }

    // 3. Preguntar confirmación (comentar en producción si se ejecuta automáticamente)
    console.log('⚠️  ¡ATENCIÓN! Esta operación eliminará TODAS las listas y su contenido.');
    console.log('   Presiona Ctrl+C para cancelar, o continúa en 5 segundos...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 4. Eliminar TODOS los contenidos de listas primero (por foreign key)
    console.log('🗑️  Eliminando contenidos de listas...');
    await em.getConnection().execute('DELETE FROM contenido_lista');
    console.log('✅ Contenidos eliminados\n');

    // 5. Eliminar TODAS las listas
    console.log('🗑️  Eliminando todas las listas...');
    await em.getConnection().execute('DELETE FROM lista');
    console.log('✅ Listas eliminadas\n');

    // 6. Resetear auto-increment (opcional, para empezar IDs desde 1)
    console.log('🔄 Reseteando secuencias...');
    await em.getConnection().execute('ALTER TABLE lista AUTO_INCREMENT = 1');
    await em.getConnection().execute('ALTER TABLE contenido_lista AUTO_INCREMENT = 1');
    console.log('✅ Secuencias reseteadas\n');

    // 7. Verificar que todo está limpio
    const finalListas = await em.getConnection().execute('SELECT COUNT(*) as count FROM lista');
    const finalContenidos = await em.getConnection().execute('SELECT COUNT(*) as count FROM contenido_lista');
    
    console.log('📊 Estado final:');
    console.log(`   - Listas totales: ${finalListas[0].count}`);
    console.log(`   - Contenidos de listas: ${finalContenidos[0].count}\n`);

    console.log('✨ ¡Limpieza completada exitosamente!');
    console.log('📝 Ahora las listas se crearán correctamente sin duplicados.');
    console.log('🔧 Asegúrate de que el backend tenga la validación implementada.\n');

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  } finally {
    await orm.close();
  }
}

// Ejecutar el script
limpiarListas()
  .then(() => {
    console.log('✅ Script terminado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
