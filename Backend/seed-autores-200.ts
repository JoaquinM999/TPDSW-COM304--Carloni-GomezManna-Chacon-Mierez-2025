import path from 'path';
import { config } from 'dotenv';
config({ path: path.resolve(__dirname, '..', '.env') });

import ormConfig from './mikro-orm.config';
import { MikroORM } from '@mikro-orm/mysql';
import { Autor } from './src/entities/autor.entity';
import { Libro } from './src/entities/libro.entity';
import { Categoria } from './src/entities/categoria.entity';
import { Editorial } from './src/entities/editorial.entity';
import axios from 'axios';

// Lista de 200+ autores famosos organizados por categoría
const AUTORES_SEED = [
  // CLÁSICOS UNIVERSALES (60 autores)
  { nombre: 'William', apellido: 'Shakespeare', categoria: 'Clásicos' },
  { nombre: 'Miguel', apellido: 'de Cervantes', categoria: 'Clásicos' },
  { nombre: 'Jane', apellido: 'Austen', categoria: 'Clásicos' },
  { nombre: 'Charles', apellido: 'Dickens', categoria: 'Clásicos' },
  { nombre: 'Fyodor', apellido: 'Dostoevsky', categoria: 'Clásicos' },
  { nombre: 'Leo', apellido: 'Tolstoy', categoria: 'Clásicos' },
  { nombre: 'Victor', apellido: 'Hugo', categoria: 'Clásicos' },
  { nombre: 'Mark', apellido: 'Twain', categoria: 'Clásicos' },
  { nombre: 'Edgar Allan', apellido: 'Poe', categoria: 'Clásicos' },
  { nombre: 'Oscar', apellido: 'Wilde', categoria: 'Clásicos' },
  { nombre: 'Herman', apellido: 'Melville', categoria: 'Clásicos' },
  { nombre: 'Nathaniel', apellido: 'Hawthorne', categoria: 'Clásicos' },
  { nombre: 'Emily', apellido: 'Brontë', categoria: 'Clásicos' },
  { nombre: 'Charlotte', apellido: 'Brontë', categoria: 'Clásicos' },
  { nombre: 'Mary', apellido: 'Shelley', categoria: 'Clásicos' },
  { nombre: 'Bram', apellido: 'Stoker', categoria: 'Clásicos' },
  { nombre: 'Lewis', apellido: 'Carroll', categoria: 'Clásicos' },
  { nombre: 'Robert Louis', apellido: 'Stevenson', categoria: 'Clásicos' },
  { nombre: 'Alexandre', apellido: 'Dumas', categoria: 'Clásicos' },
  { nombre: 'Gustave', apellido: 'Flaubert', categoria: 'Clásicos' },
  { nombre: 'Honoré', apellido: 'de Balzac', categoria: 'Clásicos' },
  { nombre: 'Émile', apellido: 'Zola', categoria: 'Clásicos' },
  { nombre: 'Guy', apellido: 'de Maupassant', categoria: 'Clásicos' },
  { nombre: 'Anton', apellido: 'Chekhov', categoria: 'Clásicos' },
  { nombre: 'Ivan', apellido: 'Turgenev', categoria: 'Clásicos' },
  { nombre: 'Nikolai', apellido: 'Gogol', categoria: 'Clásicos' },
  { nombre: 'Johann Wolfgang', apellido: 'von Goethe', categoria: 'Clásicos' },
  { nombre: 'Friedrich', apellido: 'Schiller', categoria: 'Clásicos' },
  { nombre: 'Thomas', apellido: 'Mann', categoria: 'Clásicos' },
  { nombre: 'Franz', apellido: 'Kafka', categoria: 'Clásicos' },
  { nombre: 'James', apellido: 'Joyce', categoria: 'Clásicos' },
  { nombre: 'Virginia', apellido: 'Woolf', categoria: 'Clásicos' },
  { nombre: 'D.H.', apellido: 'Lawrence', categoria: 'Clásicos' },
  { nombre: 'E.M.', apellido: 'Forster', categoria: 'Clásicos' },
  { nombre: 'Joseph', apellido: 'Conrad', categoria: 'Clásicos' },
  { nombre: 'Henry', apellido: 'James', categoria: 'Clásicos' },
  { nombre: 'F. Scott', apellido: 'Fitzgerald', categoria: 'Clásicos' },
  { nombre: 'Ernest', apellido: 'Hemingway', categoria: 'Clásicos' },
  { nombre: 'William', apellido: 'Faulkner', categoria: 'Clásicos' },
  { nombre: 'John', apellido: 'Steinbeck', categoria: 'Clásicos' },
  { nombre: 'Jack', apellido: 'London', categoria: 'Clásicos' },
  { nombre: 'Louisa May', apellido: 'Alcott', categoria: 'Clásicos' },
  { nombre: 'L.M.', apellido: 'Montgomery', categoria: 'Clásicos' },
  { nombre: 'Dante', apellido: 'Alighieri', categoria: 'Clásicos' },
  { nombre: 'Giovanni', apellido: 'Boccaccio', categoria: 'Clásicos' },
  { nombre: 'Italo', apellido: 'Calvino', categoria: 'Clásicos' },
  { nombre: 'Umberto', apellido: 'Eco', categoria: 'Clásicos' },
  { nombre: 'Voltaire', apellido: '', categoria: 'Clásicos' },
  { nombre: 'Jean-Jacques', apellido: 'Rousseau', categoria: 'Clásicos' },
  { nombre: 'Molière', apellido: '', categoria: 'Clásicos' },
  { nombre: 'Homer', apellido: '', categoria: 'Clásicos' },
  { nombre: 'Sophocles', apellido: '', categoria: 'Clásicos' },
  { nombre: 'Euripides', apellido: '', categoria: 'Clásicos' },
  { nombre: 'Aristophanes', apellido: '', categoria: 'Clásicos' },
  { nombre: 'Virgil', apellido: '', categoria: 'Clásicos' },
  { nombre: 'Ovid', apellido: '', categoria: 'Clásicos' },
  { nombre: 'Seneca', apellido: '', categoria: 'Clásicos' },
  { nombre: 'Marcus', apellido: 'Aurelius', categoria: 'Clásicos' },
  { nombre: 'Geoffrey', apellido: 'Chaucer', categoria: 'Clásicos' },
  { nombre: 'John', apellido: 'Milton', categoria: 'Clásicos' },

  // BESTSELLERS CONTEMPORÁNEOS (50 autores)
  { nombre: 'Stephen', apellido: 'King', categoria: 'Ficción' },
  { nombre: 'J.K.', apellido: 'Rowling', categoria: 'Fantasía' },
  { nombre: 'George R.R.', apellido: 'Martin', categoria: 'Fantasía' },
  { nombre: 'Dan', apellido: 'Brown', categoria: 'Thriller' },
  { nombre: 'John', apellido: 'Grisham', categoria: 'Thriller' },
  { nombre: 'James', apellido: 'Patterson', categoria: 'Thriller' },
  { nombre: 'Lee', apellido: 'Child', categoria: 'Thriller' },
  { nombre: 'Michael', apellido: 'Crichton', categoria: 'Ciencia ficción' },
  { nombre: 'Tom', apellido: 'Clancy', categoria: 'Thriller' },
  { nombre: 'Danielle', apellido: 'Steel', categoria: 'Romance' },
  { nombre: 'Nora', apellido: 'Roberts', categoria: 'Romance' },
  { nombre: 'Nicholas', apellido: 'Sparks', categoria: 'Romance' },
  { nombre: 'Jodi', apellido: 'Picoult', categoria: 'Ficción' },
  { nombre: 'Gillian', apellido: 'Flynn', categoria: 'Thriller' },
  { nombre: 'Paula', apellido: 'Hawkins', categoria: 'Thriller' },
  { nombre: 'Ruth', apellido: 'Ware', categoria: 'Thriller' },
  { nombre: 'Liane', apellido: 'Moriarty', categoria: 'Ficción' },
  { nombre: 'Jojo', apellido: 'Moyes', categoria: 'Romance' },
  { nombre: 'David', apellido: 'Baldacci', categoria: 'Thriller' },
  { nombre: 'Harlan', apellido: 'Coben', categoria: 'Thriller' },
  { nombre: 'Karin', apellido: 'Slaughter', categoria: 'Thriller' },
  { nombre: 'Tess', apellido: 'Gerritsen', categoria: 'Thriller' },
  { nombre: 'Mary', apellido: 'Higgins Clark', categoria: 'Suspense' },
  { nombre: 'Sandra', apellido: 'Brown', categoria: 'Romance' },
  { nombre: 'Janet', apellido: 'Evanovich', categoria: 'Ficción' },
  { nombre: 'Sue', apellido: 'Grafton', categoria: 'Misterio' },
  { nombre: 'Patricia', apellido: 'Cornwell', categoria: 'Thriller' },
  { nombre: 'Jonathan', apellido: 'Franzen', categoria: 'Ficción' },
  { nombre: 'Donna', apellido: 'Tartt', categoria: 'Ficción' },
  { nombre: 'Kazuo', apellido: 'Ishiguro', categoria: 'Ficción' },
  { nombre: 'Margaret', apellido: 'Atwood', categoria: 'Ficción' },
  { nombre: 'Colleen', apellido: 'Hoover', categoria: 'Romance' },
  { nombre: 'Sally', apellido: 'Rooney', categoria: 'Ficción' },
  { nombre: 'Celeste', apellido: 'Ng', categoria: 'Ficción' },
  { nombre: 'Taylor', apellido: 'Jenkins Reid', categoria: 'Ficción' },
  { nombre: 'Fredrik', apellido: 'Backman', categoria: 'Ficción' },
  { nombre: 'Kristin', apellido: 'Hannah', categoria: 'Ficción histórica' },
  { nombre: 'Delia', apellido: 'Owens', categoria: 'Ficción' },
  { nombre: 'Anthony', apellido: 'Doerr', categoria: 'Ficción histórica' },
  { nombre: 'Markus', apellido: 'Zusak', categoria: 'Ficción histórica' },
  { nombre: 'Khaled', apellido: 'Hosseini', categoria: 'Ficción' },
  { nombre: 'Yann', apellido: 'Martel', categoria: 'Ficción' },
  { nombre: 'Paulo', apellido: 'Coelho', categoria: 'Ficción' },
  { nombre: 'Haruki', apellido: 'Murakami', categoria: 'Ficción' },
  { nombre: 'Mitch', apellido: 'Albom', categoria: 'Inspiracional' },
  { nombre: 'Malcolm', apellido: 'Gladwell', categoria: 'No ficción' },
  { nombre: 'Yuval Noah', apellido: 'Harari', categoria: 'No ficción' },
  { nombre: 'Michelle', apellido: 'Obama', categoria: 'Biografía' },
  { nombre: 'Barack', apellido: 'Obama', categoria: 'Biografía' },
  { nombre: 'Bill', apellido: 'Bryson', categoria: 'No ficción' },

  // LITERATURA LATINOAMERICANA (35 autores)
  { nombre: 'Gabriel', apellido: 'García Márquez', categoria: 'Ficción' },
  { nombre: 'Jorge Luis', apellido: 'Borges', categoria: 'Ficción' },
  { nombre: 'Julio', apellido: 'Cortázar', categoria: 'Ficción' },
  { nombre: 'Isabel', apellido: 'Allende', categoria: 'Ficción' },
  { nombre: 'Mario', apellido: 'Vargas Llosa', categoria: 'Ficción' },
  { nombre: 'Carlos', apellido: 'Fuentes', categoria: 'Ficción' },
  { nombre: 'Octavio', apellido: 'Paz', categoria: 'Poesía' },
  { nombre: 'Pablo', apellido: 'Neruda', categoria: 'Poesía' },
  { nombre: 'Laura', apellido: 'Esquivel', categoria: 'Ficción' },
  { nombre: 'Juan', apellido: 'Rulfo', categoria: 'Ficción' },
  { nombre: 'Horacio', apellido: 'Quiroga', categoria: 'Ficción' },
  { nombre: 'Ernesto', apellido: 'Sabato', categoria: 'Ficción' },
  { nombre: 'Adolfo', apellido: 'Bioy Casares', categoria: 'Ficción' },
  { nombre: 'Roberto', apellido: 'Bolaño', categoria: 'Ficción' },
  { nombre: 'Eduardo', apellido: 'Galeano', categoria: 'No ficción' },
  { nombre: 'Clarice', apellido: 'Lispector', categoria: 'Ficción' },
  { nombre: 'Jorge', apellido: 'Amado', categoria: 'Ficción' },
  { nombre: 'Rubén', apellido: 'Darío', categoria: 'Poesía' },
  { nombre: 'Gabriela', apellido: 'Mistral', categoria: 'Poesía' },
  { nombre: 'Sor Juana Inés', apellido: 'de la Cruz', categoria: 'Poesía' },
  { nombre: 'Miguel Ángel', apellido: 'Asturias', categoria: 'Ficción' },
  { nombre: 'Alejo', apellido: 'Carpentier', categoria: 'Ficción' },
  { nombre: 'José', apellido: 'Saramago', categoria: 'Ficción' },
  { nombre: 'Fernando', apellido: 'Pessoa', categoria: 'Poesía' },
  { nombre: 'César', apellido: 'Vallejo', categoria: 'Poesía' },
  { nombre: 'Alfonsina', apellido: 'Storni', categoria: 'Poesía' },
  { nombre: 'Javier', apellido: 'Marías', categoria: 'Ficción' },
  { nombre: 'Arturo', apellido: 'Pérez-Reverte', categoria: 'Ficción' },
  { nombre: 'Carlos', apellido: 'Ruiz Zafón', categoria: 'Ficción' },
  { nombre: 'Rosa', apellido: 'Montero', categoria: 'Ficción' },
  { nombre: 'Almudena', apellido: 'Grandes', categoria: 'Ficción' },
  { nombre: 'Luis', apellido: 'Sepúlveda', categoria: 'Ficción' },
  { nombre: 'Angeles', apellido: 'Mastretta', categoria: 'Ficción' },
  { nombre: 'Elena', apellido: 'Poniatowska', categoria: 'No ficción' },
  { nombre: 'Gioconda', apellido: 'Belli', categoria: 'Ficción' },

  // CIENCIA FICCIÓN Y FANTASÍA (35 autores)
  { nombre: 'Isaac', apellido: 'Asimov', categoria: 'Ciencia ficción' },
  { nombre: 'Arthur C.', apellido: 'Clarke', categoria: 'Ciencia ficción' },
  { nombre: 'Ray', apellido: 'Bradbury', categoria: 'Ciencia ficción' },
  { nombre: 'Philip K.', apellido: 'Dick', categoria: 'Ciencia ficción' },
  { nombre: 'Ursula K.', apellido: 'Le Guin', categoria: 'Fantasía' },
  { nombre: 'Frank', apellido: 'Herbert', categoria: 'Ciencia ficción' },
  { nombre: 'Robert A.', apellido: 'Heinlein', categoria: 'Ciencia ficción' },
  { nombre: 'J.R.R.', apellido: 'Tolkien', categoria: 'Fantasía' },
  { nombre: 'C.S.', apellido: 'Lewis', categoria: 'Fantasía' },
  { nombre: 'Terry', apellido: 'Pratchett', categoria: 'Fantasía' },
  { nombre: 'Neil', apellido: 'Gaiman', categoria: 'Fantasía' },
  { nombre: 'Brandon', apellido: 'Sanderson', categoria: 'Fantasía' },
  { nombre: 'Patrick', apellido: 'Rothfuss', categoria: 'Fantasía' },
  { nombre: 'Robin', apellido: 'Hobb', categoria: 'Fantasía' },
  { nombre: 'Terry', apellido: 'Brooks', categoria: 'Fantasía' },
  { nombre: 'Robert', apellido: 'Jordan', categoria: 'Fantasía' },
  { nombre: 'Orson Scott', apellido: 'Card', categoria: 'Ciencia ficción' },
  { nombre: 'Douglas', apellido: 'Adams', categoria: 'Ciencia ficción' },
  { nombre: 'William', apellido: 'Gibson', categoria: 'Ciencia ficción' },
  { nombre: 'Neal', apellido: 'Stephenson', categoria: 'Ciencia ficción' },
  { nombre: 'Kim Stanley', apellido: 'Robinson', categoria: 'Ciencia ficción' },
  { nombre: 'Iain M.', apellido: 'Banks', categoria: 'Ciencia ficción' },
  { nombre: 'Alastair', apellido: 'Reynolds', categoria: 'Ciencia ficción' },
  { nombre: 'Dan', apellido: 'Simmons', categoria: 'Ciencia ficción' },
  { nombre: 'Joe', apellido: 'Abercrombie', categoria: 'Fantasía' },
  { nombre: 'Mark', apellido: 'Lawrence', categoria: 'Fantasía' },
  { nombre: 'Brent', apellido: 'Weeks', categoria: 'Fantasía' },
  { nombre: 'Peter V.', apellido: 'Brett', categoria: 'Fantasía' },
  { nombre: 'N.K.', apellido: 'Jemisin', categoria: 'Fantasía' },
  { nombre: 'V.E.', apellido: 'Schwab', categoria: 'Fantasía' },
  { nombre: 'Leigh', apellido: 'Bardugo', categoria: 'Fantasía' },
  { nombre: 'Naomi', apellido: 'Novik', categoria: 'Fantasía' },
  { nombre: 'Andy', apellido: 'Weir', categoria: 'Ciencia ficción' },
  { nombre: 'Blake', apellido: 'Crouch', categoria: 'Ciencia ficción' },
  { nombre: 'Pierce', apellido: 'Brown', categoria: 'Ciencia ficción' },

  // ROMANCE Y JUVENIL (25 autores)
  { nombre: 'Suzanne', apellido: 'Collins', categoria: 'Juvenil' },
  { nombre: 'Stephenie', apellido: 'Meyer', categoria: 'Juvenil' },
  { nombre: 'Cassandra', apellido: 'Clare', categoria: 'Juvenil' },
  { nombre: 'Veronica', apellido: 'Roth', categoria: 'Juvenil' },
  { nombre: 'Rick', apellido: 'Riordan', categoria: 'Juvenil' },
  { nombre: 'John', apellido: 'Green', categoria: 'Juvenil' },
  { nombre: 'Rainbow', apellido: 'Rowell', categoria: 'Juvenil' },
  { nombre: 'Jennifer', apellido: 'L. Armentrout', categoria: 'Romance' },
  { nombre: 'Sarah J.', apellido: 'Maas', categoria: 'Fantasía' },
  { nombre: 'Marissa', apellido: 'Meyer', categoria: 'Juvenil' },
  { nombre: 'Marie', apellido: 'Lu', categoria: 'Juvenil' },
  { nombre: 'Tahereh', apellido: 'Mafi', categoria: 'Juvenil' },
  { nombre: 'Victoria', apellido: 'Aveyard', categoria: 'Juvenil' },
  { nombre: 'Kiera', apellido: 'Cass', categoria: 'Juvenil' },
  { nombre: 'Sabaa', apellido: 'Tahir', categoria: 'Fantasía' },
  { nombre: 'Holly', apellido: 'Black', categoria: 'Fantasía' },
  { nombre: 'Maggie', apellido: 'Stiefvater', categoria: 'Juvenil' },
  { nombre: 'Laini', apellido: 'Taylor', categoria: 'Fantasía' },
  { nombre: 'Kami', apellido: 'Garcia', categoria: 'Juvenil' },
  { nombre: 'Margaret', apellido: 'Stohl', categoria: 'Juvenil' },
  { nombre: 'Ransom', apellido: 'Riggs', categoria: 'Juvenil' },
  { nombre: 'Gayle', apellido: 'Forman', categoria: 'Juvenil' },
  { nombre: 'Jay', apellido: 'Asher', categoria: 'Juvenil' },
  { nombre: 'Lauren', apellido: 'Oliver', categoria: 'Juvenil' },
  { nombre: 'Ally', apellido: 'Condie', categoria: 'Juvenil' },

  // NO FICCIÓN Y ENSAYO (20 autores)
  { nombre: 'Walter', apellido: 'Isaacson', categoria: 'Biografía' },
  { nombre: 'Erik', apellido: 'Larson', categoria: 'Historia' },
  { nombre: 'David', apellido: 'McCullough', categoria: 'Historia' },
  { nombre: 'Doris Kearns', apellido: 'Goodwin', categoria: 'Historia' },
  { nombre: 'Stephen', apellido: 'Hawking', categoria: 'Ciencia' },
  { nombre: 'Carl', apellido: 'Sagan', categoria: 'Ciencia' },
  { nombre: 'Richard', apellido: 'Dawkins', categoria: 'Ciencia' },
  { nombre: 'Sam', apellido: 'Harris', categoria: 'Filosofía' },
  { nombre: 'Christopher', apellido: 'Hitchens', categoria: 'Ensayo' },
  { nombre: 'Jared', apellido: 'Diamond', categoria: 'Antropología' },
  { nombre: 'Nassim Nicholas', apellido: 'Taleb', categoria: 'Economía' },
  { nombre: 'Daniel', apellido: 'Kahneman', categoria: 'Psicología' },
  { nombre: 'Atul', apellido: 'Gawande', categoria: 'Medicina' },
  { nombre: 'Oliver', apellido: 'Sacks', categoria: 'Medicina' },
  { nombre: 'Mary', apellido: 'Roach', categoria: 'Ciencia' },
  { nombre: 'Jon', apellido: 'Krakauer', categoria: 'Aventura' },
  { nombre: 'Sebastian', apellido: 'Junger', categoria: 'Periodismo' },
  { nombre: 'Rebecca', apellido: 'Skloot', categoria: 'Ciencia' },
  { nombre: 'Tara', apellido: 'Westover', categoria: 'Memoria' },
  { nombre: 'Jeannette', apellido: 'Walls', categoria: 'Memoria' },
];

