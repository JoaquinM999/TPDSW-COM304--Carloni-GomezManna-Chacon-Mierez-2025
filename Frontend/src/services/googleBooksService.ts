/**
 * Servicio para integración directa con Google Books API desde el frontend
 * Obtiene información de libros y autores
 */

export interface GoogleBooksVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    language?: string;
    previewLink?: string;
    infoLink?: string;
  };
}

export interface GoogleBooksSearchResult {
  totalItems: number;
  items?: GoogleBooksVolume[];
}

export interface AuthorWorksResult {
  authorName: string;
  totalWorks: number;
  works: GoogleBooksVolume[];
}

const GOOGLE_BOOKS_API_BASE = 'https://www.googleapis.com/books/v1';

/**
 * Busca libros por autor en Google Books
 * @param authorName Nombre del autor
 * @param maxResults Cantidad máxima de resultados (default: 40)
 */
export const searchBooksByAuthor = async (
  authorName: string,
  maxResults: number = 40
): Promise<AuthorWorksResult> => {
  try {
    const query = `inauthor:"${authorName}"`;
    const params = new URLSearchParams({
      q: query,
      maxResults: Math.min(maxResults, 40).toString(),
      orderBy: 'relevance',
      printType: 'books'
    });

    const response = await fetch(`${GOOGLE_BOOKS_API_BASE}/volumes?${params}`);
    
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const data: GoogleBooksSearchResult = await response.json();

    return {
      authorName,
      totalWorks: data.totalItems || 0,
      works: data.items || []
    };
  } catch (error) {
    console.error('Error searching books by author:', error);
    return {
      authorName,
      totalWorks: 0,
      works: []
    };
  }
};

/**
 * Busca un libro específico por título y autor
 */
export const searchBook = async (
  title: string,
  author?: string
): Promise<GoogleBooksVolume | null> => {
  try {
    let query = `intitle:"${title}"`;
    if (author) {
      query += ` inauthor:"${author}"`;
    }

    const params = new URLSearchParams({
      q: query,
      maxResults: '1'
    });

    const response = await fetch(`${GOOGLE_BOOKS_API_BASE}/volumes?${params}`);
    
    if (!response.ok) {
      return null;
    }

    const data: GoogleBooksSearchResult = await response.json();
    return data.items?.[0] || null;
  } catch (error) {
    console.error('Error searching book:', error);
    return null;
  }
};

/**
 * Obtiene detalles de un libro por su ID de Google Books
 */
export const getBookById = async (volumeId: string): Promise<GoogleBooksVolume | null> => {
  try {
    const response = await fetch(`${GOOGLE_BOOKS_API_BASE}/volumes/${volumeId}`);
    
    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting book by ID:', error);
    return null;
  }
};

/**
 * Obtiene libros destacados/populares de Google Books
 * Busca bestsellers y libros con alta calificación
 */
export const getFeaturedBooks = async (maxResults: number = 10): Promise<GoogleBooksVolume[]> => {
  try {
    // Buscar libros populares con diferentes queries
    const queries = [
      'subject:fiction',
      'subject:bestseller',
      'subject:psychology',
      'subject:science'
    ];

    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    
    const params = new URLSearchParams({
      q: randomQuery,
      maxResults: maxResults.toString(),
      orderBy: 'relevance',
      printType: 'books',
      langRestrict: 'es'  // Preferencia por libros en español
    });

    const response = await fetch(`${GOOGLE_BOOKS_API_BASE}/volumes?${params}`);
    
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const data: GoogleBooksSearchResult = await response.json();
    
    // Filtrar libros con imágenes y buena información
    const filteredBooks = (data.items || []).filter(book => 
      book.volumeInfo.imageLinks?.thumbnail &&
      book.volumeInfo.description &&
      book.volumeInfo.authors?.length
    );

    return filteredBooks.slice(0, maxResults);
  } catch (error) {
    console.error('Error fetching featured books:', error);
    return [];
  }
};

/**
 * Busca libros con autocompletado (para búsqueda en tiempo real)
 */
export const searchBooksAutocomplete = async (
  query: string,
  maxResults: number = 5
): Promise<GoogleBooksVolume[]> => {
  try {
    if (query.length < 2) return [];

    const params = new URLSearchParams({
      q: query,
      maxResults: maxResults.toString(),
      printType: 'books'
    });

    const response = await fetch(`${GOOGLE_BOOKS_API_BASE}/volumes?${params}`);
    
    if (!response.ok) {
      return [];
    }

    const data: GoogleBooksSearchResult = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error in autocomplete search:', error);
    return [];
  }
};

