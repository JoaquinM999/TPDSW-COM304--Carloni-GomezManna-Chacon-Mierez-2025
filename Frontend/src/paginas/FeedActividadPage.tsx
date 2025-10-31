import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Actividad {
  id: number;
  usuario: {
    id: number;
    username: string;
    nombre: string;
    apellido: string;
    fotoPerfil?: string;
  };
  tipo: 'RESENA' | 'SEGUIMIENTO' | 'LISTA_CREADA' | 'LISTA_ACTUALIZADA' | 'FAVORITO';
  libro?: {
    id: number;
    slug: string;
    nombre: string;
    imagen?: string;
    autor?: {
      nombre: string;
      apellido: string;
    };
  };
  resena?: {
    id: number;
    titulo?: string;
    calificacion: number;
    comentario: string;
  };
  fechaCreacion: string;
}

const FeedActividadPage: React.FC = () => {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('all');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    cargarActividades();
  }, [filtroTipo]);

  const cargarActividades = async (append = false) => {
    try {
      if (!append) {
        setLoading(true);
        setOffset(0);
      } else {
        setLoadingMore(true);
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Debes iniciar sesión');
        setLoading(false);
        return;
      }

      const currentOffset = append ? offset : 0;
      const params: any = {
        limit: 20,
        offset: currentOffset,
      };

      if (filtroTipo !== 'all') {
        params.tipos = filtroTipo;
      }

      const response = await axios.get(
        'http://localhost:3000/api/feed',
        {
          headers: { Authorization: `Bearer ${token}` },
          params
        }
      );

      if (append) {
        setActividades(prev => [...prev, ...response.data.actividades]);
      } else {
        setActividades(response.data.actividades);
      }

      setHasMore(response.data.hasMore);
      setOffset(currentOffset + response.data.actividades.length);
    } catch (err: any) {
      console.error('Error cargando feed:', err);
      setError(err.response?.data?.error || 'Error al cargar el feed');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const cargarMas = () => {
    if (!loadingMore && hasMore) {
      cargarActividades(true);
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'RESENA':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      case 'SEGUIMIENTO':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'LISTA_CREADA':
      case 'LISTA_ACTUALIZADA':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case 'FAVORITO':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'RESENA': return 'from-yellow-500 to-orange-500';
      case 'SEGUIMIENTO': return 'from-blue-500 to-cyan-500';
      case 'LISTA_CREADA':
      case 'LISTA_ACTUALIZADA': return 'from-purple-500 to-pink-500';
      case 'FAVORITO': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTipoTexto = (tipo: string) => {
    switch (tipo) {
      case 'RESENA': return 'dejó una reseña';
      case 'SEGUIMIENTO': return 'comenzó a seguir a alguien';
      case 'LISTA_CREADA': return 'creó una lista';
      case 'LISTA_ACTUALIZADA': return 'actualizó una lista';
      case 'FAVORITO': return 'agregó a favoritos';
      default: return tipo.toLowerCase();
    }
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diferencia = ahora.getTime() - date.getTime();
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(diferencia / 3600000);
    const dias = Math.floor(diferencia / 86400000);

    if (minutos < 1) return 'Hace un momento';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            Feed de Actividad
          </h1>
          <p className="text-gray-400">
            Últimas actividades de usuarios que sigues
          </p>
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-wrap gap-2"
        >
          {[
            { value: 'all', label: 'Todas' },
            { value: 'RESENA', label: 'Reseñas' },
            { value: 'FAVORITO', label: 'Favoritos' },
            { value: 'LISTA_CREADA,LISTA_ACTUALIZADA', label: 'Listas' },
            { value: 'SEGUIMIENTO', label: 'Seguimientos' },
          ].map((filtro) => (
            <button
              key={filtro.value}
              onClick={() => setFiltroTipo(filtro.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filtroTipo === filtro.value
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {filtro.label}
            </button>
          ))}
        </motion.div>

        {/* Feed */}
        {actividades.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="bg-gray-800/30 rounded-lg p-12 border border-gray-700">
              <svg
                className="w-24 h-24 mx-auto mb-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                No hay actividad reciente
              </h3>
              <p className="text-gray-500 mb-6">
                Las actividades de los usuarios que sigues aparecerán aquí
              </p>
              <Link
                to="/siguiendo"
                className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
              >
                Ver usuarios seguidos
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {actividades.map((actividad, index) => (
              <motion.div
                key={actividad.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-cyan-500/30 transition-all"
              >
                <div className="flex gap-4">
                  {/* Avatar + icono de actividad */}
                  <div className="flex-shrink-0 relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                      {actividad.usuario.fotoPerfil ? (
                        <img
                          src={actividad.usuario.fotoPerfil}
                          alt={actividad.usuario.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span>{actividad.usuario.username[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br ${getTipoColor(actividad.tipo)} flex items-center justify-center text-white`}>
                      {getTipoIcon(actividad.tipo)}
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <Link
                          to={`/perfil/${actividad.usuario.id}`}
                          className="font-semibold text-white hover:text-cyan-400 transition-colors"
                        >
                          {actividad.usuario.nombre} {actividad.usuario.apellido}
                        </Link>
                        <span className="text-gray-400 ml-2">
                          {getTipoTexto(actividad.tipo)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 flex-shrink-0">
                        {formatearFecha(actividad.fechaCreacion)}
                      </span>
                    </div>

                    {/* Libro (si aplica) */}
                    {actividad.libro && (
                      <Link
                        to={`/libro/${actividad.libro.slug}`}
                        className="flex gap-3 mt-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition-colors"
                      >
                        {actividad.libro.imagen && (
                          <img
                            src={actividad.libro.imagen}
                            alt={actividad.libro.nombre}
                            className="w-12 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">
                            {actividad.libro.nombre}
                          </p>
                          {actividad.libro.autor && (
                            <p className="text-sm text-gray-400">
                              {actividad.libro.autor.nombre} {actividad.libro.autor.apellido}
                            </p>
                          )}
                        </div>
                      </Link>
                    )}

                    {/* Reseña (si aplica) */}
                    {actividad.resena && (
                      <div className="mt-3 p-3 bg-gray-900/30 rounded-lg border-l-2 border-yellow-500">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${i < actividad.resena!.calificacion ? 'fill-current' : 'fill-gray-600'}`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm text-gray-400">
                            {actividad.resena.calificacion}/5
                          </span>
                        </div>
                        {actividad.resena.titulo && (
                          <p className="font-medium text-white mb-1">
                            {actividad.resena.titulo}
                          </p>
                        )}
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {actividad.resena.comentario}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Botón cargar más */}
            {hasMore && (
              <div className="text-center pt-6">
                <button
                  onClick={cargarMas}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Cargando...
                    </span>
                  ) : (
                    'Cargar más'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedActividadPage;
