import { Autor } from './entities/autor.entity';
import { Categoria } from './entities/categoria.entity';
import { ContenidoLista } from './entities/contenidoLista.entity';
import { Editorial } from './entities/editorial.entity';
import { Favorito } from './entities/favorito.entity';
import { Libro } from './entities/libro.entity';
import { Lista } from './entities/lista.entity';
import { Reaccion } from './entities/reaccion.entity';
import { Resena } from './entities/resena.entity';
import { Saga } from './entities/saga.entity';
import { Seguimiento } from './entities/seguimiento.entity';
import { Usuario } from './entities/usuario.entity';
import { Options } from '@mikro-orm/core';
import { MySqlDriver } from '@mikro-orm/mysql';
import * as dotenv from 'dotenv';

// Carga variables de entorno
dotenv.config();

// Carga variables de entorno
dotenv.config();

const config: Options = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  dbName: process.env.DB_NAME || 'tpdsw',
  entities: [Autor, Categoria, ContenidoLista, Editorial, Favorito, Libro, Lista, Reaccion, Resena, Saga, Seguimiento, Usuario],
  forceEntityConstructor: true,
  debug: true,
  migrations: {
    path: './src/migrations',
    pathTs: './src/migrations',
  },
};

export default config;

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
