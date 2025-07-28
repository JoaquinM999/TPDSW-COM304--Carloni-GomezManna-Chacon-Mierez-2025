import React from 'react';
import { Star, TrendingUp, Clock, Users, ChevronRight, Heart, User, BookOpen } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  author: string;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  trending?: boolean;
  isFavorite?: boolean;
  favoriteCount?: number;
}

const featuredBooks: ContentItem[] = [
  {
    id: '1',
    title: 'El Hombre en Busca de Sentido',
    author: 'Viktor Frankl',
    rating: 4.8,
    reviews: 15420,
    image: 'https://images.pexels.com/photos/1741230/pexels-photo-1741230.jpeg',
    category: 'Psicología',
    trending: true,
    isFavorite: false,
    favoriteCount: 8420
  },
  {
    id: '2',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    rating: 4.7,
    reviews: 23150,
    image: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg',
    category: 'Historia',
    isFavorite: true,
    favoriteCount: 12340
  },
  {
    id: '3',
    title: 'Atomic Habits',
    author: 'James Clear',
    rating: 4.9,
    reviews: 18930,
    image: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg',
    category: 'Autoayuda',
    trending: true,
    isFavorite: false,
    favoriteCount: 15670
  },
  {
    id: '4',
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    rating: 4.6,
    reviews: 12340,
    image: 'https://images.pexels.com/photos/1130980/pexels-photo-1130980.jpeg',
    category: 'Thriller',
    isFavorite: false,
    favoriteCount: 9870
  }
];

const recentReviews = [
  {
    id: '1',
    user: 'María González',
    book: 'Dune',
    rating: 5,
    comment: 'Una obra maestra de la ciencia ficción. La construcción del mundo es increíble...',
    time: '2 horas',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
  },
  {
    id: '2',
    user: 'Carlos Rivera',
    book: 'El Nombre del Viento',
    rating: 4,
    comment: 'Narrativa envolvente y personajes bien desarrollados. Rothfuss sabe cómo...',
    time: '5 horas',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg'
  },
  {
    id: '3',
    user: 'Ana Martín',
    book: 'Educated',
    rating: 5,
    comment: 'Un memoir poderoso y transformador. La historia de Tara es inspiradora...',
    time: '1 día',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
  }
];

const userLists = [
  { title: 'Mis Libros Favoritos de 2024', books: 27, isPublic: true, followers: 234 },
  { title: 'Clásicos por Leer', books: 15, isPublic: false, followers: 0 },
  { title: 'Ciencia Ficción Recomendada', books: 42, isPublic: true, followers: 189 },
  { title: 'Autores Latinoamericanos', books: 33, isPublic: true, followers: 321 }
];

export const FeaturedContent: React.FC = () => {
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set(['2']));

  const toggleFavorite = (bookId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(bookId)) {
        newFavorites.delete(bookId);
      } else {
        newFavorites.add(bookId);
      }
      return newFavorites;
    });
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

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trending Books */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-orange-500" />
              <h2 className="text-3xl font-bold text-gray-900">Tendencias Actuales</h2>
            </div>
            <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
              <span>Ver todos</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBooks.map((book) => (
              <div key={book.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
                <div className="relative">
                  <img 
                    src={book.image} 
                    alt={book.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {book.trending && (
                    <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Trending
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
                    {book.category}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{book.title}</h3>
                    <button
                      onClick={() => toggleFavorite(book.id)}
                      className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    >
                      <Heart 
                        className={`w-5 h-5 ${
                          favorites.has(book.id) 
                            ? 'text-red-500 fill-current' 
                            : 'text-gray-400 hover:text-red-400'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">por {book.author}</p>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1">
                      {renderStars(book.rating)}
                      <span className="text-sm font-medium text-gray-700 ml-1">{book.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500">{book.reviews.toLocaleString()} reseñas</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Heart className="w-3 h-3 mr-1" />
                    <span>{book.favoriteCount?.toLocaleString()} favoritos</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <Clock className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-900">Reseñas Recientes</h2>
            </div>
            
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={review.avatar} 
                      alt={review.user}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{review.user}</h4>
                          <p className="text-sm text-gray-600">reseñó <span className="font-medium">{review.book}</span></p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{review.comment}</p>
                      <span className="text-xs text-gray-500">hace {review.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Lists */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <BookOpen className="w-6 h-6 text-purple-500" />
              <h2 className="text-2xl font-bold text-gray-900">Mis Listas de Lectura</h2>
            </div>
            
            <div className="space-y-4">
              {userLists.map((list, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{list.title}</h4>
                    <div className="flex items-center space-x-2">
                      {list.isPublic ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Pública</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Privada</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{list.books} libros</span>
                    {list.isPublic && (
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{list.followers} seguidores</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Authors Section */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <User className="w-6 h-6 text-green-500" />
              <h2 className="text-3xl font-bold text-gray-900">Autores Destacados</h2>
            </div>
            <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
              <span>Ver todos</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Gabriel García Márquez', books: 15, followers: 45200, image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg' },
              { name: 'Isabel Allende', books: 23, followers: 38900, image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg' },
              { name: 'Mario Vargas Llosa', books: 31, followers: 42100, image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg' },
              { name: 'Julio Cortázar', books: 18, followers: 29800, image: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg' }
            ].map((author, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <img 
                  src={author.image} 
                  alt={author.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{author.name}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{author.books} libros</span>
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{author.followers.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};