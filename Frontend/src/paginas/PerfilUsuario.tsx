// NOTE: Esta funcionalidad no anda correctamente - revisar implementación
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { User, UserPlus, UserCheck, Star, Heart, Book, List, MessageCircle, Calendar, MapPin, Mail, Users, Eye, Lock } from 'lucide-react';
import { seguimientoService } from '../services/seguimientoService';
import { getUsuarioById } from '../services/userService';
import { getResenasByUsuario } from '../services/resenaService';
import { listaService } from '../services/listaService';
import { isAuthenticated } from '../services/authService';

interface Usuario {
  id: number;
  nombre: string;
  username: string;
  email: string;
  genero: 'masculino' | 'femenino' | 'otro';
  fechaRegistro: string;
  ubicacion?: string;
  biografia?: string;
  seguidores: number;
  siguiendo: number;
  librosLeidos: number;
  reseñasEscritas: number;
  listasCreadas: number;
  esSeguido: boolean;
  esPerfilPropio: boolean;
}

interface Reseña {
  id: number;
  libroId: number;
  libroTitulo: string;
  libroAutor: string;
  libroImagen: string;
  rating: number;
  titulo: string;
  comentario: string;
  fecha: string;
  likes: number;
  esPublica: boolean;
}

interface Lista {
  id: number;
  titulo: string;
  descripcion: string;
  librosCount: number;
  esPublica: boolean;
  fechaCreacion: string;
  seguidores: number;
  librosPortada: string[];
}



