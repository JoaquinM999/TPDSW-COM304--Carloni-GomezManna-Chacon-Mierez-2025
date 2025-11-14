// src/mikro-orm.config.ts
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

import { Options } from '@mikro-orm/core';
import { MySqlDriver } from '@mikro-orm/mysql';
import { defineConfig } from '@mikro-orm/mysql';

// entidades (asegurate de que existen estos archivos)
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

// nuevas entidades que agregaste
import { Actividad } from './entities/actividad.entity';
import { Permiso } from './entities/permiso.entity';
import { RatingLibro } from './entities/ratingLibro.entity';

const config: Options<MySqlDriver> = {
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  entities: [
    Usuario, Autor, Categoria, Editorial, Libro, Resena, ContenidoLista, Favorito,
    Lista, Reaccion, Saga, Seguimiento, Actividad, Permiso, RatingLibro
  ],
  debug: process.env.NODE_ENV !== 'production',
  migrations: {
    path: './migrations',
    pathTs: './migrations',
  },
  allowGlobalContext: true,
  driverOptions: {
    connection: {
      ssl: { rejectUnauthorized: false },
    },
  },
};

export default defineConfig(config);
