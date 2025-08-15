import fetch from 'node-fetch';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY; // guardala en .env

export const buscarLibro = async (query: string) => {
  try {
    const response = await fetch(
      //`${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&key=${API_KEY}` 10 resultados
      `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=40&key=${API_KEY}`//40 resultados q es lo max de
    );
    const data = (await response.json()) as { items?: any[] };

    // Mapear datos al formato esperado por el frontend
    return (data.items || []).map((item) => ({
      id: item.id,
      titulo: item.volumeInfo?.title || 'Título desconocido',
      autores: item.volumeInfo?.authors || [],
      descripcion: item.volumeInfo?.description || 'Sin descripción',
      imagen: item.volumeInfo?.imageLinks?.thumbnail || null,
      enlace: item.volumeInfo?.infoLink || null,
    }));
  } catch (error) {
    console.error('Error buscando libro:', error);
    return [];
  }
};
