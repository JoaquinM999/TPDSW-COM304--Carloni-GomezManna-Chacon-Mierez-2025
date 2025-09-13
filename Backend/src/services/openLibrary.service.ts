import axios from 'axios';

export interface OpenLibraryAuthorSearchResult {
  key: string;
  text: string;
  type: string;
  work_count: number;
  top_work: string;
  top_subjects: string[];
}

export interface OpenLibraryAuthorDetails {
  key: string;
  name: string;
  birth_date?: string;
  death_date?: string;
  bio?: string | { value: string };
  photos?: number[];
  links?: Array<{ title: string; url: string }>;
}

export interface OpenLibraryWork {
  key: string;
  title: string;
  first_publish_date?: string;
  cover_edition_key?: string;
  covers?: number[];
  authors?: Array<{ author: { key: string } }>;
  subjects?: string[];
}

export interface OpenLibraryWorksResponse {
  size: number;
  entries: OpenLibraryWork[];
}

export class OpenLibraryService {
  private baseUrl = 'https://openlibrary.org';

  async searchAuthors(query: string): Promise<OpenLibraryAuthorSearchResult[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/search/authors.json`, {
        params: { q: query, limit: 10 }
      });
      return response.data.docs || [];
    } catch (error) {
      console.error('Error searching authors:', error);
      throw new Error('Failed to search authors');
    }
  }

  async getAuthorDetails(authorId: string): Promise<OpenLibraryAuthorDetails | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/authors/${authorId}.json`);
      return response.data;
    } catch (error) {
      console.error('Error getting author details:', error);
      return null;
    }
  }

  async getAuthorWorks(authorId: string): Promise<OpenLibraryWork[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/authors/${authorId}/works.json`);
      return response.data.entries || [];
    } catch (error) {
      console.error('Error getting author works:', error);
      return [];
    }
  }

  getAuthorPhotoUrl(authorDetails: OpenLibraryAuthorDetails): string | null {
    if (authorDetails.photos && authorDetails.photos.length > 0) {
      return `https://covers.openlibrary.org/a/id/${authorDetails.photos[0]}-L.jpg`;
    }
    return null;
  }
}
