import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface Autor {
  id: string;
  name: string;
  nombre?: string;
  apellido?: string;
  photo?: string;
  esPopular?: boolean;
  scorePopularidad?: number;
}

const AutoresPage: React.FC = () => {
  const [autores, setAutores] = useState<Autor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [sugerencias, setSugerencias] = useState<Autor[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const limit = 20; // Autores por página

  // Calculate total pages
  const totalPages = Math.ceil(total / limit);

  // Generate pagination numbers with ellipsis
  const getPaginationNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const halfMax = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, page - halfMax);
    let endPage = Math.min(totalPages, page + halfMax);

    // Adjust if we're near the beginning or end
    if (endPage - startPage + 1 < maxPagesToShow) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const fetchAutores = async (searchQuery: string = '', pageNum: number = 1, limitNum: number = 20) => {
    setLoading(true);
    setError(null);
    try {
      // Usar la API local de autores que ya tiene el ordenamiento por popularidad
      const url = searchQuery.trim() 
        ? `http://localhost:3000/api/autores?search=${encodeURIComponent(searchQuery)}&page=${pageNum}&limit=${limitNum}`
        : `http://localhost:3000/api/autores?page=${pageNum}&limit=${limitNum}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al buscar autores');
      }
      const data = await response.json();
      
      // Mapear los autores al formato esperado
      const autoresMapeados = data.autores.map((autor: any) => ({
        id: autor.id,
        name: autor.name || `${autor.nombre} ${autor.apellido}`.trim(),
        nombre: autor.nombre,
        apellido: autor.apellido,
        photo: autor.foto,
        esPopular: autor.esPopular,
        scorePopularidad: autor.scorePopularidad
      }));
      
      setAutores(autoresMapeados);
      setTotal(data.total);
      setPage(data.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching autores:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar autores populares al inicio
  useEffect(() => {
    fetchAutores('', 1, limit);
    // Cargar historial de búsqueda
    const history = localStorage.getItem('autores_search_history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Función para obtener sugerencias en tiempo real
  const fetchSugerencias = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSugerencias([]);
      setMostrarSugerencias(false);
      return;
    }

    try {
      const url = `http://localhost:3000/api/autores?search=${encodeURIComponent(searchQuery)}&page=1&limit=8`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const autoresMapeados = data.autores.map((autor: any) => ({
          id: autor.id,
          name: autor.name || `${autor.nombre} ${autor.apellido}`.trim(),
          nombre: autor.nombre,
          apellido: autor.apellido,
          photo: autor.foto,
          esPopular: autor.esPopular,
          scorePopularidad: autor.scorePopularidad
        }));
        setSugerencias(autoresMapeados);
        setMostrarSugerencias(autoresMapeados.length > 0);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Limpiar el timer anterior
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    // Búsqueda instantánea de sugerencias (más rápida - 200ms)
    setTimeout(() => {
      fetchSugerencias(value);
    }, 200);
    
    // Búsqueda completa (más lenta - 500ms)
    const searchTimer = setTimeout(() => {
      setPage(1);
      fetchAutores(value, 1, limit);
      
      // Guardar en historial si tiene contenido
      if (value.trim().length > 2) {
        const newHistory = [value, ...searchHistory.filter(h => h !== value)].slice(0, 5);
        setSearchHistory(newHistory);
        localStorage.setItem('autores_search_history', JSON.stringify(newHistory));
      }
    }, 500);
    
    setDebounceTimer(searchTimer);
  };

  const handleSugerenciaClick = (autor: Autor) => {
    setSearchTerm(autor.name);
    setMostrarSugerencias(false);
    fetchAutores(autor.name, 1, limit);
    
    // Agregar al historial
    const newHistory = [autor.name, ...searchHistory.filter(h => h !== autor.name)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('autores_search_history', JSON.stringify(newHistory));
  };

  const handleSearchFocus = () => {
    if (sugerencias.length > 0) {
      setMostrarSugerencias(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay para permitir clicks en sugerencias
    setTimeout(() => setMostrarSugerencias(false), 200);
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 text-gray-900 font-semibold">{part}</mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 p-6">
      <h1 className="text-center text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 via-blue-600 to-indigo-700">
          Autores
        </span>
      </h1>
      <p className="text-center text-sm text-gray-600 mb-8">
        Descubre y explora autores de libros
      </p>
      <div className="max-w-4xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar autores: García Márquez, Borges, Allende..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            className="w-full px-6 py-3 pl-12 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-md bg-white transition-all"
            autoComplete="off"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          
          {/* Indicador de carga en el input */}
          {loading && searchTerm && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Dropdown de sugerencias */}
          {mostrarSugerencias && sugerencias.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                {sugerencias.map((autor) => (
                  <button
                    key={autor.id}
                    onClick={() => handleSugerenciaClick(autor)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 transition-all duration-200 border-b border-gray-100 last:border-b-0 text-left group"
                  >
                    <img
                      src={autor.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(autor.name)}&size=40&background=${autor.esPopular ? 'f59e0b' : '0ea5e9'}&color=fff&format=png&bold=true`}
                      alt={autor.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-cyan-400 transition-all"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 group-hover:text-cyan-600 transition-colors">
                        {highlightText(autor.name, searchTerm)}
                      </p>
                      {autor.esPopular && (
                        <p className="text-xs text-yellow-600 font-medium">⭐ Popular</p>
                      )}
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-cyan-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
              <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 text-center border-t border-gray-200">
                Presiona Enter para ver todos los resultados
              </div>
            </div>
          )}
          
          {/* Historial de búsqueda */}
          {!searchTerm && searchHistory.length > 0 && mostrarSugerencias && (
            <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Búsquedas recientes</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {searchHistory.map((historyItem, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchTerm(historyItem);
                      fetchAutores(historyItem, 1, limit);
                      setMostrarSugerencias(false);
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-all duration-200 border-b border-gray-100 last:border-b-0 text-left group"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="flex-1 text-sm text-gray-700 group-hover:text-cyan-600 transition-colors">{historyItem}</p>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-cyan-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Mensaje informativo */}
        {!searchTerm && autores.length > 0 && (
          <p className="text-center text-sm text-gray-500 mt-3">
            ⭐ Los autores populares con muchos libros en Google Books aparecen primero
          </p>
        )}
        
        {searchTerm && !loading && autores.length > 0 && (
          <p className="text-center text-sm text-gray-600 mt-3">
            Se encontraron <span className="font-bold text-cyan-600">{total}</span> autores
          </p>
        )}
        
        {searchTerm && !loading && autores.length === 0 && (
          <p className="text-center text-sm text-gray-500 mt-3">
            No se encontraron autores para "{searchTerm}"
          </p>
        )}
      </div>
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
      {error && <p className="text-center text-red-500 text-lg">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {autores.map((autor) => (
          <div
            key={autor.id}
            className={`bg-white shadow-lg rounded-2xl p-6 border ${
              autor.esPopular ? 'border-yellow-400 ring-2 ring-yellow-300' : 'border-gray-100'
            } hover:shadow-2xl hover:scale-105 transition-all duration-300 group relative`}
          >
            {/* Badge de Popular */}
            {autor.esPopular && (
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Popular
              </div>
            )}
            
            <div className="flex items-center mb-4">
              <img
                src={autor.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(autor.name)}&size=64&background=${autor.esPopular ? 'f59e0b' : '0ea5e9'}&color=fff&format=png&bold=true`}
                alt={autor.name}
                className="w-16 h-16 rounded-full mr-4 object-cover ring-2 ring-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(autor.name)}&size=64&background=0ea5e9&color=fff&format=png`;
                }}
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 group-hover:text-cyan-600 transition-colors">
                  {autor.name}
                </h2>
                {autor.esPopular && (
                  <p className="text-xs text-yellow-600 font-semibold mt-1">
                    ⭐ Muchos libros disponibles
                  </p>
                )}
              </div>
            </div>
            <Link
              to={`/autores/${autor.id}`}
              className="inline-flex items-center text-cyan-600 hover:text-cyan-800 font-medium transition-colors group-hover:translate-x-1 transform duration-200"
            >
              Ver detalles
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-2">
            {/* Previous button */}
            <button
              onClick={() => {
                if (page > 1) {
                  const newPage = page - 1;
                  setPage(newPage);
                  fetchAutores(searchTerm, newPage, limit);
                }
              }}
              disabled={page === 1}
              className="px-3 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>

            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {getPaginationNumbers().map((pageNum, index) => (
                <React.Fragment key={index}>
                  {pageNum === '...' ? (
                    <span className="px-3 py-2 text-gray-500">...</span>
                  ) : (
                    <button
                      onClick={() => {
                        const newPage = pageNum as number;
                        setPage(newPage);
                        fetchAutores(searchTerm, newPage, limit);
                      }}
                      className={`px-3 py-2 rounded-md transition-colors ${
                        page === pageNum
                          ? 'bg-cyan-600 text-white'
                          : 'bg-white text-cyan-600 border border-cyan-600 hover:bg-cyan-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={() => {
                if (page < totalPages) {
                  const newPage = page + 1;
                  setPage(newPage);
                  fetchAutores(searchTerm, newPage, limit);
                }
              }}
              disabled={page === totalPages}
              className="px-3 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoresPage;
