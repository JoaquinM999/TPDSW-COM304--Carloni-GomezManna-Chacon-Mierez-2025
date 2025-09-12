import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import LibroCard from '../componentes/LibroCard';

export default function LibrosPorCategoria() {
  const location = useLocation();

  // Assuming librosPorCategoria is fetched or passed as props, here is a mock example
  const librosPorCategoria = [
    { id: '1', titulo: 'Libro 1', autores: ['Autor 1'], imagen: null },
    { id: '2', titulo: 'Libro 2', autores: ['Autor 2'], imagen: null },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 p-6">
      <h2 className="text-center text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
        Libros por Categoría
      </h2>
      <div className="grid gap-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {librosPorCategoria.map((libro) => (
          <Link
            key={libro.id}
            to={`/libro/${libro.id}`}
            state={{ from: location.pathname }}
            className="block"
          >
            <LibroCard
              title={libro.titulo}
              authors={libro.autores}
              image={libro.imagen}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
