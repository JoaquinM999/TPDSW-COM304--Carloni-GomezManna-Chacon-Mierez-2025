import React, { useState, useEffect } from 'react';

interface BookData {
  title: string;
  authors?: string[];
  publishedDate?: string;
  description?: string;
  imageLinks?: { thumbnail?: string };
  infoLink?: string;
}

interface BookDetailsFromGoogleProps {
  bookId: string;
}

const BookDetailsFromGoogle: React.FC<BookDetailsFromGoogleProps> = ({ bookId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookData, setBookData] = useState<BookData | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}?key=MI_API_KEY`);
        if (!response.ok) {
          throw new Error('Error al cargar el libro');
        }
        const data = await response.json();
        setBookData(data.volumeInfo);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchBook();
    }
  }, [bookId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!bookData) {
    return <div className="p-4">No se encontró información del libro.</div>;
  }

  const { title, authors, publishedDate, description, imageLinks, infoLink } = bookData;
  const imageUrl = imageLinks?.thumbnail || 'https://via.placeholder.com/150x200?text=No+Image';
  const desc = description || 'No hay descripción disponible';

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 max-w-md mx-auto">
      <div className="w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <img src={imageUrl} alt={title} className="max-h-full max-w-full object-contain rounded-2xl shadow-md" />
      </div>
      <div className="p-6">
        <h3 className="text-lg font-bold mb-2 text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600 mb-2">Autores: {authors?.join(', ') || 'Desconocidos'}</p>
        <p className="text-sm text-gray-600 mb-4">Fecha de publicación: {publishedDate || 'Desconocida'}</p>
        <p className="text-sm text-gray-700 mb-4">{desc}</p>
        {infoLink && (
          <a
            href={infoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Abrir en Google Books
          </a>
        )}
      </div>
    </div>
  );
};

export default BookDetailsFromGoogle;
