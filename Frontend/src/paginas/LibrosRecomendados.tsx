import React, { useEffect, useState } from 'react';

interface Libro {
  id: number;
  titulo: string;
  autores: string[];
  categoria: string;
  ratingPromedio: number;
  imagenPortada: string;
}

export const LibrosRecomendados: React.FC = () => {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecomendados = async () => {
      try {
        const response = await fetch('/recomendacion');
        if (!response.ok) {
          throw new Error('Error al obtener recomendaciones');
        }
        const data = await response.json();
        setLibros(data);
      } catch (error) {
        console.error('Error fetching recommended books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecomendados();
  }, []);

  if (loading) {
    return <div className="max-w-7xl mx-auto p-4">Cargando recomendaciones...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">Libros Recomendados</h1>
      {libros.length === 0 ? (
        <p>No hay recomendaciones disponibles en este momento.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {libros.map((libro) => (
            <div key={libro.id} className="bg-white rounded-lg shadow p-4">
              <img
                src={libro.imagenPortada}
                alt={libro.titulo}
                className="w-full h-48 object-cover rounded"
              />
              <h2 className="mt-2 font-semibold text-lg">{libro.titulo}</h2>
              <p className="text-sm text-gray-600">Autores: {libro.autores.join(', ')}</p>
              <p className="text-sm text-gray-600">Categoría: {libro.categoria}</p>
              <p className="text-sm text-yellow-500">Rating: {libro.ratingPromedio.toFixed(1)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LibrosRecomendados;
  