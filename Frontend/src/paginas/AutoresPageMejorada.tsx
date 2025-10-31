import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Grid, List } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import AutorCard from '../componentes/AutorCard';

interface Autor {
  id: string;
  name: string;
  photo?: string;
}

type ViewMode = 'grid' | 'list';

const AutoresPage: React.FC = () => {
  const [displayedAutores, setDisplayedAutores] = useState<Autor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // Búsqueda en BD local
  const fetchAutores = async (searchTerm = '', pageNum = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `http://localhost:3000/api/autores?page=${pageNum}&limit=20&search=${encodeURIComponent(searchTerm)}`
      );
      
      if (!response.ok) {
        throw new Error('Error al cargar autores');
      }
      
      const data = await response.json();
      
      if (pageNum === 1) {
        // Primera página: reemplazar autores
        setDisplayedAutores(data.autores);
      } else {
        // Páginas siguientes: agregar al final
        setDisplayedAutores(prev => [...prev, ...data.autores]);
      }
      
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      if (pageNum === 1) {
        setDisplayedAutores([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar autores al inicio
  useEffect(() => {
    fetchAutores('', 1);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const timer = setTimeout(() => {
        fetchAutores(searchTerm, 1);
      }, 500);
      return () => clearTimeout(timer);
    } else if (searchTerm === '') {
      fetchAutores('', 1);
    }
  }, [searchTerm]);

  // Cargar más autores (scroll infinito)
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchAutores(searchTerm, page + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 via-blue-600 to-indigo-700">
            Autores
          </span>
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Descubre biografías enriquecidas con Wikipedia y obras indexadas en Google Books
        </p>
      </motion.div>

      {/* Barra de búsqueda */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar autores por nombre... (ej: García Márquez)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-3 pl-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-md bg-white"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Controles de vista */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4">
        {/* Info de resultados */}
        <div className="text-sm text-gray-600">
          {!loading && displayedAutores.length > 0 && (
            <p>Mostrando {displayedAutores.length} autor{displayedAutores.length !== 1 ? 'es' : ''}</p>
          )}
        </div>

        {/* Toggle vista */}
        <div className="flex items-center gap-2 bg-white rounded-full p-1 shadow-md">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-full transition-colors ${
              viewMode === 'grid' ? 'bg-cyan-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Vista grid"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-full transition-colors ${
              viewMode === 'list' ? 'bg-cyan-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Vista lista"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <DotLottieReact
            src="https://lottie.host/6d727e71-5a1d-461e-9434-c9e7eb1ae1d1/IWVmdeMHnT.lottie"
            loop
            autoplay
            style={{ width: 140, height: 140 }}
          />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="max-w-4xl mx-auto text-center py-8">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      )}

      {/* Grid/List de autores con scroll infinito */}
      {!loading && displayedAutores.length > 0 && (
        <InfiniteScroll
          dataLength={displayedAutores.length}
          next={loadMore}
          hasMore={hasMore}
          loader={
            <div className="text-center py-4">
              <div className="inline-block w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          }
          endMessage={
            <p className="text-center py-4 text-gray-500 text-sm">
              ✨ Has visto todos los autores disponibles
            </p>
          }
        >
          <div className={`max-w-7xl mx-auto ${
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'flex flex-col gap-4'
          }`}>
            {displayedAutores.map((autor, index) => (
              <AutorCard
                key={`${autor.id}-${index}`}
                id={autor.id}
                name={autor.name}
                photo={autor.photo}
                showEnrichedData={true}
                index={index}
              />
            ))}
          </div>
        </InfiniteScroll>
      )}

      {/* Empty state */}
      {!loading && displayedAutores.length === 0 && searchTerm && (
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-gray-600 text-lg mb-4">
            No se encontraron autores para "{searchTerm}"
          </p>
          <p className="text-sm text-gray-500">
            Intenta con otro nombre o explora nuestras categorías destacadas
          </p>
        </div>
      )}
    </div>
  );
};

export default AutoresPage;
