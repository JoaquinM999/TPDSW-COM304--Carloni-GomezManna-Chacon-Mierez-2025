import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') }); // carga .env (Carga variables de entorno)



console.log('DB_USER =>', process.env.DB_USER);
console.log('DB_PASSWORD =>', process.env.DB_PASSWORD);

import { Options } from '@mikro-orm/core';
import { MySqlDriver } from '@mikro-orm/mysql';
import { Usuario } from './entities/usuario.entity';
import { Autor } from './entities/autor.entity';
import { Editorial } from './entities/editorial.entity';
import { Libro } from './entities/libro.entity';
import { Resena } from './entities/resena.entity';
import { Categoria } from './entities/categoria.entity';
import { ContenidoLista } from './entities/contenidoLista.entity';
import { Favorito } from './entities/favorito.entity';
import { Lista } from './entities/lista.entity';
import { Reaccion } from './entities/reaccion.entity';
import { Saga } from './entities/saga.entity';
import { Seguimiento } from './entities/seguimiento.entity';
import { defineConfig } from '@mikro-orm/mysql';

const config: Options<MySqlDriver> = {
  host: process.env.DB_HOST ,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD ,
  dbName: process.env.DB_NAME,
  entities: [Usuario, Autor, Categoria, Editorial, Libro, Resena,ContenidoLista,Favorito,Lista,Reaccion,Saga,Seguimiento],
  debug: true,
  migrations: {
    path: './migrations',
    pathTs: './migrations',
  },
};

export default defineConfig(config);

//import { Options } from '@mikro-orm/core';
//import { MySqlDriver } from '@mikro-orm/mysql';
//import { Usuario } from '../entities/usuario.entity';
//import { Autor } from '../entities/autor.entity';
//import { Editorial } from '../entities/editorial.entity';
//import { Libro } from '../entities/libro.entity';
//import { Resena } from '../entities/resena.entity';
//import { Categoria } from '../entities/categoria.entity';

//const config: Options<MySqlDriver> = {
  //host: 'localhost',
  //port: 3306,
  //user: 'joaquina',
  //password: 'Utenianos2025',
  //dbName: 'agencia_personal',
  //entities: [Usuario, Autor, Categoria, Editorial, Libro, Resena],
  //forceEntityConstructor: true,
  //debug: true,
  //migrations: {
    //path: './src/migrations', 
  //},
//};

//export default config;
