import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { User, Mail, AtSign, Calendar, MapPin, BookOpen, Edit3, Settings, Heart, MessageCircle, Users } from 'lucide-react';

const PerfilPage = () => {
  const [perfil, setPerfil] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3000/api/usuarios/me')
    .then((res) => {
      setPerfil(res.data);
      setLoading(false);
    })
    .catch((err) => {
      setError(err.response?.data?.error || 'Error al cargar perfil');
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
          <div className="text-red-500 mb-4">
            <User className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar perfil</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  if (!perfil) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                <User className="w-16 h-16 text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">
                ¡Hola, {perfil.nombre || perfil.username}!
              </h1>
              <p className="text-xl text-blue-100 mb-4">
                Bienvenido de vuelta a tu perfil
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link
                  to="/configuracion"
                  className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/30"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Configuración
                </Link>
                <Link
                  to="/favoritos"
                  className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/30"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Mis Favoritos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Profile Information Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <User className="w-6 h-6 mr-2" />
                  Información del Perfil
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                      <Mail className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Correo electrónico</p>
                        <p className="font-medium text-gray-900">{perfil.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                      <AtSign className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Nombre de usuario</p>
                        <p className="font-medium text-gray-900">@{perfil.username}</p>
                      </div>
                    </div>

                    {perfil.nombre && (
                      <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                        <User className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Nombre completo</p>
                          <p className="font-medium text-gray-900">{perfil.nombre}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {perfil.ubicacion && (
                      <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                        <MapPin className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Ubicación</p>
                          <p className="font-medium text-gray-900">{perfil.ubicacion}</p>
                        </div>
                      </div>
                    )}

                    {perfil.genero && (
                      <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                        <User className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Género</p>
                          <p className="font-medium text-gray-900 capitalize">{perfil.genero}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                      <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Miembro desde</p>
                        <p className="font-medium text-gray-900">
                          {new Date(perfil.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            timeZone: 'UTC'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Biography Section */}
                {perfil.biografia && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                      Acerca de mí
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-700 leading-relaxed">{perfil.biografia}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Estadísticas
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-gray-700">Libros leídos</span>
                  </div>
                  <span className="font-bold text-blue-600">0</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <MessageCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-gray-700">Reseñas</span>
                  </div>
                  <span className="font-bold text-green-600">0</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <Heart className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="text-gray-700">Favoritos</span>
                  </div>
                  <span className="font-bold text-purple-600">0</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones rápidas</h3>

              <div className="space-y-3">
                <Link
                  to="/libros"
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-medium"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Explorar Libros
                </Link>

                <Link
                  to="/crear-libro"
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium"
                >
                  <Edit3 className="w-5 h-5 mr-2" />
                  Agregar Libro
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilPage;
