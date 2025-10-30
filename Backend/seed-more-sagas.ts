import path from 'path';
import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '..', '.env') });

import ormConfig from './src/mikro-orm.config';
import { MikroORM } from '@mikro-orm/mysql';
import { Saga } from './src/entities/saga.entity';
import { Libro } from './src/entities/libro.entity';
import { Autor } from './src/entities/autor.entity';

/**
 * Script para agregar más sagas populares a la base de datos
 * Uso: npx ts-node seed-more-sagas.ts
 */

interface SagaData {
  nombre: string;
  libros: LibroData[];
}

interface LibroData {
  nombre: string;
  autor: { nombre: string; apellido: string };
  sinopsis: string;
  imagen?: string;
  external_id?: string;
  enlace?: string;
}

const sagasData: SagaData[] = [
  {
    nombre: "Las Crónicas de Narnia",
    libros: [
      {
        nombre: "El león, la bruja y el ropero",
        autor: { nombre: "C.S.", apellido: "Lewis" },
        sinopsis: "Cuatro hermanos descubren el mundo mágico de Narnia dentro de un armario. Allí, con la ayuda del león Aslan, deberán luchar contra la Bruja Blanca que mantiene Narnia bajo un invierno eterno.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1353029077i/100915.jpg",
        external_id: "narnia_1"
      },
      {
        nombre: "El príncipe Caspian",
        autor: { nombre: "C.S.", apellido: "Lewis" },
        sinopsis: "Los hermanos Pevensie regresan a Narnia para ayudar al príncipe Caspian a recuperar su trono del malvado rey Miraz.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1308814417i/121749.jpg",
        external_id: "narnia_2"
      },
      {
        nombre: "La travesía del Viajero del Alba",
        autor: { nombre: "C.S.", apellido: "Lewis" },
        sinopsis: "Edmund, Lucy y su primo Eustace viajan en el barco Viajero del Alba con el rey Caspian en busca de los siete lores perdidos de Narnia.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1308814690i/6536.jpg",
        external_id: "narnia_3"
      },
      {
        nombre: "La silla de plata",
        autor: { nombre: "C.S.", apellido: "Lewis" },
        sinopsis: "Eustace y su compañera Jill son enviados a Narnia para buscar al príncipe desaparecido Rilian, hijo del rey Caspian.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1308813611i/65641.jpg",
        external_id: "narnia_4"
      }
    ]
  },
  {
    nombre: "Percy Jackson y los Dioses del Olimpo",
    libros: [
      {
        nombre: "El ladrón del rayo",
        autor: { nombre: "Rick", apellido: "Riordan" },
        sinopsis: "Percy Jackson descubre que es un semidiós, hijo de Poseidón, y debe evitar una guerra entre los dioses del Olimpo recuperando el rayo maestro de Zeus.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1400602609i/28187.jpg",
        external_id: "percy_1"
      },
      {
        nombre: "El mar de los monstruos",
        autor: { nombre: "Rick", apellido: "Riordan" },
        sinopsis: "Percy debe rescatar a su amigo Grover y recuperar el Vellocino de Oro para salvar el Campamento Mestizo.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1362520550i/28186.jpg",
        external_id: "percy_2"
      },
      {
        nombre: "La maldición del titán",
        autor: { nombre: "Rick", apellido: "Riordan" },
        sinopsis: "Percy y sus amigos deben rescatar a Artemisa y a Annabeth antes de que los titanes se levanten contra los dioses.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1390773435i/561456.jpg",
        external_id: "percy_3"
      },
      {
        nombre: "La batalla del laberinto",
        autor: { nombre: "Rick", apellido: "Riordan" },
        sinopsis: "Percy debe navegar por el peligroso Laberinto de Dédalo para evitar que las fuerzas de Cronos invadan el Campamento Mestizo.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1362520382i/1724619.jpg",
        external_id: "percy_4"
      },
      {
        nombre: "El último héroe del Olimpo",
        autor: { nombre: "Rick", apellido: "Riordan" },
        sinopsis: "La batalla final entre los dioses del Olimpo y las fuerzas de Cronos. Percy debe cumplir la profecía para salvar el Olimpo.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1362520459i/4502507.jpg",
        external_id: "percy_5"
      }
    ]
  },
  {
    nombre: "Los Juegos del Hambre",
    libros: [
      {
        nombre: "Los juegos del hambre",
        autor: { nombre: "Suzanne", apellido: "Collins" },
        sinopsis: "Katniss Everdeen se ofrece como tributo en lugar de su hermana para participar en los mortales Juegos del Hambre, una competencia televisada donde solo uno puede sobrevivir.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1586722975i/2767052.jpg",
        external_id: "hunger_games_1"
      },
      {
        nombre: "En llamas",
        autor: { nombre: "Suzanne", apellido: "Collins" },
        sinopsis: "Katniss y Peeta deben enfrentarse nuevamente a los Juegos en el Vasallaje de los Veinticinco, mientras la rebelión contra el Capitolio comienza a gestarse.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1358273780i/6148028.jpg",
        external_id: "hunger_games_2"
      },
      {
        nombre: "Sinsajo",
        autor: { nombre: "Suzanne", apellido: "Collins" },
        sinopsis: "Katniss se convierte en el Sinsajo, símbolo de la rebelión contra el Capitolio, en la batalla final por la libertad de Panem.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1586722918i/7260188.jpg",
        external_id: "hunger_games_3"
      }
    ]
  },
  {
    nombre: "Divergente",
    libros: [
      {
        nombre: "Divergente",
        autor: { nombre: "Veronica", apellido: "Roth" },
        sinopsis: "En una sociedad dividida en cinco facciones, Tris descubre que es Divergente y no encaja en ninguna categoría, lo que la pone en grave peligro.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1618526060i/13335037.jpg",
        external_id: "divergent_1"
      },
      {
        nombre: "Insurgente",
        autor: { nombre: "Veronica", apellido: "Roth" },
        sinopsis: "Tris y Cuatro luchan contra la tiranía de Jeanine Matthews mientras descubren secretos explosivos sobre su sociedad.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1325667729i/11735983.jpg",
        external_id: "divergent_2"
      },
      {
        nombre: "Leal",
        autor: { nombre: "Veronica", apellido: "Roth" },
        sinopsis: "La conclusión de la trilogía donde Tris descubre la verdad sobre su mundo y debe tomar decisiones que cambiarán todo.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1360175845i/13335040.jpg",
        external_id: "divergent_3"
      }
    ]
  },
  {
    nombre: "Maze Runner (Correr o Morir)",
    libros: [
      {
        nombre: "Correr o morir",
        autor: { nombre: "James", apellido: "Dashner" },
        sinopsis: "Thomas despierta en un ascensor sin recordar nada excepto su nombre. Llega al Claro, rodeado por un laberinto mortal que cambia cada noche.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1375596592i/6186357.jpg",
        external_id: "maze_1"
      },
      {
        nombre: "Prueba de fuego",
        autor: { nombre: "James", apellido: "Dashner" },
        sinopsis: "Los habitantes del Claro escapan del laberinto solo para enfrentarse a las Tierras Quemadas y nuevas pruebas mortales de CRUEL.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1362160901i/7631105.jpg",
        external_id: "maze_2"
      },
      {
        nombre: "La cura mortal",
        autor: { nombre: "James", apellido: "Dashner" },
        sinopsis: "Thomas y los supervivientes llegan a la Ciudad Última para descubrir la verdad detrás de CRUEL y las pruebas.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1365530435i/13186969.jpg",
        external_id: "maze_3"
      }
    ]
  },
  {
    nombre: "Crepúsculo",
    libros: [
      {
        nombre: "Crepúsculo",
        autor: { nombre: "Stephenie", apellido: "Meyer" },
        sinopsis: "Bella Swan se muda a Forks y se enamora de Edward Cullen, un misterioso estudiante que resulta ser un vampiro.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1361039443i/41865.jpg",
        external_id: "twilight_1"
      },
      {
        nombre: "Luna nueva",
        autor: { nombre: "Stephenie", apellido: "Meyer" },
        sinopsis: "Edward abandona a Bella para protegerla, pero ella encuentra consuelo en Jacob Black, quien esconde su propio secreto sobrenatural.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1361039440i/49041.jpg",
        external_id: "twilight_2"
      },
      {
        nombre: "Eclipse",
        autor: { nombre: "Stephenie", apellido: "Meyer" },
        sinopsis: "Bella debe elegir entre Edward y Jacob mientras un ejército de vampiros neófitos amenaza a Forks.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1361038355i/428263.jpg",
        external_id: "twilight_3"
      },
      {
        nombre: "Amanecer",
        autor: { nombre: "Stephenie", apellido: "Meyer" },
        sinopsis: "Bella y Edward se casan, pero su luna de miel trae consecuencias inesperadas que pondrán en peligro a todos los que aman.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1361039430i/1162543.jpg",
        external_id: "twilight_4"
      }
    ]
  },
  {
    nombre: "Canción de Hielo y Fuego",
    libros: [
      {
        nombre: "Juego de tronos",
        autor: { nombre: "George R.R.", apellido: "Martin" },
        sinopsis: "Las grandes casas de Poniente luchan por el Trono de Hierro mientras una antigua amenaza resurge más allá del Muro.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1562726234i/13496.jpg",
        external_id: "got_1"
      },
      {
        nombre: "Choque de reyes",
        autor: { nombre: "George R.R.", apellido: "Martin" },
        sinopsis: "Cinco reyes reclaman el trono mientras el invierno se acerca y los dragones regresan al mundo.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1358254803i/10572.jpg",
        external_id: "got_2"
      },
      {
        nombre: "Tormenta de espadas",
        autor: { nombre: "George R.R.", apellido: "Martin" },
        sinopsis: "La Guerra de los Cinco Reyes continúa con traiciones sangrientas y alianzas inesperadas.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1387737674i/62291.jpg",
        external_id: "got_3"
      },
      {
        nombre: "Festín de cuervos",
        autor: { nombre: "George R.R.", apellido: "Martin" },
        sinopsis: "Tras la guerra civil, nuevos jugadores emergen mientras el reino enfrenta las consecuencias del conflicto.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1429963847i/13497.jpg",
        external_id: "got_4"
      },
      {
        nombre: "Danza de dragones",
        autor: { nombre: "George R.R.", apellido: "Martin" },
        sinopsis: "Daenerys lucha por gobernar Meereen mientras Jon Snow enfrenta amenazas en el Muro.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327885335i/10664113.jpg",
        external_id: "got_5"
      }
    ]
  },
  {
    nombre: "La Rueda del Tiempo",
    libros: [
      {
        nombre: "El ojo del mundo",
        autor: { nombre: "Robert", apellido: "Jordan" },
        sinopsis: "Rand al'Thor y sus amigos huyen de su aldea cuando el Oscuro envía a sus secuaces a buscarlos.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1337818095i/228665.jpg",
        external_id: "wot_1"
      },
      {
        nombre: "La gran cacería",
        autor: { nombre: "Robert", apellido: "Jordan" },
        sinopsis: "Rand y sus compañeros persiguen el Cuerno de Valere robado mientras aprenden más sobre sus destinos.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1405883716i/233649.jpg",
        external_id: "wot_2"
      },
      {
        nombre: "El dragón renacido",
        autor: { nombre: "Robert", apellido: "Jordan" },
        sinopsis: "Rand acepta su destino como el Dragón Renacido, pero lucha contra la locura que viene con su poder.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1405886560i/34897.jpg",
        external_id: "wot_3"
      }
    ]
  },
  {
    nombre: "Seis de Cuervos",
    libros: [
      {
        nombre: "Seis de cuervos",
        autor: { nombre: "Leigh", apellido: "Bardugo" },
        sinopsis: "Kaz Brekker reúne a un equipo de marginados para un atraco imposible que podría hacerlos ricos... si sobreviven.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1459349344i/23437156.jpg",
        external_id: "soc_1"
      },
      {
        nombre: "Reino de ladrones",
        autor: { nombre: "Leigh", apellido: "Bardugo" },
        sinopsis: "Los Cuervos deben salvar el mundo de una antigua amenaza mientras enfrentan viejos enemigos y nuevas traiciones.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1480601464i/29780770.jpg",
        external_id: "soc_2"
      }
    ]
  },
  {
    nombre: "Trono de Cristal",
    libros: [
      {
        nombre: "Trono de cristal",
        autor: { nombre: "Sarah J.", apellido: "Maas" },
        sinopsis: "Celaena Sardothien, asesina en prisión, acepta competir por su libertad y convertirse en la campeona del rey.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546096879i/7896527.jpg",
        external_id: "tog_1"
      },
      {
        nombre: "Corona de medianoche",
        autor: { nombre: "Sarah J.", apellido: "Maas" },
        sinopsis: "Celaena es la Campeona del Rey, pero nuevos peligros la acechan mientras descubre secretos sobre su pasado.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1368242251i/17167166.jpg",
        external_id: "tog_2"
      },
      {
        nombre: "Heredera del fuego",
        autor: { nombre: "Sarah J.", apellido: "Maas" },
        sinopsis: "Celaena viaja a Wendlyn para recuperarse de su pasado y aprender a controlar sus poderes mágicos.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1404920967i/20613470.jpg",
        external_id: "tog_3"
      },
      {
        nombre: "Reina de las sombras",
        autor: { nombre: "Sarah J.", apellido: "Maas" },
        sinopsis: "Aelin regresa a Adarlan para vengarse del rey y liberar la magia en el reino.",
        imagen: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1430407024i/18006496.jpg",
        external_id: "tog_4"
      }
    ]
  }
];

