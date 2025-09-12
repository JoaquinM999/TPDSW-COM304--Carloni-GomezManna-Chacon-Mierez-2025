import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Book, Tag, Filter, Grid, List } from 'lucide-react';

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  librosCount: number;
  color: string;
}

interface Libro {
  id: number;
  titulo: string;
  autor: string;
  categoria: string;
  rating: number;
  imagen: string;
  año: number;
}

// Mock data - replace with your database
const mockCategorias: Categoria[] = [
  { id: 1, nombre: 'Ficción', descripcion: 'Novelas y cuentos de ficción', librosCount: 1250, color: 'bg-blue-500' },
  { id: 2, nombre: 'Ciencia Ficción', descripcion: 'Libros de ciencia ficción y fantasía', librosCount: 890, color: 'bg-purple-500' },
  { id: 3, nombre: 'Romance', descripcion: 'Novelas románticas', librosCount: 670, color: 'bg-pink-500' },
  { id: 4, nombre: 'Misterio', descripcion: 'Novelas de misterio y thriller', librosCount: 540, color: 'bg-gray-700' },
  { id: 5, nombre: 'Historia', descripcion: 'Libros históricos y biografías', librosCount: 430, color: 'bg-amber-600' },
  { id: 6, nombre: 'Autoayuda', descripcion: 'Desarrollo personal y autoayuda', librosCount: 320, color: 'bg-green-500' },
  { id: 7, nombre: 'Psicología', descripcion: 'Libros de psicología y mente', librosCount: 280, color: 'bg-indigo-500' },
  { id: 8, nombre: 'Filosofía', descripcion: 'Textos filosóficos y pensamiento', librosCount: 190, color: 'bg-red-500' }
];

const mockLibros: Libro[] = [
  { id: 1, titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', categoria: 'Ficción', rating: 4.8, imagen: 'https://images.pexels.com/photos/1741230/pexels-photo-1741230.jpeg', año: 1967 },
  { id: 2, titulo: 'Dune', autor: 'Frank Herbert', categoria: 'Ciencia Ficción', rating: 4.7, imagen: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg', año: 1965 },
  { id: 3, titulo: 'Orgullo y Prejuicio', autor: 'Jane Austen', categoria: 'Romance', rating: 4.6, imagen: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg', año: 1813 },
  { id: 4, titulo: 'El Código Da Vinci', autor: 'Dan Brown', categoria: 'Misterio', rating: 4.2, imagen: 'https://images.pexels.com/photos/1130980/pexels-photo-1130980.jpeg', año: 2003 }
];

export const CategoriasPage: React.FC = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filteredLibros, setFilteredLibros] = useState<Libro[]>([]);
  const [suggestions, setSuggestions] = useState<(Categoria | Libro)[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (searchQuery.length > 1) {
      const categoriaMatches = mockCategorias.filter(cat =>
        cat.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const libroMatches = mockLibros.filter(libro =>
        libro.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        libro.autor.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions([...categoriaMatches, ...libroMatches.slice(0, 5)]);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = mockLibros.filter(libro => 
        libro.categoria === selectedCategory
      );
      setFilteredLibros(filtered);
    } else {
      setFilteredLibros([]);
    }
  }, [selectedCategory]);

  const handleSuggestionClick = (item: Categoria | Libro) => {
    if ('descripcion' in item) {
      // Es una categoría
      setSelectedCategory(item.nombre);
      setSearchQuery(item.nombre);
    } else {
      // Es un libro
      setSearchQuery(item.titulo);
    }
    setShowSuggestions(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Explorar por Categorías</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre libros organizados por categorías o busca específicamente lo que necesitas
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar categorías o libros..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
                {suggestions.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(item)}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      {'descripcion' in item ? (
                        <>
                          <Tag className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900">{item.nombre}</div>
                            <div className="text-sm text-gray-500">{item.librosCount} libros</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <Book className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="font-medium text-gray-900">{item.titulo}</div>
                            <div className="text-sm text-gray-500">por {item.autor}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories Grid */}
        {!selectedCategory && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Todas las Categorías</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {mockCategorias.map((categoria) => (
                <div
                  key={categoria.id}
                  onClick={() => setSelectedCategory(categoria.nombre)}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden"
                >
                  <div className={`h-32 ${categoria.color} flex items-center justify-center`}>
                    <Tag className="w-12 h-12 text-white" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{categoria.nombre}</h3>
                    <p className="text-gray-600 text-sm mb-3">{categoria.descripcion}</p>
                    <div className="text-blue-600 font-medium text-sm">
                      {categoria.librosCount.toLocaleString()} libros
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtered Books */}
        {selectedCategory && filteredLibros.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Libros de {selectedCategory}</h2>
                <p className="text-gray-600">{filteredLibros.length} libros encontrados</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedCategory('')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Ver todas las categorías
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-4'}>
              {filteredLibros.map((libro) => (
                <Link
                  key={libro.id}
                  to={`/libro/${libro.id}`}
                  state={{ from: location.pathname }}
                  className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden ${
                    viewMode === 'list' ? 'flex items-center p-4' : ''
                  }`}
                >
                  <img
                    src={libro.imagen}
                    alt={libro.titulo}
                    className={viewMode === 'grid' ? 'w-full h-48 object-cover' : 'w-16 h-20 object-cover rounded-lg mr-4'}
                  />
                  <div className={viewMode === 'grid' ? 'p-4' : 'flex-1'}>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{libro.titulo}</h3>
                    <p className="text-gray-600 text-sm mb-2">por {libro.autor}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {renderStars(libro.rating)}
                        <span className="text-sm text-gray-600 ml-1">{libro.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500">{libro.año}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};



/* import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategorias } from '../services/categoriaService';

interface Categoria {
  id: number;
  nombre: string;
}

const CategoriasPage = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getCategorias()
      .then(setCategorias)
      .catch((err) => console.error(err));
  }, []);

  const irALibros = (id: number) => {
    navigate(`/categoria/${id}`);
  };

  return (
    <div>
      <h2>Categorías</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {categorias.map((cat) => (
          <li key={cat.id} style={{ margin: '10px 0' }}>
            <button onClick={() => irALibros(cat.id)}>{cat.nombre}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoriasPage;
 */