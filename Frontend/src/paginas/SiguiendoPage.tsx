import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SeguirUsuarioButton from '../componentes/SeguirUsuarioButton';

interface Usuario {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  email: string;
  bio?: string;
  fotoPerfil?: string;
}

const SiguiendoPage: React.FC = () => {
  const [siguiendo, setSiguiendo] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    cargarSiguiendo();
  }, []);

  const cargarSiguiendo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Debes iniciar sesión');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        'http://localhost:3000/api/seguimiento/siguiendo',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSiguiendo(response.data);
    } catch (err: any) {
      console.error('Error cargando usuarios seguidos:', err);
      setError(err.response?.data?.error || 'Error al cargar usuarios seguidos');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowChange = (usuarioId: number, isSiguiendo: boolean) => {
    if (!isSiguiendo) {
      // Remover de la lista si dejó de seguir
      setSiguiendo(prev => prev.filter(u => u.id !== usuarioId));
    }
  };

  const usuariosFiltrados = siguiendo.filter(usuario => 
    usuario.username.toLowerCase().includes(filtro.toLowerCase()) ||
    usuario.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    usuario.apellido.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-4 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-4 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-4 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            Siguiendo
          </h1>
          <p className="text-gray-400">
            {siguiendo.length} {siguiendo.length === 1 ? 'usuario' : 'usuarios'}
          </p>
        </motion.div>

        {/* Barra de búsqueda */}
        {siguiendo.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre o usuario..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </motion.div>
        )}

        {/* Lista de usuarios */}
        {usuariosFiltrados.length === 0 ? (
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                {filtro ? 'No se encontraron usuarios' : 'No sigues a nadie aún'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-6">
                {filtro 
                  ? 'Intenta con otro término de búsqueda' 
                  : 'Explora perfiles de usuarios y comienza a seguir a otros lectores'
                }
              </p>
              {!filtro && (
                <Link
                  to="/libros"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
                >
                  Explorar libros
                </Link>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {usuariosFiltrados.map((usuario, index) => (
              <motion.div
                key={usuario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-cyan-500/50 transition-all"
              >
                {/* Avatar y nombre */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {usuario.fotoPerfil ? (
                      <img
                        src={usuario.fotoPerfil}
                        alt={usuario.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{usuario.username[0].toUpperCase()}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/perfil/${usuario.id}`}
                      className="font-semibold text-white hover:text-cyan-400 transition-colors block truncate"
                    >
                      {usuario.nombre} {usuario.apellido}
                    </Link>
                    <p className="text-sm text-gray-400 dark:text-gray-500 truncate">@{usuario.username}</p>
                  </div>
                </div>

                {/* Bio */}
                {usuario.bio && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-4 line-clamp-2">
                    {usuario.bio}
                  </p>
                )}

                {/* Acciones */}
                <div className="flex gap-2">
                  <Link
                    to={`/perfil/${usuario.id}`}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white text-center rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm"
                  >
                    Ver perfil
                  </Link>
                  <SeguirUsuarioButton
                    usuarioId={usuario.id}
                    username={usuario.username}
                    className="flex-shrink-0"
                    onFollowChange={(isSiguiendo) => handleFollowChange(usuario.id, isSiguiendo)}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SiguiendoPage;
