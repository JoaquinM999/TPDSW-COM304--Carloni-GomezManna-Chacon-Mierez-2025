import fetch from 'node-fetch';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY; // guardala en .env

export const buscarLibro = async (query: string) => {
  try {
    const response = await fetch(`${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&key=${API_KEY}`);
    const data = await response.json() as { items?: any[] };
    return data.items || [];
  } catch (error) {
    console.error('Error buscando libro:', error);
    return [];
  }
};
