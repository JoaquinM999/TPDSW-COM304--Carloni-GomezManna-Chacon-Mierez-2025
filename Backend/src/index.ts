import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/mysql';
import config from './mikro-orm.config';
import app from './app';
import dotenv from 'dotenv';
import cors from 'cors';
import redis from './redis';

dotenv.config();

// Apply CORS before initializing ORM and routes
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Permitir ambos puertos
  credentials: true,
}));

async function main() {
  const orm = await MikroORM.init(config);

  // Nota: ensureDatabase() y updateSchema() son solo para desarrollo.
  // En producción, usa las migraciones de MikroORM para manejar cambios en la DB.
  await orm.getSchemaGenerator().ensureDatabase();
  await orm.getSchemaGenerator().updateSchema();

  // Guardar ORM en app para acceder desde req.app.get('orm')
  app.set('orm', orm);

  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor en puerto ${PORT}`);
  });

  // Graceful shutdown - cerrar conexiones correctamente
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} recibido. Cerrando servidor...`);
    
    server.close(async () => {
      console.log('🔌 Servidor HTTP cerrado');
      
      try {
        await orm.close();
        console.log('🗄️ Conexiones de base de datos cerradas');
        
        await redis.quit();
        console.log('🔴 Redis desconectado');
        
        process.exit(0);
      } catch (error) {
        console.error('❌ Error al cerrar conexiones:', error);
        process.exit(1);
      }
    });

    // Forzar cierre después de 10 segundos
    setTimeout(() => {
      console.error('⚠️ Forzando cierre después de 10 segundos...');
      process.exit(1);
    }, 10000);
  };

  // Capturar señales de terminación
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch(console.error);

//import 'reflect-metadata'
//import { MikroORM } from '@mikro-orm/mysql'
//import config from './shared/mikro-orm.config'
//import { Usuario } from './entities/usuario.entity'

//async function main(){
    //const orm = await MikroORM.init(config);
    //const em = orm.em.fork();

    //const user = new Usuario();
    //user.username = "Joaquina";
    //user.email = "joagm@test.com";
    //user.id=1;
    //user.password="123";

    //await orm.getSchemaGenerator().ensureDatabase();
    //await orm.getSchemaGenerator().updateSchema();

    //await em.persistAndFlush(user);

    //const users = await em.find(Usuario, {});
    //console.log(users);

    

    //await orm.close();

//}

//main().catch(console.error);
