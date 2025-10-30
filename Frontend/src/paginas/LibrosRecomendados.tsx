import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, RefreshCw, Tag, User, Award, Info, BookOpen, Star } from 'lucide-react';
import { obtenerRecomendaciones, invalidarCacheRecomendaciones, RecomendacionResponse } from '../services/recomendacionService';

export const LibrosRecomendados: React.FC = () => {
  const [data, setData] = useState<RecomendacionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const cargarRecomendaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await obtenerRecomendaciones(15);
      setData(response);
    } catch (err: any) {
      console.error('Error al cargar recomendaciones:', err);
      setError(err.message || 'Error al cargar recomendaciones');
    } finally {
      setLoading(false);
    }
  };

  const actualizarRecomendaciones = async () => {
    try {
      setRefreshing(true);
      setError(null);
      await invalidarCacheRecomendaciones();
      await cargarRecomendaciones();
    } catch (err: any) {
      console.error('Error al actualizar recomendaciones:', err);
      setError(err.message || 'Error al actualizar recomendaciones');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarRecomendaciones();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Sparkles className="w-16 h-16 text-purple-500 animate-pulse mx-auto mb-4" />
          <p className="text-xl text-gray-600">Generando recomendaciones personalizadas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={cargarRecomendaciones}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Sparkles className="w-10 h-10 text-purple-600" />
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Recomendaciones para ti</h1>
            {data?.metadata && (
              <p className="text-gray-500 mt-1">
                {data.metadata.totalRecomendaciones} libros seleccionados por nuestro algoritmo
              </p>
            )}
          </div>
        </div>
        
        <button
          onClick={actualizarRecomendaciones}
          disabled={refreshing}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* Info del algoritmo */}
      {data?.metadata && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-5 mb-8">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-900 mb-2">¿Cómo funcionan las recomendaciones?</h3>
              <p className="text-purple-700 text-sm">
                Analizamos tus libros favoritos, ratings, reseñas y autores preferidos para sugerirte libros similares 
                que aún no has explorado. Incluimos novedades recientes y libros mejor valorados de tus categorías favoritas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de libros */}
      {data?.libros && data.libros.length === 0 ? (
        <div className="text-center py-16">
          <Sparkles className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-2">No hay recomendaciones disponibles</p>
          <p className="text-gray-500">Empieza a calificar libros, agregar favoritos y escribir reseñas para recibir recomendaciones personalizadas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data?.libros.map((libro) => (
            <div
              key={libro.id}
              onClick={() => navigate(`/libros/${libro.id}`)}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
            >
              {/* Badge de match score */}
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {(libro.score * 100).toFixed(0)}% Match
                  </span>
                </div>
                
                {/* Badge de reciente si aplica */}
                {libro.esReciente && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      NUEVO
                    </span>
                  </div>
                )}
                
                {/* Imagen */}
                <div className="h-80 overflow-hidden bg-gray-100">
                  {libro.imagen ? (
                    <img
                      src={libro.imagen}
                      alt={libro.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                      <BookOpen className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Contenido */}
              <div className="p-4">
                {/* Título */}
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                  {libro.titulo}
                </h3>

                {/* Autores */}
                <p className="text-gray-600 text-sm mb-3 line-clamp-1">
                  {libro.autores.join(', ')}
                </p>

                {/* Rating */}
                {libro.averageRating > 0 && (
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {libro.averageRating.toFixed(1)}
                    </span>
                  </div>
                )}

                {/* Razones de la recomendación */}
                <div className="space-y-2 pt-3 border-t border-gray-100">
                  {/* Categorías coincidentes */}
                  {libro.matchCategorias.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Tag className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-gray-500">Categorías: </span>
                        <span className="text-xs font-medium text-blue-600 line-clamp-1">
                          {libro.matchCategorias.join(', ')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Autores coincidentes */}
                  {libro.matchAutores.length > 0 && (
                    <div className="flex items-start gap-2">
                      <User className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-gray-500">Autores: </span>
                        <span className="text-xs font-medium text-green-600 line-clamp-1">
                          {libro.matchAutores.join(', ')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LibrosRecomendados;
  