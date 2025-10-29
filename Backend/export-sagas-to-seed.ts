import path from 'path';
import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '.env') });

import ormConfig from './src/mikro-orm.config';
import { MikroORM } from '@mikro-orm/mysql';
import { Saga } from './src/entities/saga.entity';
import { Libro } from './src/entities/libro.entity';
import { Autor } from './src/entities/autor.entity';
import { Categoria } from './src/entities/categoria.entity';
import { Editorial } from './src/entities/editorial.entity';
import fs from 'fs';

/**
 * Script para exportar sagas existentes de la base de datos a un formato de seed.
 * Crea un archivo seed-sagas.ts con las sagas y sus libros asociados.
 * Uso: ts-node export-sagas-to-seed.ts
 */

(async () => {
  const orm = await MikroORM.init(ormConfig);
  const em = orm.em.fork();

  try {
    console.log('Exportando sagas existentes a formato de seed...');

    // Obtener todas las sagas con sus libros asociados
    const sagas = await em.find(Saga, {}, {
      populate: ['libros.autor', 'libros.categoria', 'libros.editorial']
    });

    if (sagas.length === 0) {
      console.log('No se encontraron sagas en la base de datos.');
      await orm.close();
      return;
    }

    console.log(`Encontradas ${sagas.length} sagas. Procesando...`);

    // Crear el contenido del archivo seed
    let seedContent = `import path from 'path';
import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '..', '.env') });

import ormConfig from './src/mikro-orm.config';
import { MikroORM } from '@mikro-orm/mysql';
import { Saga } from './src/entities/saga.entity';
import { Libro } from './src/entities/libro.entity';
import { Autor } from './src/entities/autor.entity';
import { Categoria } from './src/entities/categoria.entity';
import { Editorial } from './src/entities/editorial.entity';

/**
 * Script para crear Sagas de master data y asociarlas a libros existentes.
 * Este archivo fue generado automáticamente desde la base de datos.
 * Uso: ts-node seed-sagas.ts
 */

(async () => {
  const orm = await MikroORM.init(ormConfig);
  const em = orm.em.fork();

  try {
    console.log('Creando sagas de master data...');

    // Datos de master data exportados de la base de datos
    const masterData = {
      autores: [\n`;

    // Recopilar autores únicos
    const autoresMap = new Map<number, any>();
    const categoriasMap = new Map<number, any>();
    const editorialesMap = new Map<number, any>();

    for (const saga of sagas) {
      for (const libro of saga.libros.getItems()) {
        if (libro.autor && !autoresMap.has(libro.autor.id)) {
          autoresMap.set(libro.autor.id, {
            id: libro.autor.id,
            nombre: libro.autor.nombre,
            apellido: libro.autor.apellido,
            createdAt: libro.autor.createdAt
          });
        }
        if (libro.categoria && !categoriasMap.has(libro.categoria.id)) {
          categoriasMap.set(libro.categoria.id, {
            id: libro.categoria.id,
            nombre: libro.categoria.nombre,
            createdAt: libro.categoria.createdAt
          });
        }
        if (libro.editorial && !editorialesMap.has(libro.editorial.id)) {
          editorialesMap.set(libro.editorial.id, {
            id: libro.editorial.id,
            nombre: libro.editorial.nombre,
            createdAt: libro.editorial.createdAt
          });
        }
      }
    }

    // Agregar autores al seed
    for (const autor of autoresMap.values()) {
      seedContent += `      {
        id: ${autor.id},
        nombre: "${autor.nombre.replace(/"/g, '\\"')}",
        apellido: "${autor.apellido.replace(/"/g, '\\"')}",
        createdAt: new Date("${autor.createdAt.toISOString()}")
      },\n`;
    }

    seedContent += `    ],
    categorias: [\n`;

    // Agregar categorías al seed
    for (const categoria of categoriasMap.values()) {
      seedContent += `      {
        id: ${categoria.id},
        nombre: "${categoria.nombre.replace(/"/g, '\\"')}",
        createdAt: new Date("${categoria.createdAt.toISOString()}")
      },\n`;
    }

    seedContent += `    ],
    editoriales: [\n`;

    // Agregar editoriales al seed
    for (const editorial of editorialesMap.values()) {
      seedContent += `      {
        id: ${editorial.id},
        nombre: "${editorial.nombre.replace(/"/g, '\\"')}",
        createdAt: new Date("${editorial.createdAt.toISOString()}")
      },\n`;
    }

    seedContent += `    ],
    libros: [\n`;

    // Agregar libros al seed
    const librosMap = new Map<number, any>();
    for (const saga of sagas) {
      for (const libro of saga.libros.getItems()) {
        if (!librosMap.has(libro.id)) {
          librosMap.set(libro.id, {
            id: libro.id,
            nombre: libro.nombre,
            sinopsis: libro.sinopsis,
            imagen: libro.imagen,
            enlace: libro.enlace,
            externalId: libro.externalId,
            source: libro.source,
            autorId: libro.autor?.id,
            categoriaId: libro.categoria?.id,
            editorialId: libro.editorial?.id,
            createdAt: libro.createdAt
          });
        }
      }
    }

    for (const libro of librosMap.values()) {
      seedContent += `      {
        id: ${libro.id},
        nombre: "${libro.nombre.replace(/"/g, '\\"')}",
        sinopsis: ${libro.sinopsis ? `"${libro.sinopsis.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"` : 'null'},
        imagen: ${libro.imagen ? `"${libro.imagen.replace(/"/g, '\\"')}"` : 'null'},
        enlace: ${libro.enlace ? `"${libro.enlace.replace(/"/g, '\\"')}"` : 'null'},
        externalId: ${libro.externalId ? `"${libro.externalId.replace(/"/g, '\\"')}"` : 'null'},
        source: "${libro.source}",
        autorId: ${libro.autorId || 'null'},
        categoriaId: ${libro.categoriaId || 'null'},
        editorialId: ${libro.editorialId || 'null'},
        createdAt: new Date("${libro.createdAt.toISOString()}")
      },\n`;
    }

    seedContent += `    ],
    sagas: [\n`;

    // Agregar sagas al seed
    for (const saga of sagas) {
      const libroIds = saga.libros.getItems().map(libro => libro.id);
      seedContent += `      {
        id: ${saga.id},
        nombre: "${saga.nombre.replace(/"/g, '\\"')}",
        libroIds: [${libroIds.join(', ')}],
        createdAt: new Date("${saga.createdAt.toISOString()}")
      },\n`;
    }

    seedContent += `    ]
    };

    // Crear entidades si no existen
    console.log('Creando autores...');
    for (const autorData of masterData.autores) {
      const existing = await em.findOne(Autor, { nombre: autorData.nombre, apellido: autorData.apellido });
      if (!existing) {
        const autor = em.create(Autor, {
          nombre: autorData.nombre,
          apellido: autorData.apellido,
          createdAt: autorData.createdAt
        });
        await em.persistAndFlush(autor);
        console.log(\`Autor creado: \${autor.nombre} \${autor.apellido}\`);
      }
    }

    console.log('Creando categorías...');
    for (const categoriaData of masterData.categorias) {
      const existing = await em.findOne(Categoria, { nombre: categoriaData.nombre });
      if (!existing) {
        const categoria = em.create(Categoria, {
          nombre: categoriaData.nombre,
          createdAt: categoriaData.createdAt
        });
        await em.persistAndFlush(categoria);
        console.log(\`Categoría creada: \${categoria.nombre}\`);
      }
    }

    console.log('Creando editoriales...');
    for (const editorialData of masterData.editoriales) {
      const existing = await em.findOne(Editorial, { nombre: editorialData.nombre });
      if (!existing) {
        const editorial = em.create(Editorial, {
          nombre: editorialData.nombre,
          createdAt: editorialData.createdAt
        });
        await em.persistAndFlush(editorial);
        console.log(\`Editorial creada: \${editorial.nombre}\`);
      }
    }

    console.log('Creando libros...');
    for (const libroData of masterData.libros) {
      const existing = await em.findOne(Libro, { nombre: libroData.nombre });
      if (!existing) {
        const autor = libroData.autorId ? await em.findOne(Autor, { id: libroData.autorId }) : null;
        const categoria = libroData.categoriaId ? await em.findOne(Categoria, { id: libroData.categoriaId }) : null;
        const editorial = libroData.editorialId ? await em.findOne(Editorial, { id: libroData.editorialId }) : null;

        const libro = em.create(Libro, {
          nombre: libroData.nombre,
          sinopsis: libroData.sinopsis,
          imagen: libroData.imagen,
          enlace: libroData.enlace,
          externalId: libroData.externalId,
          source: libroData.source,
          autor: autor,
          categoria: categoria,
          editorial: editorial,
          createdAt: libroData.createdAt
        });
        await em.persistAndFlush(libro);
        console.log(\`Libro creado: \${libro.nombre}\`);
      }
    }

    console.log('Creando sagas...');
    for (const sagaData of masterData.sagas) {
      const existing = await em.findOne(Saga, { nombre: sagaData.nombre });
      if (!existing) {
        const libros = await em.find(Libro, { id: { \$in: sagaData.libroIds } });

        const saga = em.create(Saga, {
          nombre: sagaData.nombre,
          createdAt: sagaData.createdAt
        });
        saga.libros.set(libros);
        await em.persistAndFlush(saga);
        console.log(\`Saga creada: \${saga.nombre} con \${libros.length} libros\`);
      }
    }

    console.log('Master data creado exitosamente!');
  } catch (error) {
    console.error('Error creando master data:', error);
  } finally {
    await orm.close();
  }
})().catch((err) => {
  console.error(err);
});
`;

    // Escribir el archivo seed-sagas.ts
    fs.writeFileSync(path.join(__dirname, 'seed-sagas.ts'), seedContent);

    console.log(`Archivo seed-sagas.ts generado exitosamente con ${sagas.length} sagas y sus libros asociados.`);

  } catch (error) {
    console.error('Error exportando sagas:', error);
  } finally {
    await orm.close();
  }
})().catch((err) => {
  console.error(err);
});