(async () => {
  const orm = await MikroORM.init(ormConfig);
  const em = orm.em.fork();

  try {
    console.log('🔥 Creando más sagas populares...\n');

    for (const sagaData of sagasData) {
      // Verificar si la saga ya existe
      const existingSaga = await em.findOne(Saga, { nombre: sagaData.nombre });
      
      if (existingSaga) {
        console.log(`⏭️  Saga "${sagaData.nombre}" ya existe, saltando...`);
        continue;
      }

      // Crear la saga
      const saga = em.create(Saga, {
        nombre: sagaData.nombre,
        createdAt: new Date()
      });
      await em.persistAndFlush(saga);

      console.log(`📚 Saga creada: ${saga.nombre}`);

      // Crear autores y libros
      let librosCreados = 0;
      for (const libroData of sagaData.libros) {
        // Buscar o crear autor
        let autor = await em.findOne(Autor, {
          nombre: libroData.autor.nombre,
          apellido: libroData.autor.apellido
        });

        if (!autor) {
          autor = em.create(Autor, {
            nombre: libroData.autor.nombre,
            apellido: libroData.autor.apellido,
            createdAt: new Date()
          });
          await em.persistAndFlush(autor);
        }

        // Verificar si el libro ya existe
        const existingLibro = await em.findOne(Libro, {
          nombre: libroData.nombre
        });

        if (!existingLibro) {
          // Crear libro
          const libro = em.create(Libro, {
            nombre: libroData.nombre,
            sinopsis: libroData.sinopsis,
            imagen: libroData.imagen || '',
            externalId: libroData.external_id || '',
            enlace: libroData.enlace || '',
            source: 'manual',
            autor: autor,
            saga: saga,
            createdAt: new Date()
          });
          await em.persistAndFlush(libro);
          librosCreados++;
        }
      }

      console.log(`   ✅ ${librosCreados} libros creados para "${saga.nombre}"\n`);
    }

    console.log('✨ ¡Proceso completado exitosamente!\n');

    // Mostrar resumen
    const totalSagas = await em.count(Saga);
    const totalLibros = await em.count(Libro, { saga: { $ne: null } });
    
    console.log('📊 RESUMEN:');
    console.log(`   Total de sagas en BD: ${totalSagas}`);
    console.log(`   Total de libros con saga: ${totalLibros}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await orm.close();
  }
})();