export const PerfilUsuario: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [reseñas, setReseñas] = useState<Reseña[]>([]);
  const [listas, setListas] = useState<Lista[]>([]);
  const [activeTab, setActiveTab] = useState<'reseñas' | 'listas'>('reseñas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      // Check if user is authenticated
      if (!isAuthenticated()) {
        navigate('/LoginPage');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const userId = parseInt(id);
        const currentUserId = parseInt(localStorage.getItem('userId') || '0');

        // Fetch user data
        const usuarioData = await getUsuarioById(userId);

        // Fetch reviews
        const reseñasData = await getResenasByUsuario(userId);

        // Fetch lists
        const listasData = await listaService.getListasByUsuario(userId);

        // Map data to component interfaces
        let esSeguido = false;
        if (userId !== currentUserId) {
          try {
            esSeguido = await seguimientoService.isFollowing(userId);
          } catch (err) {
            console.error('Error checking follow status:', err);
          }
        }

        const usuario: Usuario = {
          ...usuarioData,
          esPerfilPropio: userId === currentUserId,
          esSeguido: esSeguido,
        };

        const reseñas: Reseña[] = reseñasData.map((r: any) => ({
          id: r.id,
          libroId: r.libro?.id || r.libroId,
          libroTitulo: r.libro?.titulo || r.libroTitulo,
          libroAutor: r.libro?.autores?.join(', ') || r.libroAutor,
          libroImagen: r.libro?.imagenPortada || r.libroImagen,
          rating: r.estrellas || r.rating,
          titulo: r.titulo,
          comentario: r.comentario,
          fecha: r.createdAt || r.fecha,
          likes: r.likes || 0,
          esPublica: r.esPublica !== false,
        }));

        const listas: Lista[] = listasData.map((l: any) => ({
          id: l.id,
          titulo: l.nombre || l.titulo,
          descripcion: l.descripcion || '',
          librosCount: l.librosCount || 0,
          esPublica: l.tipo !== 'custom' || l.esPublica !== false,
          fechaCreacion: l.createdAt || l.fechaCreacion,
          seguidores: l.seguidores || 0,
          librosPortada: [], // TODO: Implement book covers
        }));

        setUsuario(usuario);
        setReseñas(reseñas);
        setListas(listas);
      } catch (err) {
        console.error('Error fetching user profile data:', err);
        setError('Error al cargar el perfil del usuario');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleSeguir = async () => {
    if (!usuario) return;

    try {
      if (usuario.esSeguido) {
        await seguimientoService.unfollowUser(usuario.id);
        setUsuario({
          ...usuario,
          esSeguido: false,
          seguidores: usuario.seguidores - 1
        });
      } else {
        await seguimientoService.followUser(usuario.id);
        setUsuario({
          ...usuario,
          esSeguido: true,
          seguidores: usuario.seguidores + 1
        });
      }
    } catch (error) {
      console.error('Error al seguir/dejar de seguir usuario:', error);
    }
  };

  const getAvatarIcon = (genero: string) => {
    if (genero === 'femenino') {
      return (
        <div className="w-32 h-32 bg-pink-100 rounded-full flex items-center justify-center">
          <User className="w-16 h-16 text-pink-600" />
        </div>
      );
    } else {
      return (
        <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-16 h-16 text-blue-600" />
        </div>
      );
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <DotLottieReact
            src="https://lottie.host/6d727e71-5a1d-461e-9434-c9e7eb1ae1d1/IWVmdeMHnT.lottie"
            loop
            autoplay
            style={{ width: 140, height: 140 }}
          />
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar perfil</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Usuario no encontrado</h2>
          <p className="text-gray-600">El perfil que buscas no existe o ha sido eliminado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {getAvatarIcon(usuario.genero)}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{usuario.nombre}</h1>
                  <p className="text-gray-600 mb-2">@{usuario.username}</p>
                  {usuario.ubicacion && (
                    <div className="flex items-center text-gray-500 text-sm mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{usuario.ubicacion}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Miembro desde {formatDate(usuario.fechaRegistro)}</span>
                  </div>
                </div>

                {/* Follow Button */}
                {!usuario.esPerfilPropio && (
                  <button
                    onClick={handleSeguir}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                      usuario.esSeguido
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {usuario.esSeguido ? (
                      <>
                        <UserCheck className="w-5 h-5" />
                        <span>Siguiendo</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        <span>Seguir</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Biography */}
              {usuario.biografia && (
                <p className="text-gray-700 mb-6 max-w-2xl">{usuario.biografia}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{usuario.seguidores.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Seguidores</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{usuario.siguiendo.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Siguiendo</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{usuario.librosLeidos}</div>
                  <div className="text-sm text-gray-600">Libros Leídos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{usuario.reseñasEscritas}</div>
                  <div className="text-sm text-gray-600">Reseñas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{usuario.listasCreadas}</div>
                  <div className="text-sm text-gray-600">Listas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-8 max-w-md">
          <button
            onClick={() => setActiveTab('reseñas')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'reseñas'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span>Reseñas ({reseñas.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('listas')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'listas'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="w-5 h-5" />
            <span>Listas ({listas.length})</span>
          </button>
        </div>

        {/* Reviews Tab */}
        {activeTab === 'reseñas' && (
          <div className="space-y-6">
            {reseñas.map((reseña) => (
              <div key={reseña.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start space-x-4">
                  <Link to={`/libro/${reseña.libroId}`}>
                    <img
                      src={reseña.libroImagen}
                      alt={reseña.libroTitulo}
                      className="w-16 h-20 object-cover rounded-lg hover:opacity-80 transition-opacity duration-200"
                    />
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Link 
                          to={`/libro/${reseña.libroId}`}
                          className="font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200"
                        >
                          {reseña.libroTitulo}
                        </Link>
                        <p className="text-gray-600 text-sm">por {reseña.libroAutor}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {renderStars(reseña.rating)}
                        </div>
                        <div title={reseña.esPublica ? 'Lista pública' : 'Lista privada'}>
                            {reseña.esPublica ? (
                            <Eye className="w-4 h-4 text-green-600" />
                            ) : (
                            <Lock className="w-4 h-4 text-gray-400"/>
                            )}
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-2">{reseña.titulo}</h4>
                    <p className="text-gray-700 mb-4 leading-relaxed">{reseña.comentario}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatDate(reseña.fecha)}</span>
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4" />
                        <span>{reseña.likes} likes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {reseñas.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay reseñas aún</h3>
                <p className="text-gray-600">
                  {usuario.esPerfilPropio 
                    ? 'Comienza escribiendo tu primera reseña' 
                    : `${usuario.nombre} no ha escrito reseñas públicas aún`
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Lists Tab */}
        {activeTab === 'listas' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listas.map((lista) => (
              <div key={lista.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                {/* Book covers preview */}
                <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500 relative overflow-hidden">
                  {lista.librosPortada.length > 0 ? (
                    <div className="flex items-center justify-center h-full space-x-2 p-4">
                      {lista.librosPortada.slice(0, 3).map((imagen, index) => (
                        <img
                          key={index}
                          src={imagen}
                          alt=""
                          className="w-12 h-16 object-cover rounded shadow-lg"
                          style={{ transform: `rotate(${(index - 1) * 5}deg)` }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Book className="w-12 h-12 text-white opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3" title={lista.esPublica ? 'Lista pública' : 'Lista privada'}>
                    {lista.esPublica ? (
                      <Eye className="w-5 h-5 text-white" />
                    ) : (
                      <Lock className="w-5 h-5 text-white"/>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{lista.titulo}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{lista.descripcion}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{lista.librosCount} libros</span>
                    {lista.esPublica && (
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{lista.seguidores} seguidores</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    Creada el {formatDate(lista.fechaCreacion)}
                  </div>
                </div>
              </div>
            ))}

            {listas.length === 0 && (
              <div className="col-span-full text-center py-12">
                <List className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay listas aún</h3>
                <p className="text-gray-600">
                  {usuario.esPerfilPropio 
                    ? 'Crea tu primera lista de libros' 
                    : `${usuario.nombre} no ha creado listas públicas aún`
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};