import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Autor {
  id: number;
  nombre: string;
  apellido: string;
  libros: number; // cantidad de libros publicados
}

const AutoresPage: React.FC = () => {
  const [autores, setAutores] = useState<Autor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchAutores = async (pageNumber: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/autores/with-books?page=${pageNumber}&limit=10`);
      if (response.data && Array.isArray(response.data.data)) {
        setAutores(response.data.data);
        setPage(response.data.pagination.page);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setAutores([]);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar autores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutores(page);
  }, [page]);

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  if (loading) {
    return <div className="text-center py-6">Cargando autores...</div>;
  }

  if (error) {
    return <div className="text-center py-6 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Autores</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {autores.map((autor) => (
          <div
            key={autor.id}
            className="bg-white shadow-lg rounded-xl p-4 border hover:shadow-xl transition-shadow duration-200"
          >
            <h2 className="text-xl font-semibold">{autor.nombre} {autor.apellido}</h2>
            <p className="text-gray-600">Libros publicados: {autor.libros}</p>
            <Link
              to={`/autores/${autor.id}`}
              className="mt-3 inline-block text-green-600 hover:text-green-800"
            >
              Ver detalles →
            </Link>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-6 space-x-4">
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="self-center">
          Página {page} de {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={page === totalPages}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default AutoresPage;
