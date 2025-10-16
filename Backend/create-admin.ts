import path from 'path';
import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '..', '.env') });

import ormConfig from './src/mikro-orm.config';
import { MikroORM } from '@mikro-orm/mysql';
import { Usuario, RolUsuario } from './src/entities/usuario.entity';

(async () => {
  const orm = await MikroORM.init(ormConfig);
  const em = orm.em.fork();

  // Verificar si el usuario ya existe
  const existingUser = await em.findOne(Usuario, { email: 'admin@gmail.com' });
  if (existingUser) {
    console.log('El usuario admin@gmail.com ya existe.');
    await orm.close();
    return;
  }

  // Crear el usuario admin
  const adminUser = em.create(Usuario, {
    email: 'admin@gmail.com',
    password: '123456', // Se hasheará automáticamente por el hook
    username: 'admin',
    rol: RolUsuario.ADMIN,
    nombre: 'Administrador',
    createdAt: new Date(),
  });

  await em.persistAndFlush(adminUser);
  console.log('Usuario administrador creado exitosamente:');
  console.log('Email: admin@gmail.com');
  console.log('Contraseña: 123456');
  console.log('Rol: admin');

  await orm.close();
})().catch(console.error);
