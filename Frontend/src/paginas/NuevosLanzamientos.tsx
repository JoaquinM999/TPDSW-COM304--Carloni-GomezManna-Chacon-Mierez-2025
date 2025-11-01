// paginas/NuevosLanzamientos.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNuevosLanzamientos } from '../services/libroService';
import { Sparkles, Calendar, Star, BookOpen, Loader2 } from 'lucide-react';

interface Libro {
  id: string;
  titulo: string;
  autores: string[];
  imagen: string | null;
  descripcion: string | null;
  averageRating: number;
  categoria: string | null;
  fechaPublicacion: string;
  esNuevo: boolean;
}

export default function NuevosLanzamientos() {
  const navigate = useNavigate();
  const [libros, setLibros] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNuevosLanzamientos();
  }, []);

  const fetchNuevosLanzamientos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getNuevosLanzamientos(24);
      setLibros(response.libros || []);
    } catch (err) {
      console.error('Error al obtener nuevos lanzamientos:', err);
      setError('Error al cargar los nuevos lanzamientos');
    } finally {
      setLoading(false);
    }
  };

  const handleLibroClick = (libroId: string) => {
    navigate(`/libro/${libroId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">Cargando nuevos lanzamientos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">{error}</p>
          <button
            onClick={fetchNuevosLanzamientos}
            className="mt-4 px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Nuevos Lanzamientos</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Libros recientemente añadidos en los últimos 30 días
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-purple-600 dark:text-purple-400 font-medium">{libros.length} libros nuevos</span>
          </div>
        </div>

        {/* Grid de libros */}
        {libros.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-24 h-24 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-xl">No hay nuevos lanzamientos en este momento</p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">Vuelve pronto para ver las novedades</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {libros.map((libro) => (
              <div
                key={libro.id}
                onClick={() => handleLibroClick(libro.id)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
              >
                {/* Badge de nuevo */}
                <div className="relative">
                  <div className="absolute top-2 right-2 z-10">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      NUEVO
                    </span>
                  </div>
                  
                  {/* Imagen */}
                  <div className="h-80 overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {libro.imagen ? (
                      <img
                        src={libro.imagen}
                        alt={libro.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-4">
                  {/* Título */}
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {libro.titulo}
                  </h3>

                  {/* Autores */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-1">
                    {libro.autores.join(', ')}
                  </p>

                  {/* Rating y Categoría */}
                  <div className="flex items-center justify-between mb-2">
                    {libro.averageRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {libro.averageRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                    {libro.categoria && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                        {libro.categoria}
                      </span>
                    )}
                  </div>

                  {/* Fecha */}
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(libro.fechaPublicacion).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
  