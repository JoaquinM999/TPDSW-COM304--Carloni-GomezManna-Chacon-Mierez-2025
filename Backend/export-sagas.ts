import path from 'path';
import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '..', '.env') });

import ormConfig from './src/mikro-orm.config';
import { MikroORM } from '@mikro-orm/mysql';
import { Saga } from './src/entities/saga.entity';
import { Libro } from './src/entities/libro.entity';
import { Autor } from './src/entities/autor.entity';
import { Categoria } from './src/entities/categoria.entity';
import { Editorial } from './src/entities/editorial.entity';
import * as fs from 'fs';

/**
 * Script para exportar datos actuales de la BD y generar nuevo seed-sagas.ts
 * Uso: npx ts-node export-sagas.ts
 */

(async () => {
  const orm = await MikroORM.init(ormConfig);
  const em = orm.em.fork();

  try {
    console.log('📦 Exportando datos de la base de datos...\n');

    // 1. Exportar Autores
    const autores = await em.find(Autor, {});
    console.log(`✅ Encontrados ${autores.length} autores`);

    // 2. Exportar Categorías
    const categorias = await em.find(Categoria, {});
    console.log(`✅ Encontrados ${categorias.length} categorías`);

    // 3. Exportar Editoriales
    const editoriales = await em.find(Editorial, {});
    console.log(`✅ Encontrados ${editoriales.length} editoriales`);

    // 4. Exportar Libros con sus relaciones
    const libros = await em.find(Libro, {}, { 
      populate: ['autor', 'categoria', 'editorial', 'saga'] 
    });
    console.log(`✅ Encontrados ${libros.length} libros`);

    // 5. Exportar Sagas con sus libros
    const sagas = await em.find(Saga, {}, { 
      populate: ['libros'] 
    });
    console.log(`✅ Encontrados ${sagas.length} sagas\n`);

    // Generar código TypeScript para el seed
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
 * Fecha de generación: ${new Date().toISOString()}
 * Uso: npx ts-node seed-sagas.ts
 */

interface AutorData {
  id: number;
  nombre: string;
  apellido: string;
  createdAt: Date;
}

interface CategoriaData {
  id: number;
  nombre: string;
  createdAt: Date;
}

interface EditorialData {
  id: number;
  nombre: string;
  createdAt: Date;
}

interface LibroData {
  id: number;
  nombre: string;
  sinopsis: string;
  imagen: string;
  enlace: string;
  externalId: string;
  source: string;
  autorId: number | null;
  categoriaId: number | null;
  editorialId: number | null;
  createdAt: Date;
}

interface SagaData {
  id: number;
  nombre: string;
  libroExternalIds: string[];
  createdAt: Date;
}

(async () => {
  const orm = await MikroORM.init(ormConfig);
  const em = orm.em.fork();

  try {
    console.log('Creando sagas de master data...');

    // Datos de master data exportados de la base de datos
    const masterData: {
      autores: AutorData[];
      categorias: CategoriaData[];
      editoriales: EditorialData[];
      libros: LibroData[];
      sagas: SagaData[];
    } = {
      autores: [
`;

    // Agregar autores
    autores.forEach((autor, index) => {
      const comma = index < autores.length - 1 ? ',' : '';
      seedContent += `      {
        id: ${autor.id},
        nombre: "${autor.nombre.replace(/"/g, '\\"')}",
        apellido: "${autor.apellido.replace(/"/g, '\\"')}",
        createdAt: new Date("${autor.createdAt.toISOString()}")
      }${comma}
`;
    });

    seedContent += `    ],
    categorias: [
`;

    // Agregar categorías
    categorias.forEach((categoria, index) => {
      const comma = index < categorias.length - 1 ? ',' : '';
      seedContent += `      {
        id: ${categoria.id},
        nombre: "${categoria.nombre.replace(/"/g, '\\"')}",
        createdAt: new Date("${categoria.createdAt.toISOString()}")
      }${comma}
`;
    });

    seedContent += `    ],
    editoriales: [
`;

    // Agregar editoriales
    editoriales.forEach((editorial, index) => {
      const comma = index < editoriales.length - 1 ? ',' : '';
      seedContent += `      {
        id: ${editorial.id},
        nombre: "${editorial.nombre.replace(/"/g, '\\"')}",
        createdAt: new Date("${editorial.createdAt.toISOString()}")
      }${comma}
