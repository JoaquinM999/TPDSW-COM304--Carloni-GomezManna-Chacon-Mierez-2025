import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalAutores, setTotalAutores] = useState(0);

  // Búsqueda en BD local con paginación
  const fetchAutores = async (searchTerm = '', pageNum = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `http://localhost:3000/api/autor?page=${pageNum}&limit=20&search=${encodeURIComponent(searchTerm)}`
      );
      
      if (!response.ok) {
        throw new Error('Error al cargar autores');
      }
      
      const data = await response.json();
      
      // Reemplazar autores (no acumular como en infinite scroll)
      setDisplayedAutores(data.autores);
      setTotalPages(data.totalPages);
      setTotalAutores(data.total);
      setPage(pageNum);
      
      // Scroll al top al cambiar de página
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setDisplayedAutores([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar autores al inicio
  useEffect(() => {
    fetchAutores('', 1);
  }, []);

  // Debounced search - resetear a página 1
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

  // Funciones de navegación de páginas
  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      fetchAutores(searchTerm, pageNum);
    }
  };

  const nextPage = () => {
    if (page < totalPages) {
      goToPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      goToPage(page - 1);
    }
  };

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Máximo de números visibles
    
    if (totalPages <= maxVisible) {
      // Mostrar todos
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar con elipsis
      if (page <= 4) {
        // Cerca del inicio
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 3) {
        // Cerca del final
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        // En el medio
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-6 transition-colors duration-300">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 via-blue-600 to-indigo-700 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400">
            Autores
          </span>
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
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
            className="w-full px-6 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-600 shadow-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Controles de vista e info de paginación */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4">
        {/* Info de resultados */}
        <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
          {!loading && totalAutores > 0 && (
            <div className="flex flex-col sm:flex-row gap-2">
              <span className="bg-cyan-50 dark:bg-cyan-900/30 px-3 py-1 rounded-full border border-cyan-200 dark:border-cyan-700">
                Total: <strong>{totalAutores}</strong> autores
              </span>
              <span className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700">
                Página <strong>{page}</strong> de <strong>{totalPages}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Toggle vista */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-full transition-colors ${
              viewMode === 'grid' ? 'bg-cyan-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Vista grid"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-full transition-colors ${
              viewMode === 'list' ? 'bg-cyan-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
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
          <p className="text-red-500 dark:text-red-400 text-lg">{error}</p>
        </div>
      )}

      {/* Grid/List de autores */}
      {!loading && displayedAutores.length > 0 && (
        <>
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

          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className="max-w-7xl mx-auto mt-10 mb-6">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {/* Botón Anterior */}
                <button
                  onClick={prevPage}
                  disabled={page === 1}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    page === 1
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-gray-700 border border-cyan-200 dark:border-cyan-700 shadow-sm'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                {/* Números de página */}
                {getPageNumbers().map((pageNum, index) => (
                  pageNum === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-400 dark:text-gray-600">...</span>
                  ) : (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum as number)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                        page === pageNum
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-500 text-white shadow-lg scale-110'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-cyan-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-sm'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                ))}

                {/* Botón Siguiente */}
                <button
                  onClick={nextPage}
                  disabled={page === totalPages}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    page === totalPages
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-gray-700 border border-cyan-200 dark:border-cyan-700 shadow-sm'
                  }`}
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!loading && displayedAutores.length === 0 && searchTerm && (
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            No se encontraron autores para "{searchTerm}"
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Intenta con otro nombre o explora nuestras categorías destacadas
          </p>
        </div>
      )}
    </div>
  );
};

export default AutoresPage;
