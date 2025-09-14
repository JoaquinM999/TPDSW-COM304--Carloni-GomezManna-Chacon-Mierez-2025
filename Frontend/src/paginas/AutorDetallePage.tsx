import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface AuthorDetails {
  author: {
    id: string;
    name: string;
    birth_date?: string;
    death_date?: string;
    bio?: string;
    photo?: string;
  };
  works: {
    title: string;
    googleBooks: {
      thumbnail?: string;
      description?: string;
      publisher?: string;
      publishedDate?: string;
    };
  }[];
}

const AutorDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [authorDetails, setAuthorDetails] = useState<AuthorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAuthorDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3000/api/external-authors/author/${id}`);
        if (!response.ok) {
          throw new Error('Error al obtener detalles del autor');
        }
        const data: AuthorDetails = await response.json();
        setAuthorDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <DotLottieReact
          src="https://lottie.host/6d727e71-5a1d-461e-9434-c9e7eb1ae1d1/IWVmdeMHnT.lottie"
          loop
          autoplay
          style={{ width: 140, height: 140 }}
        />
      </div>
    );
  }

  if (error || !authorDetails) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Autor no encontrado</h1>
        <p>{error}</p>
        <Link to="/autores" className="text-green-600 underline">Volver a la lista de autores</Link>
      </div>
    );
  }

  const { author, works } = authorDetails;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-start space-x-6">
        {author.photo && (
          <img src={author.photo} alt={author.name} className="w-32 h-32 object-cover rounded-lg" />
        )}
        <div>
          <h1 className="text-3xl font-bold text-green-700">{author.name}</h1>
          {author.birth_date && <p className="text-gray-600">Fecha de nacimiento: {author.birth_date}</p>}
          {author.death_date && <p className="text-gray-600">Fecha de fallecimiento: {author.death_date}</p>}
          {author.bio && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold">Biografía</h2>
              <p className="text-gray-800">{author.bio}</p>
            </div>
          )}
        </div>
      </div>
      <h2 className="text-2xl font-bold mt-6 text-green-700">Obras</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {works.map((work, index) => (
          <div key={index} className="bg-white shadow rounded-lg p-4">
            <h3 className="font-semibold">{work.title}</h3>
            {work.googleBooks.thumbnail && (
              <img src={work.googleBooks.thumbnail} alt={work.title} className="w-16 h-24 object-cover mt-2" />
            )}
            {work.googleBooks.description && (
              <p className="text-sm text-gray-600 mt-2">{work.googleBooks.description.substring(0, 100)}...</p>
            )}
            {work.googleBooks.publisher && <p className="text-sm text-gray-500">Editorial: {work.googleBooks.publisher}</p>}
            {work.googleBooks.publishedDate && <p className="text-sm text-gray-500">Publicado: {work.googleBooks.publishedDate}</p>}
          </div>
        ))}
      </div>
      <Link to="/autores" className="mt-6 inline-block text-green-600 hover:text-green-800">
        ← Volver a Autores
      </Link>
    </div>
  );
};

export default AutorDetallePage;
