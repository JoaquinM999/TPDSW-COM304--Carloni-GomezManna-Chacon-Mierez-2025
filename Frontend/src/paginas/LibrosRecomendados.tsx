import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, RefreshCw, Award, Info } from 'lucide-react';
import { obtenerRecomendaciones, invalidarCacheRecomendaciones, RecomendacionResponse } from '../services/recomendacionService';
import LibroCard from '../componentes/LibroCard';

export const LibrosRecomendados: React.FC = () => {
  const [data, setData] = useState<RecomendacionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      {/* Header */}
      <h2 className="text-center text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-pink-600 to-rose-700">
          Recomendaciones para ti
        </span>
      </h2>
      <p className="text-center text-sm text-gray-600 mb-8">
        Libros seleccionados especialmente según tus gustos
      </p>

      {/* Botón actualizar y contador */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {data?.metadata && (
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-purple-200">
              <p className="text-sm text-gray-600">
                <span className="font-bold text-purple-600">{data.metadata.totalRecomendaciones}</span> recomendaciones encontradas
              </p>
            </div>
          )}
        </div>
        
        <button
          onClick={actualizarRecomendaciones}
          disabled={refreshing}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* Info del algoritmo */}
      {data?.metadata && (
        <div className="max-w-7xl mx-auto mb-10">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-purple-900 mb-2">¿Cómo funcionan las recomendaciones?</h3>
                <p className="text-purple-700 text-sm leading-relaxed">
                  Analizamos tus libros favoritos, ratings, reseñas y autores preferidos para sugerirte libros similares 
                  que aún no has explorado. También incluimos novedades recientes y libros mejor valorados.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de libros */}
      {data?.libros && data.libros.length === 0 ? (
        <div className="text-center py-20">
          <Sparkles className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-2 font-semibold">No hay recomendaciones disponibles</p>
          <p className="text-gray-500">Empieza a calificar libros, agregar favoritos y escribir reseñas para recibir recomendaciones personalizadas.</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {data?.libros.map((libro) => {
              // Construir extraInfo con las razones de recomendación
              const razones: string[] = [];
              if (libro.matchCategorias.length > 0) {
                razones.push(`📚 ${libro.matchCategorias.slice(0, 2).join(', ')}`);
              }
              if (libro.matchAutores.length > 0) {
                razones.push(`✍️ ${libro.matchAutores.slice(0, 2).join(', ')}`);
              }
              
              const extraInfo = (
                <div className="space-y-2">
                  {/* Badge de match */}
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg px-2.5 py-1.5 border border-purple-200">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-purple-700">
                      {(libro.score * 100).toFixed(0)}% Match
                    </span>
                  </div>
                  
                  {/* Badge de nuevo */}
                  {libro.esReciente && (
                    <div className="flex items-center gap-1 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg px-2.5 py-1.5 border border-orange-200">
                      <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                      <span className="text-xs font-bold text-orange-700">NUEVO</span>
                    </div>
                  )}
                  
                  {/* Razones */}
                  {razones.length > 0 && (
                    <div className="text-xs text-gray-600 leading-relaxed space-y-1 pt-2 border-t border-gray-100">
                      {razones.map((razon, idx) => (
                        <div key={idx} className="line-clamp-1">{razon}</div>
                      ))}
                    </div>
                  )}
                </div>
              );

              return (
                <Link 
                  key={libro.id} 
                  to={`/libros/${libro.id}`}
                  className="block"
                >
                  <LibroCard
                    title={libro.titulo}
                    authors={libro.autores}
                    image={libro.imagen}
                    rating={libro.averageRating > 0 ? libro.averageRating : null}
                    extraInfo={extraInfo}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LibrosRecomendados;
  