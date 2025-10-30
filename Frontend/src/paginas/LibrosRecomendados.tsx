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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <h1 className="text-4xl font-bold text-gray-900">Recomendaciones para ti</h1>
            </div>
            {data?.metadata && (
              <p className="text-gray-600 text-lg">
                {data.metadata.totalRecomendaciones} libros seleccionados por nuestro algoritmo
              </p>
            )}
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
              <div className="p-5">
                {/* Título con altura dinámica y espaciado mejorado */}
                <h3 className="font-bold text-gray-900 text-xl leading-snug mb-3 line-clamp-3 h-[4.5rem] overflow-hidden group-hover:text-purple-600 transition-colors">
                  {libro.titulo}
                </h3>

                {/* Autores con mejor visibilidad y altura fija */}
                <div className="mb-4 h-[3rem]">
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Autor{libro.autores.length > 1 ? 'es' : ''}</p>
                  <p className="text-gray-800 text-base font-semibold line-clamp-2 leading-snug">
                    {libro.autores.join(', ')}
                  </p>
                </div>

                {/* Rating con mejor diseño */}
                {libro.averageRating > 0 && (
                  <div className="flex items-center gap-2 mb-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg px-3 py-2.5 border border-yellow-200">
                    <Star className="w-5 h-5 text-yellow-600 fill-yellow-500" />
                    <span className="text-lg font-bold text-gray-900">
                      {libro.averageRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-600 font-medium">/ 5.0</span>
                  </div>
                )}

                {/* Razones de la recomendación con mejor espaciado y legibilidad */}
                <div className="space-y-2.5 pt-4 border-t-2 border-purple-100">
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    ¿Por qué este libro?
                  </p>
                  
                  {/* Categorías coincidentes */}
                  {libro.matchCategorias.length > 0 && (
                    <div className="flex items-start gap-2.5 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg p-3 border border-blue-200">
                      <Tag className="w-5 h-5 text-blue-700 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-blue-900 mb-1.5">Categorías favoritas</p>
                        <p className="text-sm text-blue-800 font-medium line-clamp-2 leading-relaxed">
                          {libro.matchCategorias.join(' • ')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Autores coincidentes */}
                  {libro.matchAutores.length > 0 && (
                    <div className="flex items-start gap-2.5 bg-gradient-to-r from-green-50 to-green-100/50 rounded-lg p-3 border border-green-200">
                      <User className="w-5 h-5 text-green-700 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-green-900 mb-1.5">Autores que te gustan</p>
                        <p className="text-sm text-green-800 font-medium line-clamp-2 leading-relaxed">
                          {libro.matchAutores.join(' • ')}
                        </p>
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
    </div>
  );
};

export default LibrosRecomendados;
  