`;
    });

    seedContent += `    ],
    libros: [
`;

    // Agregar libros
    libros.forEach((libro, index) => {
      const comma = index < libros.length - 1 ? ',' : '';
      const sinopsis = libro.sinopsis ? libro.sinopsis.replace(/"/g, '\\"').replace(/\n/g, '\\n') : '';
      const nombre = libro.nombre ? libro.nombre.replace(/"/g, '\\"') : '';
      seedContent += `      {
        id: ${libro.id},
        nombre: "${nombre}",
        sinopsis: "${sinopsis}",
        imagen: "${libro.imagen || ''}",
        enlace: "${libro.enlace || ''}",
        externalId: "${libro.externalId || ''}",
        source: "${libro.source || ''}",
        autorId: ${libro.autor?.id || 'null'},
        categoriaId: ${libro.categoria?.id || 'null'},
        editorialId: ${libro.editorial?.id || 'null'},
        createdAt: new Date("${libro.createdAt.toISOString()}")
      }${comma}
`;
    });

    seedContent += `    ],
    sagas: [
`;

    // Agregar sagas con sus libros
    sagas.forEach((saga, index) => {
      const comma = index < sagas.length - 1 ? ',' : '';
      const libroExternalIds = saga.libros.getItems()
        .map(libro => `"${libro.externalId}"`)
        .join(', ');
      
      seedContent += `      {
        id: ${saga.id},
        nombre: "${saga.nombre.replace(/"/g, '\\"')}",
        libroExternalIds: [${libroExternalIds}],
        createdAt: new Date("${saga.createdAt.toISOString()}")
      }${comma}
`;
    });

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

    if (masterData.categorias.length > 0) {
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
    } else {
      console.log('No hay categorías para crear.');
    }

    if (masterData.editoriales.length > 0) {
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
    } else {
      console.log('No hay editoriales para crear.');
    }

    console.log('Creando libros...');
    for (const libroData of masterData.libros) {
      const existing = await em.findOne(Libro, { externalId: libroData.externalId });
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

    console.log('Creando sagas y asociando libros...');
    for (const sagaData of masterData.sagas) {
      let saga = await em.findOne(Saga, { nombre: sagaData.nombre });
      
      if (!saga) {
        saga = em.create(Saga, {
          nombre: sagaData.nombre,
          createdAt: sagaData.createdAt
        });
        await em.persistAndFlush(saga);
        console.log(\`Saga creada: \${saga.nombre}\`);
      }

      // Ahora asignar la saga a cada libro usando externalId
      console.log(\`Asociando \${sagaData.libroExternalIds.length} libros a la saga: \${saga.nombre}\`);
      for (const externalId of sagaData.libroExternalIds) {
        const libro = await em.findOne(Libro, { externalId: externalId });
        if (libro) {
          libro.saga = saga;
          await em.persistAndFlush(libro);
          console.log(\`  ✅ Libro "\${libro.nombre}" asociado a saga "\${saga.nombre}"\`);
        } else {
          console.log(\`  ⚠️ Libro con externalId \${externalId} no encontrado\`);
        }
      }
      console.log(\`Saga "\${saga.nombre}" completada con sus libros\`);
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

    // Escribir el archivo
    fs.writeFileSync(
      path.join(__dirname, 'seed-sagas.ts'),
      seedContent,
      'utf-8'
    );

    console.log('✅ Archivo seed-sagas.ts generado exitosamente!\n');
    console.log('📊 Resumen:');
    console.log(`   - ${autores.length} autores`);
    console.log(`   - ${categorias.length} categorías`);
    console.log(`   - ${editoriales.length} editoriales`);
    console.log(`   - ${libros.length} libros`);
    console.log(`   - ${sagas.length} sagas`);
    console.log('\n✨ Puedes ejecutar el nuevo seed con: npx ts-node seed-sagas.ts');

  } catch (error) {
    console.error('❌ Error exportando datos:', error);
  } finally {
    await orm.close();
  }
})().catch((err) => {
  console.error(err);
});
