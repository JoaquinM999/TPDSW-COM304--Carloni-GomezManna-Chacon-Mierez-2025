import { EntityManager } from '@mikro-orm/core';
import { Autor } from '../entities/autor.entity';
import axios from 'axios';

const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

interface GoogleBooksAuthor {
  name: string;
}

interface OpenLibraryAuthor {
  key: string;
  name: string;
  birth_date?: string;
  death_date?: string;
  bio?: string | { value: string };
  photos?: number[];
}

/**
 * Reconcilia un autor de Google Books con la base de datos.
 * Evita duplicados buscando primero por googleBooksId, luego por nombre.
 */
export async function reconcileGoogleBooksAuthor(
  em: EntityManager,
  autorNombreCompleto: string
): Promise<Autor> {
  try {
    const partesNombre = autorNombreCompleto.trim().split(' ');
    const nombre = partesNombre[0] || autorNombreCompleto;
    const apellido = partesNombre.slice(1).join(' ') || '';
    
    // Generar ID único para Google Books
    const googleBooksAuthorId = `google_${autorNombreCompleto.toLowerCase().replace(/\s+/g, '_')}`;
    
    // Paso 1: Buscar por googleBooksId
    let autor = await em.findOne(Autor, { googleBooksId: googleBooksAuthorId });
    
    if (!autor) {
      // Paso 2: Buscar por nombre completo
      autor = await em.findOne(Autor, { nombre, apellido });
      
      if (autor) {
        // Actualizar con el googleBooksId si no tiene uno
        if (!autor.googleBooksId) {
          autor.googleBooksId = googleBooksAuthorId;
        }
      } else {
        // Paso 3: Crear nuevo autor
        autor = em.create(Autor, {
          nombre,
          apellido,
          googleBooksId: googleBooksAuthorId,
          createdAt: new Date()
        });
        await em.persist(autor);
      }
    }
    
    return autor;
  } catch (error: any) {
    console.error(`❌ Error en reconcileGoogleBooksAuthor para "${autorNombreCompleto}":`, error.message);
    throw error;
  }
}

/**
 * Reconcilia un autor de OpenLibrary con la base de datos.
 * Evita duplicados buscando primero por openLibraryKey, luego por nombre.
 */
export async function reconcileOpenLibraryAuthor(
  em: EntityManager,
  openLibraryAuthor: OpenLibraryAuthor
): Promise<Autor> {
  try {
    const autorNombreCompleto = openLibraryAuthor.name.trim();
    const partesNombre = autorNombreCompleto.split(' ');
    const nombre = partesNombre[0] || autorNombreCompleto;
    const apellido = partesNombre.slice(1).join(' ') || '';
    
    const openLibraryKey = openLibraryAuthor.key;
    
    // Paso 1: Buscar por openLibraryKey
    let autor = await em.findOne(Autor, { openLibraryKey });
    
    if (!autor) {
      // Paso 2: Buscar por nombre completo
      autor = await em.findOne(Autor, { nombre, apellido });
      
      if (autor) {
        // Actualizar con el openLibraryKey si no tiene uno
        if (!autor.openLibraryKey) {
          autor.openLibraryKey = openLibraryKey;
        }
        
        // Actualizar biografía y foto si no las tiene
        if (!autor.biografia && openLibraryAuthor.bio) {
          autor.biografia = typeof openLibraryAuthor.bio === 'string' 
            ? openLibraryAuthor.bio 
            : openLibraryAuthor.bio.value;
        }
        
        if (!autor.foto && openLibraryAuthor.photos && openLibraryAuthor.photos.length > 0) {
          autor.foto = `https://covers.openlibrary.org/a/id/${openLibraryAuthor.photos[0]}-M.jpg`;
        }
      } else {
        // Paso 3: Crear nuevo autor
        const biografia = openLibraryAuthor.bio 
          ? (typeof openLibraryAuthor.bio === 'string' ? openLibraryAuthor.bio : openLibraryAuthor.bio.value)
          : undefined;
        
        const foto = openLibraryAuthor.photos && openLibraryAuthor.photos.length > 0
          ? `https://covers.openlibrary.org/a/id/${openLibraryAuthor.photos[0]}-M.jpg`
          : undefined;
        
        autor = em.create(Autor, {
          nombre,
          apellido,
          openLibraryKey,
          biografia,
          foto,
          createdAt: new Date()
        });
        await em.persist(autor);
      }
    }
    
    return autor;
  } catch (error: any) {
    console.error(`❌ Error en reconcileOpenLibraryAuthor:`, error.message);
    throw error;
  }
}

/**
 * Busca autores en Google Books API y los reconcilia con la BDD
 */
export async function searchGoogleBooksAuthors(
  em: EntityManager,
  query: string
): Promise<Autor[]> {
  try {
    console.log('📖 Buscando en Google Books API:', query);
    
    const url = `https://www.googleapis.com/books/v1/volumes?q=inauthor:${encodeURIComponent(query)}&maxResults=10${GOOGLE_BOOKS_API_KEY ? `&key=${GOOGLE_BOOKS_API_KEY}` : ''}`;
    const response = await axios.get(url, { timeout: 5000 });
    
    if (!response.data.items) {
      console.log('⚠️ No se encontraron libros en Google Books');
      return [];
    }
    
    // Extraer autores únicos
    const authorsSet = new Set<string>();
    response.data.items.forEach((item: any) => {
      if (item.volumeInfo?.authors) {
        item.volumeInfo.authors.forEach((author: string) => {
          authorsSet.add(author);
        });
      }
    });
    
    console.log(`✅ Encontrados ${authorsSet.size} autores únicos en Google Books`);
    
    // Reconciliar cada autor con la BDD
    const autores: Autor[] = [];
    for (const authorName of authorsSet) {
      try {
        const autor = await reconcileGoogleBooksAuthor(em, authorName);
        autores.push(autor);
      } catch (error: any) {
        console.error(`❌ Error reconciliando autor "${authorName}":`, error.message);
      }
    }
    
    await em.flush();
    console.log(`✅ Reconciliados ${autores.length} autores de Google Books`);
    return autores;
  } catch (error: any) {
    console.error('❌ Error searching Google Books authors:', error.message);
    return [];
  }
}

/**
 * Busca autores en OpenLibrary API y los reconcilia con la BDD
 */
export async function searchOpenLibraryAuthors(
  em: EntityManager,
  query: string
): Promise<Autor[]> {
  try {
    console.log('📚 Buscando en OpenLibrary API:', query);
    
    const url = `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(query)}&limit=10`;
    const response = await axios.get(url, { timeout: 5000 });
    
    if (!response.data.docs || response.data.docs.length === 0) {
      console.log('⚠️ No se encontraron autores en OpenLibrary');
      return [];
    }
    
    console.log(`✅ Encontrados ${response.data.docs.length} autores en OpenLibrary`);
    
    // Reconciliar cada autor con la BDD
    const autores: Autor[] = [];
    for (const olAuthor of response.data.docs) {
      try {
        const autor = await reconcileOpenLibraryAuthor(em, olAuthor);
        autores.push(autor);
      } catch (error: any) {
        console.error(`❌ Error reconciliando autor OpenLibrary:`, error.message);
      }
    }
    
    await em.flush();
    console.log(`✅ Reconciliados ${autores.length} autores de OpenLibrary`);
    return autores;
  } catch (error: any) {
    console.error('❌ Error searching OpenLibrary authors:', error.message);
    return [];
  }
}