async function buscarLibroDeAutor(nombreCompleto: string): Promise<any | null> {
  try {
    const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
      params: {
        q: `inauthor:"${nombreCompleto}"`,
        maxResults: 1,
        langRestrict: 'es',
        orderBy: 'relevance'
      }
    });

    if (response.data.items && response.data.items.length > 0) {
      const libro = response.data.items[0].volumeInfo;
      return {
        nombre: libro.title,
        sinopsis: libro.description || `Una obra de ${nombreCompleto}`,
        imagen: libro.imageLinks?.thumbnail || libro.imageLinks?.smallThumbnail,
        enlace: libro.infoLink,
        externalId: response.data.items[0].id,
        fechaPublicacion: libro.publishedDate || null,
      };
    }
    return null;
  } catch (error) {
    console.error(`Error buscando libro para ${nombreCompleto}:`, error);
    return null;
  }
}

async function seedAutores() {
  console.log('🌱 Iniciando seed de 200+ autores...\n');

  const orm = await MikroORM.init(ormConfig);
  const em = orm.em.fork();

  try {
    // Obtener o crear categorías y editoriales genéricas
    const categoriaFiccion = await em.findOne(Categoria, { nombre: 'Ficción' }) || 
      em.create(Categoria, { 
        nombre: 'Ficción',
        createdAt: new Date()
      });
    
    const editorialGeneral = await em.findOne(Editorial, { nombre: 'Editorial General' }) || 
      em.create(Editorial, { 
        nombre: 'Editorial General',
        createdAt: new Date()
      });

    if (!categoriaFiccion.id) await em.persistAndFlush(categoriaFiccion);
    if (!editorialGeneral.id) await em.persistAndFlush(editorialGeneral);

    let autoresCreados = 0;
    let librosCreados = 0;
    let autoresExistentes = 0;

    console.log('📚 Procesando autores...\n');

    for (const autorData of AUTORES_SEED) {
      const nombreCompleto = `${autorData.nombre} ${autorData.apellido}`.trim();
      
      // Verificar si el autor ya existe
      const autorExistente = await em.findOne(Autor, {
        nombre: autorData.nombre,
        apellido: autorData.apellido || ''
      });

      if (autorExistente) {
        console.log(`⏭️  ${nombreCompleto} ya existe`);
        autoresExistentes++;
        continue;
      }

      // Crear el autor
      const nuevoAutor = em.create(Autor, {
        nombre: autorData.nombre,
        apellido: autorData.apellido || '',
        createdAt: new Date()
      });

      await em.persistAndFlush(nuevoAutor);
      autoresCreados++;
      console.log(`✅ ${nombreCompleto} creado (${autoresCreados}/${AUTORES_SEED.length})`);

      // Buscar y crear un libro del autor
      console.log(`   🔍 Buscando libro de ${nombreCompleto}...`);
      const libroData = await buscarLibroDeAutor(nombreCompleto);

      if (libroData) {
        // Verificar si el libro ya existe
        const libroExistente = await em.findOne(Libro, {
          externalId: libroData.externalId
        });

        if (!libroExistente) {
          const nuevoLibro = em.create(Libro, {
            nombre: libroData.nombre,
            sinopsis: libroData.sinopsis,
            imagen: libroData.imagen,
            enlace: libroData.enlace,
            externalId: libroData.externalId,
            source: 'google-books',
            autor: nuevoAutor,
            categoria: categoriaFiccion,
            editorial: editorialGeneral,
            createdAt: new Date()
          });

          await em.persistAndFlush(nuevoLibro);
          librosCreados++;
          console.log(`   📖 Libro "${libroData.nombre}" agregado`);
        }
      } else {
        console.log(`   ⚠️  No se encontró libro para ${nombreCompleto}`);
      }

      // Pequeña pausa para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log('\n✅ Seed completado!');
    console.log(`📊 Estadísticas:`);
    console.log(`   - Autores creados: ${autoresCreados}`);
    console.log(`   - Autores existentes: ${autoresExistentes}`);
    console.log(`   - Libros creados: ${librosCreados}`);
    console.log(`   - Total autores en BD: ${autoresCreados + autoresExistentes}`);

  } catch (error) {
    console.error('❌ Error en seed:', error);
  } finally {
    await orm.close(true);
  }
}

// Ejecutar seed
seedAutores().catch(console.error);
