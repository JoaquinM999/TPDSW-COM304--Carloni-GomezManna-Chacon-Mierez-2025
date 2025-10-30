import path from 'path';
import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '..', '.env') });

import ormConfig from './src/mikro-orm.config';
import { MikroORM } from '@mikro-orm/mysql';
import { Lista } from './src/entities/lista.entity';
import { ContenidoLista } from './src/entities/contenidoLista.entity';

/**
 * Script para limpiar listas duplicadas
 * Mantiene la lista más antigua y migra el contenido de las duplicadas
 * Uso: npx ts-node cleanup-duplicate-listas.ts
 */

(async () => {
  const orm = await MikroORM.init(ormConfig);
  const em = orm.em.fork();

  try {
    console.log('🔍 Buscando listas duplicadas...\n');

    // Obtener todas las listas agrupadas por usuario y nombre
    const todasLasListas = await em.find(Lista, {}, {
      populate: ['usuario', 'contenidos'],
      orderBy: { createdAt: 'ASC' } // Ordenar por fecha de creación (más antigua primero)
    });

    // Agrupar por usuario y nombre
    const listasPorUsuario = new Map<number, Map<string, Lista[]>>();
    
    for (const lista of todasLasListas) {
      const userId = lista.usuario.id;
      const nombre = lista.nombre;

      if (!listasPorUsuario.has(userId)) {
        listasPorUsuario.set(userId, new Map());
      }

      const listasUsuario = listasPorUsuario.get(userId)!;
      if (!listasUsuario.has(nombre)) {
        listasUsuario.set(nombre, []);
      }

      listasUsuario.get(nombre)!.push(lista);
    }

    let totalDuplicadasEliminadas = 0;
    let totalLibrosMigrados = 0;

    // Procesar cada usuario
    for (const [userId, listasUsuario] of listasPorUsuario) {
      for (const [nombre, listas] of listasUsuario) {
        if (listas.length > 1) {
          console.log(`📋 Usuario ${userId} - Lista "${nombre}": ${listas.length} duplicados encontrados`);
          
          // Mantener la primera (más antigua)
          const listaOriginal = listas[0];
          const listasDuplicadas = listas.slice(1);

          console.log(`   ✅ Manteniendo lista ID ${listaOriginal.id} (creada: ${listaOriginal.createdAt})`);

          // Migrar contenido de las duplicadas a la original
          for (const listaDuplicada of listasDuplicadas) {
            const contenidos = await em.find(ContenidoLista, { lista: listaDuplicada });
            
            if (contenidos.length > 0) {
              console.log(`   📦 Migrando ${contenidos.length} libros de lista ID ${listaDuplicada.id}`);
              
              for (const contenido of contenidos) {
                // Verificar si el libro ya está en la lista original
                const yaExiste = await em.findOne(ContenidoLista, {
                  lista: listaOriginal,
                  libro: contenido.libro
                });

                if (!yaExiste) {
                  // Cambiar la referencia a la lista original
                  contenido.lista = listaOriginal;
                  em.persist(contenido);
                  totalLibrosMigrados++;
                } else {
                  // Si ya existe, eliminar el contenido duplicado
                  em.remove(contenido);
                }
              }
            }

            // Eliminar la lista duplicada
            console.log(`   🗑️  Eliminando lista duplicada ID ${listaDuplicada.id}`);
            em.remove(listaDuplicada);
            totalDuplicadasEliminadas++;
          }

          await em.flush();
          console.log(`   ✨ Limpieza completada para "${nombre}"\n`);
        }
      }
    }

    if (totalDuplicadasEliminadas === 0) {
      console.log('✅ No se encontraron listas duplicadas. ¡Todo limpio!\n');
    } else {
      console.log('📊 RESUMEN:');
      console.log(`   Listas duplicadas eliminadas: ${totalDuplicadasEliminadas}`);
      console.log(`   Libros migrados: ${totalLibrosMigrados}`);
      console.log('\n✨ ¡Limpieza completada exitosamente!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await orm.close();
  }
})();
