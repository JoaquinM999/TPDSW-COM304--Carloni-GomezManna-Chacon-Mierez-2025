import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Heart, BookOpen, ExternalLink, Globe, Calendar, MapPin, Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import DOMPurify from "dompurify";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import ObrasTimeline from "../componentes/ObrasTimeline";
import { fetchAuthorWithCache } from "../services/wikipediaService";
import { searchBooksByAuthorWithCache, GoogleBooksVolume, groupBooksByDecade } from "../services/googleBooksService";

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

interface CombinedWork {
  id: string;
  title: string;
  thumbnail?: string;
  description?: string;
  publisher?: string;
  publishedDate?: string;
  source: 'Open Library' | 'Google Books';
  rating?: number;
  ratingsCount?: number;
}

const COLORS = ['#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#84cc16'];

/**
 * @deprecated Este componente usa el endpoint antiguo /api/external-authors
 * Usar DetalleAutor.tsx en su lugar, que usa /api/autor/${id}
 */
const AutorDetallePageMejorada: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [authorDetails, setAuthorDetails] = useState<any>(null);
  const [googleBooksWorks, setGoogleBooksWorks] = useState<any[]>([]);
  const [wikipediaData, setWikipediaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'title'>('relevance');
  const [showTimeline, setShowTimeline] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch paralelo de todas las fuentes
        const [openLibraryData, authorName] = await Promise.all([
          fetch(`http://localhost:3000/api/external-authors/author/${id}`).then(res => res.json()),
          // Obtener nombre del autor primero
          fetch(`http://localhost:3000/api/external-authors/author/${id}`).then(res => res.json())
            .then(data => data.author.name)
        ]);

        setAuthorDetails(openLibraryData);

        // Buscar en Google Books y Wikipedia con el nombre del autor
        const [googleData, wikiData] = await Promise.all([
          searchBooksByAuthorWithCache(authorName, 40),
          fetchAuthorWithCache(authorName)
        ]);

        setGoogleBooksWorks(googleData.works);
        setWikipediaData(wikiData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  // Combinar y deduplicar obras de ambas fuentes
  const combinedWorks = useMemo((): CombinedWork[] => {
    if (!authorDetails) return [];

    const works: CombinedWork[] = [];
    const seenTitles = new Set<string>();

    // Agregar obras de Open Library
    authorDetails.works.forEach(work => {
      const normalizedTitle = work.title.toLowerCase().trim();
      if (!seenTitles.has(normalizedTitle)) {
        works.push({
          id: `ol-${work.title}`,
          title: work.title,
          thumbnail: work.googleBooks.thumbnail,
          description: work.googleBooks.description,
          publisher: work.googleBooks.publisher,
          publishedDate: work.googleBooks.publishedDate,
          source: 'Open Library'
        });
        seenTitles.add(normalizedTitle);
      }
    });

    // Agregar obras de Google Books (evitando duplicados)
    googleBooksWorks.forEach(work => {
      const normalizedTitle = work.volumeInfo.title.toLowerCase().trim();
      if (!seenTitles.has(normalizedTitle)) {
        works.push({
          id: work.id,
          title: work.volumeInfo.title,
          thumbnail: work.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
          description: work.volumeInfo.description,
          publisher: work.volumeInfo.publisher,
          publishedDate: work.volumeInfo.publishedDate,
          source: 'Google Books',
          rating: work.volumeInfo.averageRating,
          ratingsCount: work.volumeInfo.ratingsCount
        });
        seenTitles.add(normalizedTitle);
      }
    });

    return works;
  }, [authorDetails, googleBooksWorks]);

  // Ordenar obras
  const sortedWorks = useMemo(() => {
    const sorted = [...combinedWorks];
    
    switch (sortBy) {
      case 'date':
        return sorted.sort((a, b) => {
          const dateA = a.publishedDate || '0';
          const dateB = b.publishedDate || '0';
          return dateB.localeCompare(dateA);
        });
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  }, [combinedWorks, sortBy]);

  // Estadísticas para gráficos
  const decadeData = useMemo(() => {
    const grouped = groupBooksByDecade(googleBooksWorks);
    return Array.from(grouped.entries())
      .map(([decade, books]) => ({
        decade,
        count: books.length
      }))
      .sort((a, b) => a.decade.localeCompare(b.decade));
  }, [googleBooksWorks]);

  const genreData = useMemo(() => {
    const genres = new Map<string, number>();
    
    googleBooksWorks.forEach(work => {
      work.volumeInfo.categories?.forEach(category => {
        genres.set(category, (genres.get(category) || 0) + 1);
      });
    });

    return Array.from(genres.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [googleBooksWorks]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-6 justify-center">
          <DotLottieReact
            src="https://lottie.host/6d727e71-5a1d-461e-9434-c9e7eb1ae1d1/IWVmdeMHnT.lottie"
            loop
            autoplay
            style={{ width: 120, height: 120 }}
          />
          <div>
            <h2 className="text-xl font-semibold">Enriqueciendo datos del autor...</h2>
            <p className="text-sm text-gray-500">Obteniendo información de Wikipedia y Google Books</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !authorDetails) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-red-600">Autor no encontrado</h1>
        <p className="mt-2 text-gray-600">{error ?? 'No se encontraron datos para este autor.'}</p>
        <Link to="/autores" className="text-sm text-cyan-600 hover:underline mt-4 inline-block">
          ← Volver a Autores
        </Link>
      </div>
    );
  }

  const { author } = authorDetails;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/autores" className="text-sm text-cyan-600 hover:underline flex items-center gap-2">
          ← Volver a Autores
        </Link>
      </div>

      {/* Header mejorado con datos de Wikipedia */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-8 shadow-lg mb-8 overflow-hidden"
      >
        {/* Imagen de fondo si existe */}
        {wikipediaData?.thumbnail && (
          <div 
            className="absolute inset-0 opacity-10 bg-cover bg-center"
            style={{ backgroundImage: `url(${wikipediaData.thumbnail.source})` }}
          />
        )}

        <div className="relative flex items-start gap-8">
          <img
            src={wikipediaData?.thumbnail?.source || author.photo || '/author-placeholder.png'}
            alt={author.name}
            className="w-32 h-32 rounded-2xl object-cover shadow-2xl ring-4 ring-white"
          />
          
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-3">{author.name}</h1>
            
            {/* Badges informativos */}
            <div className="flex flex-wrap gap-2 mb-4">
              {wikipediaData?.nationality && (
                <span className="inline-flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  <MapPin className="w-4 h-4" />
                  {wikipediaData.nationality}
                </span>
              )}

              {(wikipediaData?.birthDate || author.birth_date) && (
                <span className="inline-flex items-center gap-1 text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                  <Calendar className="w-4 h-4" />
                  {wikipediaData?.birthDate?.split('-')[0] || author.birth_date}
                  {(wikipediaData?.deathDate || author.death_date) && 
                    ` - ${wikipediaData?.deathDate?.split('-')[0] || author.death_date}`}
                </span>
              )}

              {wikipediaData?.genres && wikipediaData.genres.length > 0 && (
                <span className="inline-flex items-center gap-1 text-sm bg-pink-100 text-pink-700 px-3 py-1 rounded-full">
                  <Award className="w-4 h-4" />
                  {wikipediaData.genres[0]}
                </span>
              )}

              {wikipediaData?.occupation && wikipediaData.occupation.length > 0 && (
                <span className="inline-flex items-center gap-1 text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  {wikipediaData.occupation[0]}
                </span>
              )}
            </div>

            {/* Biografía de Wikipedia (con HTML sanitizado) */}
            {wikipediaData?.extract && (
              <div 
                className="text-gray-700 dark:text-gray-300 mb-4 prose max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(wikipediaData.extractHtml || wikipediaData.extract) 
                }}
              />
            )}

            {/* Enlaces externos */}
            <div className="flex flex-wrap gap-3">
              {wikipediaData?.pageUrl && (
                <a
                  href={wikipediaData.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  <Globe className="w-4 h-4" />
                  Ver en Wikipedia
                </a>
              )}

              <a
                href={`https://www.goodreads.com/search?q=${encodeURIComponent(author.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Buscar en Goodreads
              </a>

              <a
                href={`https://www.amazon.com/s?k=${encodeURIComponent(author.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Buscar en Amazon
              </a>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Estadísticas visuales */}
      {(decadeData.length > 0 || genreData.length > 0) && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-cyan-600" />
            Estadísticas de Obras
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Gráfico de obras por década */}
            {decadeData.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Obras por Década</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={decadeData}>
                    <XAxis dataKey="decade" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Gráfico de géneros */}
            {genreData.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Géneros Principales</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={genreData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {genreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </motion.section>
      )}

      {/* Toggle Timeline */}
      {googleBooksWorks.length > 0 && (
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full font-medium hover:shadow-lg transition"
          >
            {showTimeline ? '📚 Ver Grid de Obras' : '📅 Ver Timeline de Obras'}
          </button>
        </div>
      )}

      {/* Timeline de obras */}
      {showTimeline && googleBooksWorks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <ObrasTimeline works={googleBooksWorks} authorName={author.name} />
        </motion.div>
      )}

      {/* Lista de obras */}
      {!showTimeline && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-cyan-600" />
              Obras ({sortedWorks.length})
            </h2>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="relevance">Relevancia</option>
              <option value="date">Más recientes</option>
              <option value="title">A-Z</option>
            </select>
          </div>

          {sortedWorks.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow text-center">
              <p className="text-gray-600">No hay obras disponibles para este autor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedWorks.map((work, idx) => (
                <motion.article
                  key={work.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition p-4 flex gap-4"
                >
                  <img
                    src={work.thumbnail || 'https://via.placeholder.com/128x193?text=No+Cover'}
                    alt={work.title}
                    className="w-20 h-28 rounded-md object-cover flex-shrink-0 shadow-inner"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128x193?text=No+Cover';
                    }}
                  />

                  <div className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 line-clamp-2">{work.title}</h3>
                      
                      {/* Badge de fuente */}
                      <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                        work.source === 'Google Books' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {work.source}
                      </span>
                    </div>

                    {work.publisher && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-1">{work.publisher}</p>
                    )}

                    {work.publishedDate && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{work.publishedDate}</p>
                    )}

                    {work.rating && (
                      <div className="flex items-center gap-1 text-sm mb-2">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-semibold">{work.rating}</span>
                        {work.ratingsCount && (
                          <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-xs">({work.ratingsCount} ratings)</span>
                        )}
                      </div>
                    )}

                    {work.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 line-clamp-2 mb-3">{work.description}</p>
                    )}

                    <div className="mt-auto flex items-center gap-2">
                      <Link
                        to={`/libro/${work.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`}
                        state={{ from: window.location.pathname }}
                        className="text-xs text-cyan-600 hover:text-cyan-800 font-medium"
                      >
                        Ver detalle →
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </motion.section>
      )}

      <footer className="mt-12 text-center text-sm text-gray-400">
        Datos enriquecidos desde Open Library, Google Books y Wikipedia
      </footer>
    </main>
  );
};

export default AutorDetallePageMejorada;