/**
 * Obtiene estadísticas de un autor (cantidad de libros, rating promedio)
 */
export const getAuthorStatistics = async (
  authorName: string
): Promise<{
  totalBooks: number;
  averageRating: number;
  totalRatings: number;
  mostPopularBook?: GoogleBooksVolume;
}> => {
  try {
    const result = await searchBooksByAuthor(authorName, 40);
    
    if (result.works.length === 0) {
      return {
        totalBooks: 0,
        averageRating: 0,
        totalRatings: 0
      };
    }

    // Calcular rating promedio
    const booksWithRating = result.works.filter(
      book => book.volumeInfo.averageRating && book.volumeInfo.ratingsCount
    );

    let totalWeightedRating = 0;
    let totalRatings = 0;

    booksWithRating.forEach(book => {
      const rating = book.volumeInfo.averageRating || 0;
      const count = book.volumeInfo.ratingsCount || 0;
      totalWeightedRating += rating * count;
      totalRatings += count;
    });

    const averageRating = totalRatings > 0 ? totalWeightedRating / totalRatings : 0;

    // Encontrar el libro más popular (más ratings)
    const mostPopularBook = result.works.reduce((prev, current) => {
      const prevRatings = prev.volumeInfo.ratingsCount || 0;
      const currentRatings = current.volumeInfo.ratingsCount || 0;
      return currentRatings > prevRatings ? current : prev;
    }, result.works[0]);

    return {
      totalBooks: result.totalWorks,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
      mostPopularBook
    };
  } catch (error) {
    console.error('Error getting author statistics:', error);
    return {
      totalBooks: 0,
      averageRating: 0,
      totalRatings: 0
    };
  }
};

/**
 * Extrae el año de publicación de una fecha
 */
export const extractPublicationYear = (publishedDate?: string): number | null => {
  if (!publishedDate) return null;
  const match = publishedDate.match(/^\d{4}/);
  return match ? parseInt(match[0]) : null;
};

/**
 * Agrupa libros por década
 */
export const groupBooksByDecade = (books: GoogleBooksVolume[]): Map<string, GoogleBooksVolume[]> => {
  const grouped = new Map<string, GoogleBooksVolume[]>();

  books.forEach(book => {
    const year = extractPublicationYear(book.volumeInfo.publishedDate);
    if (year) {
      const decade = `${Math.floor(year / 10) * 10}s`;
      if (!grouped.has(decade)) {
        grouped.set(decade, []);
      }
      grouped.get(decade)!.push(book);
    }
  });

  return grouped;
};

/**
 * Deduplicar libros por título (para combinar con otras fuentes)
 */
export const deduplicateBooks = (
  books: GoogleBooksVolume[],
  compareTitles: string[]
): GoogleBooksVolume[] => {
  return books.filter(book => {
    const normalizedTitle = book.volumeInfo.title.toLowerCase().trim();
    return !compareTitles.some(title => 
      title.toLowerCase().trim() === normalizedTitle
    );
  });
};

/**
 * Cache para resultados de búsqueda de autores
 */
const CACHE_KEY_PREFIX = 'google_books_author_';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

export const getCachedAuthorBooks = (authorName: string): AuthorWorksResult | null => {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${authorName}`);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    if (now - timestamp > CACHE_TTL) {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${authorName}`);
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
};

export const setCachedAuthorBooks = (
  authorName: string,
  data: AuthorWorksResult
): void => {
  try {
    localStorage.setItem(
      `${CACHE_KEY_PREFIX}${authorName}`,
      JSON.stringify({
        data,
        timestamp: Date.now()
      })
    );
  } catch (error) {
    console.error('Error caching author books:', error);
  }
};

/**
 * Wrapper con cache automático
 */
export const searchBooksByAuthorWithCache = async (
  authorName: string,
  maxResults: number = 40
): Promise<AuthorWorksResult> => {
  // Intentar obtener del cache
  const cached = getCachedAuthorBooks(authorName);
  if (cached) {
    console.log('📦 Libros cargados desde caché:', authorName);
    return cached;
  }

  // Si no está en cache, fetch y guardar
  const data = await searchBooksByAuthor(authorName, maxResults);
  if (data.works.length > 0) {
    setCachedAuthorBooks(authorName, data);
  }

  return data;
};
