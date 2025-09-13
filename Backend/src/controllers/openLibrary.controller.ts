import { Request, Response } from 'express';
import { OpenLibraryService } from '../services/openLibrary.service';

const openLibraryService = new OpenLibraryService();

export const searchAuthors = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string || 'fantasy'; // default query
    const authors = await openLibraryService.searchAuthors(query);
    // Map to the interface expected by frontend
    const mappedAuthors = authors.map(author => {
      const nameParts = author.text ? author.text.split(' ') : [];
      return {
        id: author.key.replace('/authors/', ''), // extract id
        nombre: nameParts[0] || '',
        apellido: nameParts.slice(1).join(' ') || '',
        libros: author.work_count || 0
      };
    });

    // Fix empty nombre and apellido by fetching author details
    for (let i = 0; i < mappedAuthors.length; i++) {
      if (!mappedAuthors[i].nombre && !mappedAuthors[i].apellido) {
        try {
          const details = await openLibraryService.getAuthorDetails(mappedAuthors[i].id);
          if (details && details.name) {
            const parts = details.name.split(' ');
            mappedAuthors[i].nombre = parts[0] || '';
            mappedAuthors[i].apellido = parts.slice(1).join(' ') || '';
          }
        } catch (error) {
          console.error('Error fetching author details:', error);
        }
      }
    }
    res.json(mappedAuthors);
  } catch (error) {
    console.error('Error searching authors:', error);
    res.status(500).json({ error: 'Failed to search authors' });
  }
};
