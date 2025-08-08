import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, BookOpen, User, Calendar, Tag, MessageCircle, ThumbsUp, Share2 } from 'lucide-react';

interface Libro {
  id: number;
  titulo: string;
  autor: string;
  categoria: string;
  rating: number;
  imagen: string;
  año: number;
  paginas: number;
  sinopsis: string;
  isbn: string;
  editorial: string;
  idioma: string;
}

interface Reseña {
  id: number;
  usuario: string;
  avatar: string;
  rating: number;
  titulo: string;
  comentario: string;
  fecha: string;
  likes: number;
  esUtil: boolean;
}

// Mock data - replace with your database
const mockLibro: Libro = {
  id: 1,
  titulo: 'Cien años de soledad',
  autor: 'Gabriel García Márquez',
  categoria: 'Ficción',
  rating: 4.8,
  imagen: 'https://images.pexels.com/photos/1741230/pexels-photo-1741230.jpeg',
  año: 1967,
  paginas: 417,
  sinopsis: 'La novela narra la historia de la familia Buendía a lo largo de siete generaciones en el pueblo ficticio de Macondo. Es una obra maestra del realismo mágico que explora temas como la soledad, el amor, la guerra y el destino cíclico de la humanidad.',
  isbn: '978-0-06-088328-7',
  editorial: 'Editorial Sudamericana',
  idioma: 'Español'
};

const mockReseñas: Reseña[] = [
  {
    id: 1,
    usuario: 'María González',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    rating: 5,
    titulo: 'Una obra maestra del realismo mágico',
    comentario: 'García Márquez logra crear un mundo completamente inmersivo donde lo fantástico se mezcla perfectamente con la realidad. La historia de los Buendía es fascinante y cada personaje está magistralmente desarrollado. Sin duda, uno de los mejores libros que he leído.',
    fecha: '2024-01-15',
    likes: 24,
    esUtil: true
  },
  {
    id: 2,
    usuario: 'Carlos Rivera',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    rating: 4,
    titulo: 'Complejo pero rewarding',
    comentario: 'Al principio puede resultar confuso seguir a tantos personajes con nombres similares, pero una vez que te adaptas al estilo narrativo, es una experiencia increíble. La prosa de García Márquez es poética y envolvente.',
    fecha: '2024-01-10',
    likes: 18,
    esUtil: false
  },
  {
    id: 3,
    usuario: 'Ana Martín',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    rating: 5,
    titulo: 'Un clásico que trasciende el tiempo',
    comentario: 'Cada vez que releo este libro descubro nuevos detalles y simbolismos. Es una obra que se puede disfrutar en múltiples niveles y que ofrece algo diferente en cada lectura. Imprescindible en cualquier biblioteca.',
    fecha: '2024-01-08',
    likes: 31,
    esUtil: true
  }
];

export const DetalleLibro: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [libro, setLibro] = useState<Libro | null>(null);
  const [reseñas, setReseñas] = useState<Reseña[]>([]);
  const [esFavorito, setEsFavorito] = useState(false);
  const [mostrarSinopsis, setMostrarSinopsis] = useState(false);

  useEffect(() => {
    // Simulate API call
    setLibro(mockLibro);
    setReseñas(mockReseñas);
  }, [id]);

  const toggleFavorito = () => {
    setEsFavorito(!esFavorito);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
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

  if (!libro) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando libro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Book Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Book Cover */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <img
                  src={libro.imagen}
                  alt={libro.titulo}
                  className="w-full max-w-sm mx-auto rounded-xl shadow-2xl"
                />
                <div className="mt-6 space-y-3">
                  <button
                    onClick={toggleFavorito}
                    className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                      esFavorito
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${esFavorito ? 'fill-current' : ''}`} />
                    <span>{esFavorito ? 'En Favoritos' : 'Agregar a Favoritos'}</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200">
                    <BookOpen className="w-5 h-5" />
                    <span>Marcar como Leído</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-200">
                    <Share2 className="w-5 h-5" />
                    <span>Compartir</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Book Info */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <Link to="/categorias" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  ← Volver a categorías
                </Link>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{libro.titulo}</h1>
              
              <div className="flex items-center space-x-4 mb-6">
                <Link to={`/autor/${libro.autor}`} className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                  <User className="w-5 h-5" />
                  <span className="text-lg font-medium">{libro.autor}</span>
                </Link>
              </div>

              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center space-x-2">
                  {renderStars(libro.rating)}
                  <span className="text-xl font-bold text-gray-900">{libro.rating}</span>
                  <span className="text-gray-600">({reseñas.length} reseñas)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Calendar className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Año</div>
                  <div className="font-semibold">{libro.año}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <BookOpen className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Páginas</div>
                  <div className="font-semibold">{libro.paginas}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Tag className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Categoría</div>
                  <div className="font-semibold">{libro.categoria}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <MessageCircle className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Idioma</div>
                  <div className="font-semibold">{libro.idioma}</div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Sinopsis</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className={`text-gray-700 leading-relaxed ${!mostrarSinopsis ? 'line-clamp-4' : ''}`}>
                    {libro.sinopsis}
                  </p>
                  <button
                    onClick={() => setMostrarSinopsis(!mostrarSinopsis)}
                    className="text-blue-600 hover:text-blue-700 font-medium mt-2"
                  >
                    {mostrarSinopsis ? 'Ver menos' : 'Ver más'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div><strong>ISBN:</strong> {libro.isbn}</div>
                <div><strong>Editorial:</strong> {libro.editorial}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Reseñas ({reseñas.length})</h2>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200">
            Escribir Reseña
          </button>
        </div>

        <div className="space-y-6">
          {reseñas.map((reseña) => (
            <div key={reseña.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start space-x-4">
                <img
                  src={reseña.avatar}
                  alt={reseña.usuario}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <Link 
                        to={`/usuario/1`}
                        className="font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200"
                      >
                        {reseña.usuario}
                      </Link>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {renderStars(reseña.rating)}
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(reseña.fecha)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <h5 className="font-medium text-gray-900 mb-2">{reseña.titulo}</h5>
                  <p className="text-gray-700 mb-4 leading-relaxed">{reseña.comentario}</p>
                  
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm">{reseña.likes}</span>
                    </button>
                    <button className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200">
                      Responder
                    </button>
                    {reseña.esUtil && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Útil
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};