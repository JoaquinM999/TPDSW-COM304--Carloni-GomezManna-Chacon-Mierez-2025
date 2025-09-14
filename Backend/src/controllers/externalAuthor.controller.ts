import { Request, Response } from 'express';
import axios from 'axios';

const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

interface AuthorSearchResult {
  id: string;
  name: string;
}

interface GoogleBookInfo {
  thumbnail?: string;
  description?: string;
  publisher?: string;
  publishedDate?: string;
}

interface Work {
  title: string;
  googleBooks: GoogleBookInfo;
}

interface AuthorDetailsResponse {
  author: {
    id: string;
    name: string;
    birth_date?: string;
    death_date?: string;
    bio?: string;
    photo?: string;
  };
  works: Work[];
}

async function searchAuthorByName(name: string): Promise<any[]> {
  try {
    const response = await axios.get(
      `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(name)}`
    );
    return response.data.docs || [];
  } catch (error) {
    console.error('Error searching author:', error);
    return [];
  }
}

async function getAuthorDetails(authorId: string): Promise<any | null> {
  try {
    const response = await axios.get(
      `https://openlibrary.org/authors/${authorId}.json`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting author details:', error);
    return null;
  }
}

async function getAuthorWorks(authorId: string): Promise<any[]> {
  try {
    const response = await axios.get(
      `https://openlibrary.org/authors/${authorId}/works.json`
    );
    return response.data.entries || [];
  } catch (error) {
    console.error('Error getting author works:', error);
    return [];
  }
}

async function searchBooksByAuthor(authorName: string): Promise<any[]> {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=inauthor:${encodeURIComponent(authorName)}&maxResults=40&key=${GOOGLE_BOOKS_API_KEY}`
    );
    return response.data.items || [];
  } catch (error) {
    console.error('Error searching books in Google Books:', error);
    return [];
  }
}

async function getWikipediaAuthorInfo(authorName: string): Promise<{ bio?: string; photo?: string; birth_date?: string }> {
  try {
    const response = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(authorName)}`
    );
    const data = response.data;
    return {
      bio: data.extract || undefined,
      photo: data.thumbnail?.source || undefined,
      birth_date: undefined // Wikipedia summary doesn't include birth_date easily
    };
  } catch (error) {
    console.error('Error fetching from Wikipedia:', error);
    return {};
  }
}

function combineWorksWithGoogleBooks(works: any[], googleBooks: any[]): Work[] {
  const googleBooksMap: { [key: string]: GoogleBookInfo } = {};
  googleBooks.forEach(book => {
    const title = book.volumeInfo.title;
    googleBooksMap[title.toLowerCase()] = {
      thumbnail: book.volumeInfo.imageLinks?.thumbnail || undefined,
      description: book.volumeInfo.description || undefined,
      publisher: book.volumeInfo.publisher || undefined,
      publishedDate: book.volumeInfo.publishedDate || undefined
    };
  });

  // Add fallback for works without Google Books info: try to get cover from OpenLibrary
  return works.map(work => {
    const title = work.title;
    const googleInfo = googleBooksMap[title.toLowerCase()] || {};

    // If no thumbnail from Google Books, try OpenLibrary cover id
    if (!googleInfo.thumbnail && work.covers && work.covers.length > 0) {
      googleInfo.thumbnail = `https://covers.openlibrary.org/b/id/${work.covers[0]}-M.jpg`;
    }

    return { title, googleBooks: googleInfo };
  });
}

export const searchAuthor = async (req: Request, res: Response) => {
  const { name } = req.query;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Name parameter is required' });
  }

  const authors = await searchAuthorByName(name);
  if (authors.length === 0) {
    return res.status(404).json({ error: 'Author not found' });
  }

  // Filter unique authors by name to avoid duplicates
  const uniqueAuthors = authors.filter((author, index, self) =>
    index === self.findIndex(a => a.name === author.name)
  );

  const result: AuthorSearchResult[] = uniqueAuthors.map(a => ({
    id: a.key.replace('/authors/', ''),
    name: a.name
  }));

  res.json(result);
};

export const getAuthor = async (req: Request, res: Response) => {
  const { id } = req.params;

  let authorKey: string;

  if (id.startsWith('OL')) {
    // id is the Open Library key
    authorKey = id;
  } else {
    // id is the author name, e.g., "George Orwell"
    const decodedName = decodeURIComponent(id);

    // Search for the author key
    const authors = await searchAuthorByName(decodedName);
    if (authors.length === 0) {
      return res.status(404).json({ error: 'Author not found' });
    }

    authorKey = authors[0].key.replace('/authors/', '');
  }

  const authorDetails = await getAuthorDetails(authorKey);
  if (!authorDetails) {
    return res.status(404).json({ error: 'Author details not found' });
  }

  const works = await getAuthorWorks(authorKey);
  const googleBooks = await searchBooksByAuthor(authorDetails.name);
  const combinedWorks = combineWorksWithGoogleBooks(works, googleBooks);

  // Extraer datos de OpenLibrary
  let bio = typeof authorDetails.bio === 'string'
    ? authorDetails.bio
    : authorDetails.bio?.value || undefined;
  let photo = authorDetails.photos?.length
    ? `https://covers.openlibrary.org/a/id/${authorDetails.photos[0]}-L.jpg`
    : undefined;
  let birth_date = authorDetails.birth_date || undefined;

  // Fallbacks con Wikipedia si faltan datos
  if (!bio || !photo || !birth_date) {
    const wikiInfo = await getWikipediaAuthorInfo(authorDetails.name);
    if (!bio && wikiInfo.bio) bio = wikiInfo.bio;
    if (!photo && wikiInfo.photo) photo = wikiInfo.photo;
    if (!birth_date && wikiInfo.birth_date) birth_date = wikiInfo.birth_date;
  }

  const response: AuthorDetailsResponse = {
    author: {
      id: authorKey,
      name: authorDetails.name || '',
      birth_date,
      death_date: authorDetails.death_date || undefined,
      bio,
      photo
    },
    works: combinedWorks
  };

  res.json(response);
};
