import { Options } from '@mikro-orm/core';
import { MySqlDriver } from '@mikro-orm/mysql';
import * as dotenv from 'dotenv';
import { Usuario } from '../entities/usuario.entity';
import { Autor } from '../entities/autor.entity';
import { Editorial } from '../entities/editorial.entity';
import { Libro } from '../entities/libro.entity';
import { Resena } from '../entities/resena.entity';
import { Categoria } from '../entities/categoria.entity';

// Carga variables de entorno
dotenv.config();

const config: Options<MySqlDriver> = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1768',
  dbName: process.env.DB_NAME || 'agencia_personal',
  entities: [Usuario, Autor, Categoria, Editorial, Libro, Resena],
  forceEntityConstructor: true,
  debug: true,
  migrations: {
    path: './src/migrations',
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
