import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Heart, BookOpen, ExternalLink } from "lucide-react";

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

const SkeletonCard: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 animate-pulse">
    <div className="flex gap-4">
      <div className="w-20 h-28 bg-gray-200 rounded" />
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-full" />
      </div>
    </div>
  </div>
);

const BookCard: React.FC<{ work: AuthorDetails['works'][0] }> = ({ work }) => {
  const { title, googleBooks } = work;
  const thumbnail = googleBooks.thumbnail || 'https://via.placeholder.com/128x193?text=No+Cover';
  const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  return (
    <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition p-4 flex gap-4">
      <img
        src={thumbnail}
        alt={title}
        className="w-20 h-28 rounded-md object-cover flex-shrink-0 shadow-inner"
        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128x193?text=No+Cover'; }}
      />

      <div className="flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-md font-semibold text-gray-800">{title}</h3>
          <div className="flex items-center gap-2">
            <button
              aria-label={`Guardar ${title}`}
              className="p-2 rounded-md hover:bg-gray-100"
              title="Favorito"
            >
              <Heart className="w-4 h-4 text-pink-600" />
            </button>
            <button
              aria-label={`Más info ${title}`}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <ExternalLink className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 flex items-center gap-3">
          {googleBooks.publisher && <span className="inline-block truncate">{googleBooks.publisher}</span>}
          {googleBooks.publishedDate && <span className="text-xs">• {googleBooks.publishedDate}</span>}
        </div>

        {googleBooks.description ? (
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{googleBooks.description}</p>
        ) : (
          <p className="mt-3 text-sm text-gray-400">Descripción no disponible.</p>
        )}

        <div className="mt-4 flex items-center gap-3">
          <Link
            to={`/libro/${slug}`}
            state={{ from: window.location.pathname }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium hover:bg-gray-50"
          >
            <BookOpen className="w-4 h-4" /> Ver detalle
          </Link>

          <span className="ml-auto text-xs text-gray-400">ID: —</span>
        </div>
      </div>
    </article>
  );
};

/**
 * @deprecated Este componente usa el endpoint antiguo /api/external-authors
 * Usar DetalleAutor.tsx en su lugar, que usa /api/autor/${id}
 */
const AutorDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [authorDetails, setAuthorDetails] = useState<AuthorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAuthorDetails = async () => {
      const startTime = Date.now();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3000/api/external-authors/author/${id}`);
        if (!response.ok) throw new Error('Error al obtener detalles del autor');
        const data: AuthorDetails = await response.json();
        setAuthorDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 1000 - elapsed); // Minimum 1 second loading
        setTimeout(() => setLoading(false), remaining);
      }
    };

    fetchAuthorDetails();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-6">
          <DotLottieReact
            src="https://lottie.host/6d727e71-5a1d-461e-9434-c9e7eb1ae1d1/IWVmdeMHnT.lottie"
            loop
            autoplay
            style={{ width: 120, height: 120 }}
          />
          <div>
            <h2 className="text-xl font-semibold">Cargando autor...</h2>
            <p className="text-sm text-gray-500">Estamos obteniendo las obras y los datos públicos.</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !authorDetails) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-red-600">Autor no encontrado</h1>
        <p className="mt-2 text-gray-600">{error ?? 'No se encontraron datos para este autor.'}</p>
        <Link to="/autores" className="text-sm text-green-600 hover:underline">← Volver a Autores</Link>
      </div>
    );
  }

  const { author, works } = authorDetails;

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <Link to="/autores" className="text-sm text-green-600 hover:underline">← Volver a Autores</Link>
      </div>

      <header className="flex items-center gap-6 bg-white rounded-2xl p-6 shadow-sm">
        <img
          src={author.photo || '/author-placeholder.png'}
          alt={author.name}
          className="w-28 h-28 rounded-lg object-cover shadow-inner"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-gray-900">{author.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {author.birth_date ? `Nacido: ${author.birth_date}` : ''}
            {author.death_date ? ` • Fallecido: ${author.death_date}` : ''}
          </p>

          {author.bio && (
            <p className="mt-4 text-gray-700 dark:text-gray-300 max-w-prose">{author.bio}</p>
          )}

          <div className="mt-4 flex items-center gap-3">
            <span className="ml-auto text-sm text-gray-400">{works.length} obras</span>
          </div>
        </div>
      </header>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Obras</h2>

          <div className="text-sm text-gray-500">Ordenar por: <select className="ml-2 border rounded px-2 py-1 text-sm">
            <option>Relevancia</option>
            <option>Más recientes</option>
            <option>A-Z</option>
          </select></div>
        </div>

        {works.length === 0 ? (
          <div className="mt-6 bg-white rounded-lg p-6 shadow text-center">
            <p className="text-gray-600">No hay obras disponibles para este autor.</p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {works.map((w, idx) => (
              <BookCard key={idx} work={w} />
            ))}
          </div>
        )}
      </section>

      <footer className="mt-8 text-center text-sm text-gray-400">Datos obtenidos de fuentes públicas.</footer>
    </main>
  );
};

export default AutorDetallePage;
