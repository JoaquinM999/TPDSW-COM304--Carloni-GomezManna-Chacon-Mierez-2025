import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, Heart, Book, Grid, List, ChevronDown } from 'lucide-react';

interface Libro {
  id: number;
  titulo: string;
  autor: string;
  categoria: string;
  rating: number;
  reviews: number;
  imagen: string;
  año: number;
  paginas: number;
  precio: number;
  favoritos: number;
}

// Mock data - replace with your database
const mockLibros: Libro[] = [
  {
    id: 1,
    titulo: 'Cien años de soledad',
    autor: 'Gabriel García Márquez',
    categoria: 'Ficción',
    rating: 4.8,
    reviews: 15420,
    imagen: 'https://images.pexels.com/photos/1741230/pexels-photo-1741230.jpeg',
    año: 1967,
    paginas: 417,
    precio: 24.99,
    favoritos: 8420
  },
  {
    id: 2,
    titulo: 'Dune',
    autor: 'Frank Herbert',
    categoria: 'Ciencia Ficción',
    rating: 4.7,
    reviews: 23150,
    imagen: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg',
    año: 1965,
    paginas: 688,
    precio: 29.99,
    favoritos: 12340
  },
  {
    id: 3,
    titulo: 'Orgullo y Prejuicio',
    autor: 'Jane Austen',
    categoria: 'Romance',
    rating: 4.6,
    reviews: 18930,
    imagen: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg',
    año: 1813,
    paginas: 432,
    precio: 19.99,
    favoritos: 15670
  },
  {
    id: 4,
    titulo: 'El Código Da Vinci',
    autor: 'Dan Brown',
    categoria: 'Misterio',
    rating: 4.2,
    reviews: 12340,
    imagen: 'https://images.pexels.com/photos/1130980/pexels-photo-1130980.jpeg',
    año: 2003,
    paginas: 689,
    precio: 22.99,
    favoritos: 9870
  },
  {
    id: 5,
    titulo: 'Sapiens',
    autor: 'Yuval Noah Harari',
    categoria: 'Historia',
    rating: 4.9,
    reviews: 28450,
    imagen: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg',
    año: 2011,
    paginas: 443,
    precio: 26.99,
    favoritos: 18920
  },
  {
    id: 6,
    titulo: 'Atomic Habits',
    autor: 'James Clear',
    categoria: 'Autoayuda',
    rating: 4.8,
    reviews: 19870,
    imagen: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg',
    año: 2018,
    paginas: 320,
    precio: 21.99,
    favoritos: 14560
  }
];

const categorias = ['Todas', 'Ficción', 'Ciencia Ficción', 'Romance', 'Misterio', 'Historia', 'Autoayuda'];

export const LibrosPage: React.FC = () => {
  const [libros, setLibros] = useState<Libro[]>(mockLibros);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [sortBy, setSortBy] = useState('rating-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set([2, 5]));

  useEffect(() => {
    let filteredLibros = mockLibros;

    // Filter by search query
    if (searchQuery) {
      filteredLibros = filteredLibros.filter(libro =>
        libro.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        libro.autor.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'Todas') {
      filteredLibros = filteredLibros.filter(libro => libro.categoria === selectedCategory);
    }

    // Sort books
    filteredLibros.sort((a, b) => {
      switch (sortBy) {
        case 'rating-desc':
          return b.rating - a.rating;
        case 'rating-asc':
          return a.rating - b.rating;
        case 'year-desc':
          return b.año - a.año;
        case 'year-asc':
          return a.año - b.año;
        case 'title-asc':
          return a.titulo.localeCompare(b.titulo);
        case 'title-desc':
          return b.titulo.localeCompare(a.titulo);
        case 'reviews-desc':
          return b.reviews - a.reviews;
        case 'reviews-asc':
          return a.reviews - b.reviews;
        default:
          return 0;
      }
    });

    setLibros(filteredLibros);
  }, [searchQuery, selectedCategory, sortBy]);

  const toggleFavorite = (libroId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(libroId)) {
        newFavorites.delete(libroId);
      } else {
        newFavorites.add(libroId);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Todos los Libros</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explora nuestra colección completa de libros con filtros avanzados
            </p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título o autor..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {categorias.map(categoria => (
                        <option key={categoria} value={categoria}>{categoria}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="rating-desc">Rating (Mayor a Menor)</option>
                      <option value="rating-asc">Rating (Menor a Mayor)</option>
                      <option value="year-desc">Año (Más Reciente)</option>
                      <option value="year-asc">Año (Más Antiguo)</option>
                      <option value="title-asc">Título (A-Z)</option>
                      <option value="title-desc">Título (Z-A)</option>
                      <option value="reviews-desc">Más Reseñas</option>
                      <option value="reviews-asc">Menos Reseñas</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Mostrando {libros.length} libro{libros.length !== 1 ? 's' : ''}
            {selectedCategory !== 'Todas' && ` en ${selectedCategory}`}
            {searchQuery && ` para "${searchQuery}"`}
          </p>
        </div>

        {/* Books Grid/List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {libros.map((libro) => (
            <div
              key={libro.id}
              className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden ${
                viewMode === 'list' ? 'flex items-center p-4' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={libro.imagen}
                  alt={libro.titulo}
                  className={viewMode === 'grid' ? 'w-full h-48 object-cover' : 'w-20 h-28 object-cover rounded-lg mr-4'}
                />
                <button
                  onClick={() => toggleFavorite(libro.id)}
                  className={`absolute ${viewMode === 'grid' ? 'top-3 right-3' : 'top-1 right-1'} p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors duration-200`}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      favorites.has(libro.id)
                        ? 'text-red-500 fill-current'
                        : 'text-gray-400 hover:text-red-400'
                    }`}
                  />
                </button>
              </div>

              <div className={viewMode === 'grid' ? 'p-4' : 'flex-1'}>
                <Link to={`/libro/${libro.id}`} className="block">
                  <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                    {libro.titulo}
                  </h3>
                </Link>
                <p className="text-gray-600 text-sm mb-3">por {libro.autor}</p>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    {renderStars(libro.rating)}
                    <span className="text-sm font-medium text-gray-700 ml-1">{libro.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500">{libro.reviews.toLocaleString()} reseñas</span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span>{libro.categoria}</span>
                  <span>{libro.año}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-600">${libro.precio}</span>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Heart className="w-3 h-3" />
                    <span>{libro.favoritos.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {libros.length === 0 && (
          <div className="text-center py-12">
            <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron libros</h3>
            <p className="text-gray-600 mb-4">
              Intenta ajustar tus filtros o términos de búsqueda
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todas');
                setSortBy('rating-desc');
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Limpiar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};