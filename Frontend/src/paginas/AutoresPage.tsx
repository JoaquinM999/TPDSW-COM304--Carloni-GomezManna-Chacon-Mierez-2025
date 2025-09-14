import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface Autor {
  id: string;
  name: string;
  photo?: string;
}

const AutoresPage: React.FC = () => {
  const [autores, setAutores] = useState<Autor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

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

  const fetchAutores = async (name: string, page: number = 1, limit: number = 12) => {
    if (!name.trim()) {
      setAutores([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/api/external-authors/search-author?name=${encodeURIComponent(name)}&page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Error al buscar autores');
      }
      const data = await response.json();
      setAutores(data.authors);
      setTotal(data.total);
      setPage(data.page);
      setLimit(data.limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutores('Shakespeare'); // better default search term for meaningful authors
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim().length >= 2) {
      fetchAutores(value);
    } else {
      setAutores([]);
    }
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
            placeholder="Buscar autores por nombre..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-6 py-3 pl-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-md bg-white"
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
        </div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {autores.map((autor) => (
          <div
            key={autor.id}
            className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
          >
            <div className="flex items-center mb-4">
              <img
                src={autor.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(autor.name)}&size=48&background=0ea5e9&color=fff&format=png`}
                alt={autor.name}
                className="w-12 h-12 rounded-full mr-4 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-avatar.png';
                }}
              />
              <h2 className="text-xl font-bold text-gray-800 group-hover:text-cyan-600 transition-colors">{autor.name}</h2>
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
