import 'dotenv/config';
import { MikroORM } from '@mikro-orm/core';
import config from './mikro-orm.config';
import { Lista } from './src/entities/lista.entity';

async function actualizarNombresListas() {
  console.log('🔄 Iniciando actualización de nombres de listas...\n');

  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  try {
    // Obtener todas las listas
    const listas = await em.find(Lista, {});
    console.log(`📊 Total de listas encontradas: ${listas.length}\n`);

    let actualizadas = 0;

    for (const lista of listas) {
      let nombreAnterior = lista.nombre;
      let cambio = false;

      // Cambiar "Para Leer" a "Ver más tarde"
      if (lista.nombre === 'Para Leer' || lista.tipo === 'to_read') {
        lista.nombre = 'Ver más tarde';
        cambio = true;
      }

      // Cambiar "Pendientes" a "Pendiente"
      if (lista.nombre === 'Pendientes' || lista.tipo === 'pending') {
        lista.nombre = 'Pendiente';
        cambio = true;
      }

      if (cambio) {
        actualizadas++;
        console.log(`✏️  Lista ID ${lista.id}:`);
        console.log(`   Antes: "${nombreAnterior}"`);
        console.log(`   Después: "${lista.nombre}"`);
        console.log(`   Tipo: ${lista.tipo}\n`);
      }
    }

    if (actualizadas > 0) {
      await em.flush();
      console.log(`✅ ${actualizadas} listas actualizadas exitosamente`);
    } else {
      console.log('ℹ️  No se encontraron listas para actualizar');
    }

    // Verificar el resultado
    console.log('\n📊 Estado final:');
    const listasFinales = await em.find(Lista, {});
    
    const porTipo: Record<string, number> = {};
    listasFinales.forEach(lista => {
      porTipo[`${lista.tipo} (${lista.nombre})`] = (porTipo[`${lista.tipo} (${lista.nombre})`] || 0) + 1;
    });

    Object.entries(porTipo).forEach(([tipo, cantidad]) => {
      console.log(`   ${tipo}: ${cantidad}`);
    });

  } catch (error) {
    console.error('❌ Error al actualizar nombres:', error);
    throw error;
  } finally {
    await orm.close();
    console.log('\n✅ Script terminado');
  }
}

actualizarNombresListas().catch(console.error);
