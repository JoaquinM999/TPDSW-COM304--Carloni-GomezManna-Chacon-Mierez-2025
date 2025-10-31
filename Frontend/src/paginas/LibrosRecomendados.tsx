import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, Award, Info } from 'lucide-react';
import { obtenerRecomendaciones, invalidarCacheRecomendaciones, RecomendacionResponse } from '../services/recomendacionService';
import LibroCard from '../componentes/LibroCard';
import RecomendacionesSkeletonLoader from '../componentes/RecomendacionesSkeletonLoader';
import RecomendacionesFiltros, { FiltrosRecomendaciones } from '../componentes/RecomendacionesFiltros';
import VistaToggle, { VistaRecomendaciones } from '../componentes/VistaToggle';
import Tooltip from '../componentes/Tooltip';
import CompartirLibro from '../componentes/CompartirLibro';
import MarcarComoLeido from '../componentes/MarcarComoLeido';
import LibroImagen from '../componentes/LibroImagen';

export const LibrosRecomendados: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<RecomendacionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Nuevos estados para mejoras
  const [vista, setVista] = useState<VistaRecomendaciones>('grid');
  const [filtros, setFiltros] = useState<FiltrosRecomendaciones>({
    categorias: [],
    autores: [],
    ratingMinimo: 0
  });

  // Función para navegar al libro pasando el origen para el botón "Volver"
  const handleLibroClick = (slug: string) => {
    console.log('🔍 Navegando desde recomendaciones con state:', { from: '/recomendaciones' });
    navigate(`/libro/${slug}`, { 
      state: { from: '/recomendaciones' } 
    });
  };

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

  const actualizarRecomendaciones = useCallback(() => {
    // Limpiar timeout anterior si existe
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Crear nuevo timeout (debounce de 500ms)
    debounceTimerRef.current = setTimeout(async () => {
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
    }, 500);
  }, []);

  useEffect(() => {
    cargarRecomendaciones();

    // Cleanup del debounce timer
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Obtener categorías y autores únicos para los filtros
  const categoriasDisponibles = useMemo(() => {
    if (!data) return [];
    const categorias = new Set<string>();
    data.libros.forEach(libro => {
      libro.matchCategorias.forEach(cat => categorias.add(cat));
    });
    return Array.from(categorias).sort();
  }, [data]);

  const autoresDisponibles = useMemo(() => {
    if (!data) return [];
    const autores = new Set<string>();
    data.libros.forEach(libro => {
      libro.matchAutores.forEach(aut => autores.add(aut));
      libro.autores.forEach(aut => autores.add(aut));
    });
    return Array.from(autores).sort();
  }, [data]);

  // Filtrar libros según los filtros activos
  const librosFiltrados = useMemo(() => {
    if (!data) return [];
    
    return data.libros.filter(libro => {
      // Filtro de rating
      if (filtros.ratingMinimo > 0 && libro.averageRating < filtros.ratingMinimo) {
        return false;
      }

      // Filtro de categorías
      if (filtros.categorias.length > 0) {
        const tieneCategoria = libro.matchCategorias.some(cat => 
          filtros.categorias.includes(cat)
        );
        if (!tieneCategoria) return false;
      }

      // Filtro de autores
      if (filtros.autores.length > 0) {
        const tieneAutor = [...libro.matchAutores, ...libro.autores].some(aut => 
          filtros.autores.includes(aut)
        );
        if (!tieneAutor) return false;
      }

      return true;
    });
  }, [data, filtros]);  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-3 sm:p-6" role="status" aria-live="polite">
        {/* Header mientras carga */}
        <header className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-purple-600 animate-spin" aria-hidden="true" />
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 animate-gradient">
              Recomendaciones para ti
            </h1>
            <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-pink-600 animate-spin" style={{ animationDirection: 'reverse' }} aria-hidden="true" />
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
            ✨ Generando recomendaciones personalizadas basadas en tus preferencias...
          </p>
        </header>

        {/* Skeleton loader con diseño completo */}
        <RecomendacionesSkeletonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center p-4 sm:p-8" role="alert" aria-live="assertive">
        <div className="max-w-md w-full">
          <div className="bg-white border-2 border-red-200 rounded-2xl p-6 sm:p-8 text-center shadow-2xl transform animate-shake">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">¡Ups! Algo salió mal</h3>
            <p className="text-red-600 text-xs sm:text-sm mb-6">{error}</p>
            <button
              onClick={cargarRecomendaciones}
              className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg font-semibold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Reintentar carga de recomendaciones"
            >
              🔄 Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-3 sm:p-6 animate-fadeIn" role="main">
      {/* Header mejorado con animación */}
      <header className="text-center mb-6 sm:mb-8 animate-slideDown">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 animate-pulse" aria-hidden="true" />
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-pink-600 to-rose-700 animate-gradient">
              Recomendaciones para ti
            </span>
          </h1>
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-pink-500 animate-pulse" style={{ animationDelay: '0.5s' }} aria-hidden="true" />
        </div>
        <p className="text-sm sm:text-base text-gray-600 font-medium px-4">
          ✨ Libros seleccionados especialmente según tus gustos ✨
        </p>
      </header>

      {/* Barra de controles mejorada */}
      <div className="max-w-7xl mx-auto mb-6 sm:mb-8 animate-slideUp">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Contador e info */}
          <div className="flex items-center gap-3 flex-wrap">
            {data?.metadata && (
              <div 
                className="bg-white rounded-xl px-4 py-2 sm:px-5 sm:py-3 shadow-lg border-2 border-purple-200 transform hover:scale-105 transition-all duration-300"
                role="status"
                aria-label={`${librosFiltrados.length} de ${data.metadata.totalRecomendaciones} recomendaciones mostradas`}
              >
                <p className="text-xs sm:text-sm text-gray-700 font-semibold">
                  📚 <span className="font-bold text-purple-600 text-base sm:text-lg">{librosFiltrados.length}</span>
                  {librosFiltrados.length !== data.metadata.totalRecomendaciones && (
                    <span className="text-gray-500"> de {data.metadata.totalRecomendaciones}</span>
                  )}
                </p>
              </div>
            )}
          </div>
          
          {/* Controles: Filtros, Vista, Actualizar */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Filtros */}
            <RecomendacionesFiltros
              filtros={filtros}
              onFiltrosChange={setFiltros}
              categoriasDisponibles={categoriasDisponibles}
              autoresDisponibles={autoresDisponibles}
            />

            {/* Toggle de vista */}
            <VistaToggle vista={vista} onVistaChange={setVista} />

            {/* Botón actualizar */}
            <button
              onClick={actualizarRecomendaciones}
              disabled={refreshing}
              className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white rounded-xl hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 font-semibold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label={refreshing ? 'Actualizando recomendaciones' : 'Actualizar recomendaciones'}
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span className="hidden sm:inline">{refreshing ? 'Actualizando...' : '🔄 Actualizar'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info del algoritmo mejorada */}
      {data?.metadata && (
        <div className="max-w-7xl mx-auto mb-8 sm:mb-10 animate-slideUp px-2" style={{ animationDelay: '0.1s' }}>
          <div 
            className="bg-gradient-to-r from-purple-100 via-pink-100 to-rose-100 border-2 border-purple-300 rounded-2xl p-4 sm:p-6 shadow-lg transform hover:scale-[1.01] transition-all duration-300"
            role="region"
            aria-label="Información sobre el algoritmo de recomendaciones"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="bg-white rounded-full p-2 sm:p-3 shadow-md flex-shrink-0">
                <Info className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-purple-900 mb-2 text-base sm:text-lg">🎯 ¿Cómo funcionan las recomendaciones?</h2>
                <p className="text-purple-800 text-xs sm:text-sm leading-relaxed">
                  Utilizamos inteligencia artificial para analizar tus <strong>libros favoritos</strong>, <strong>ratings</strong>, 
                  <strong> reseñas</strong> y <strong>autores preferidos</strong>. Así podemos sugerirte libros similares 
                  que aún no has explorado, incluyendo novedades recientes y títulos mejor valorados por la comunidad.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de libros */}
      {data?.libros && data.libros.length === 0 ? (
        <div className="text-center py-12 sm:py-20 animate-fadeIn px-4" role="status" aria-live="polite">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Sparkles className="w-20 h-20 sm:w-24 sm:h-24 text-gray-300 mx-auto mb-6 animate-bounce" aria-hidden="true" />
              <div className="absolute inset-0 animate-ping opacity-20">
                <Sparkles className="w-20 h-20 sm:w-24 sm:h-24 text-purple-300 mx-auto" aria-hidden="true" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl text-gray-700 mb-3 font-bold">No hay recomendaciones disponibles</h2>
            <p className="text-sm sm:text-base text-gray-500 mb-6 leading-relaxed">
              Empieza a <strong className="text-purple-600">calificar libros</strong>, 
              <strong className="text-pink-600"> agregar favoritos</strong> y 
              <strong className="text-rose-600"> escribir reseñas</strong> para recibir recomendaciones personalizadas.
            </p>
            <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
              <span>⭐ Califica</span>
              <span>❤️ Favoritos</span>
              <span>📝 Reseñas</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-2">
          {/* Vista Grid con animación stagger */}
          {vista === 'grid' && (
            <motion.div 
              className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              role="list"
              aria-label="Lista de libros recomendados"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.08
                  }
                }
              }}
            >
              {librosFiltrados.map((libro) => {
              // Construir extraInfo con las razones de recomendación (SIN botones)
              const razones: string[] = [];
              if (libro.matchCategorias.length > 0) {
                razones.push(`📚 ${libro.matchCategorias.slice(0, 2).join(', ')}`);
              }
              if (libro.matchAutores.length > 0) {
                razones.push(`✍️ ${libro.matchAutores.slice(0, 2).join(', ')}`);
              }
              
              const extraInfo = (
                <div className="space-y-2">
                  {/* Badge de match mejorado CON TOOLTIP */}
                  <Tooltip 
                    content={`Este libro tiene un ${(libro.score * 100).toFixed(0)}% de afinidad con tus preferencias basado en categorías y autores que te gustan.`}
                    position="top"
                  >
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 rounded-lg px-3 py-2 border-2 border-purple-300 shadow-sm transform hover:scale-105 transition-all duration-200">
                      <Award className="w-4 h-4 text-purple-600 animate-pulse" />
                      <span className="text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-pink-700">
                        {(libro.score * 100).toFixed(0)}% Match
                      </span>
                    </div>
                  </Tooltip>
                  
                  {/* Badge de nuevo mejorado CON TOOLTIP */}
                  {libro.esReciente && (
                    <Tooltip 
                      content="Este libro fue publicado recientemente (últimos 30 días)"
                      position="top"
                    >
                      <div className="flex items-center gap-1 bg-gradient-to-r from-orange-100 via-red-100 to-orange-100 rounded-lg px-3 py-2 border-2 border-orange-300 shadow-sm transform hover:scale-105 transition-all duration-200">
                        <Sparkles className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                        <span className="text-xs font-bold text-orange-700">✨ NUEVO</span>
                      </div>
                    </Tooltip>
                  )}
                  
                  {/* Razones mejoradas */}
                  {razones.length > 0 && (
                    <div className="text-xs text-gray-700 leading-relaxed space-y-1 pt-2 border-t-2 border-gray-200">
                      {razones.map((razon, idx) => (
                        <div key={idx} className="line-clamp-1 font-medium">{razon}</div>
                      ))}
                    </div>
                  )}
                </div>
              );

              return (
                <motion.div
                  key={libro.id}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.95 },
                    show: { opacity: 1, y: 0, scale: 1 }
                  }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  role="listitem"
                  className="relative"
                >
                  {/* Card clickeable */}
                  <div onClick={() => handleLibroClick(libro.slug)} className="cursor-pointer">
                    <LibroCard
                      title={libro.titulo}
                      authors={libro.autores}
                      image={libro.imagen}
                      rating={libro.averageRating > 0 ? libro.averageRating : null}
                      extraInfo={extraInfo}
                    />
                  </div>
                  
                  {/* Botones de acción FUERA del card, posicionados absolutamente */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 z-20">
                    <MarcarComoLeido
                      libroId={libro.id}
                      titulo={libro.titulo}
                      autores={libro.autores}
                      imagen={libro.imagen || undefined}
                    />
                    <CompartirLibro
                      libroId={libro.id}
                      titulo={libro.titulo}
                      autores={libro.autores}
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
          )}

          {/* Vista Lista */}
          {vista === 'lista' && (
            <motion.div
              className="space-y-4"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
            >
              {librosFiltrados.map((libro) => {
                const razones: string[] = [];
                if (libro.matchCategorias.length > 0) {
                  razones.push(`📚 ${libro.matchCategorias.slice(0, 2).join(', ')}`);
                }
                if (libro.matchAutores.length > 0) {
                  razones.push(`✍️ ${libro.matchAutores.slice(0, 2).join(', ')}`);
                }

                return (
                  <motion.div
                    key={libro.id}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      show: { opacity: 1, x: 0 }
                    }}
                    transition={{ type: 'spring', duration: 0.4 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden relative"
                  >
                    {/* Contenedor clickeable (TODO excepto los botones) */}
                    <div 
                      className="flex flex-col sm:flex-row gap-4 p-4 cursor-pointer"
                      onClick={() => handleLibroClick(libro.slug)}
                    >
                      {/* Imagen */}
                      <div className="flex-shrink-0 w-full sm:w-32 h-48 sm:h-auto">
                        <LibroImagen
                          src={libro.imagen}
                          alt={libro.titulo}
                          titulo={libro.titulo}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Header */}
                        <div>
                          <h3 className="text-lg font-black text-gray-900 line-clamp-2 mb-1">
                            {libro.titulo}
                          </h3>
                          <p className="text-sm text-gray-600">
                            por {libro.autores.join(', ')}
                          </p>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {libro.averageRating > 0 && (
                            <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                              ⭐ {libro.averageRating.toFixed(1)}
                            </span>
                          )}
                          
                          <Tooltip 
                            content={`${(libro.score * 100).toFixed(0)}% de afinidad con tus preferencias`}
                            position="top"
                          >
                            <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg text-xs font-bold border-2 border-purple-300">
                              {(libro.score * 100).toFixed(0)}% Match
                            </span>
                          </Tooltip>

                          {libro.esReciente && (
                            <Tooltip content="Publicado recientemente" position="top">
                              <span className="px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 rounded-lg text-xs font-bold border-2 border-orange-300">
                                ✨ NUEVO
                              </span>
                            </Tooltip>
                          )}
                        </div>

                        {/* Razones */}
                        {razones.length > 0 && (
                          <div className="text-sm text-gray-600 space-y-1">
                            {razones.map((razon, idx) => (
                              <div key={idx} className="line-clamp-1">{razon}</div>
                            ))}
                          </div>
                        )}

                        {/* Espaciado extra para los botones que están abajo */}
                        <div className="h-10"></div>
                      </div>
                    </div>

                    {/* Botones FUERA del contenedor clickeable */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-3 z-10">
                      <MarcarComoLeido
                        libroId={libro.id}
                        titulo={libro.titulo}
                        autores={libro.autores}
                        imagen={libro.imagen || undefined}
                      />
                      <CompartirLibro
                        libroId={libro.id}
                        titulo={libro.titulo}
                        autores={libro.autores}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default LibrosRecomendados;
  