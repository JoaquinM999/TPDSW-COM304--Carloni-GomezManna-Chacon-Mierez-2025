import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface Autor {
  id: string;
  name: string;
}

const AutoresPage: React.FC = () => {
  const [autores, setAutores] = useState<Autor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAutores = async (name: string) => {
    if (!name.trim()) {
      setAutores([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/api/external-authors/search-author?name=${encodeURIComponent(name)}`);
      if (!response.ok) {
        throw new Error('Error al buscar autores');
      }
      const data: Autor[] = await response.json();
      setAutores(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAutores(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

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
            onChange={(e) => setSearchTerm(e.target.value)}
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
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
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
    </div>
  );
};

export default AutoresPage;
