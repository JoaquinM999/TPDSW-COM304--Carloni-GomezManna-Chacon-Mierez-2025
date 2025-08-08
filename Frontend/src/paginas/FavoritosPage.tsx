import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Book, User, Tag, Star, Clock, CheckCircle, Bookmark, Eye } from 'lucide-react';

interface LibroFavorito {
  id: number;
  titulo: string;
  autor: string;
  categoria: string;
  rating: number;
  imagen: string;
  estado: 'leido' | 'ver-mas-tarde' | 'pendiente';
  fechaAgregado: string;
}

interface AutorFavorito {
  id: number;
  nombre: string;
  libros: number;
  imagen: string;
  fechaAgregado: string;
}

interface CategoriaFavorita {
  id: number;
  nombre: string;
  librosCount: number;
  color: string;
  fechaAgregado: string;
}

// Mock data - replace with your database
const mockLibrosFavoritos: LibroFavorito[] = [
  {
    id: 1,
    titulo: 'Cien años de soledad',
    autor: 'Gabriel García Márquez',
    categoria: 'Ficción',
    rating: 4.8,
    imagen: 'https://images.pexels.com/photos/1741230/pexels-photo-1741230.jpeg',
    estado: 'leido',
    fechaAgregado: '2024-01-15'
  },
  {
    id: 2,
    titulo: 'Dune',
    autor: 'Frank Herbert',
    categoria: 'Ciencia Ficción',
    rating: 4.7,
    imagen: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg',
    estado: 'ver-mas-tarde',
    fechaAgregado: '2024-01-10'
  },
  {
    id: 3,
    titulo: 'El Código Da Vinci',
    autor: 'Dan Brown',
    categoria: 'Misterio',
    rating: 4.2,
    imagen: 'https://images.pexels.com/photos/1130980/pexels-photo-1130980.jpeg',
    estado: 'pendiente',
    fechaAgregado: '2024-01-08'
  }
];

const mockAutoresFavoritos: AutorFavorito[] = [
  {
    id: 1,
    nombre: 'Gabriel García Márquez',
    libros: 15,
    imagen: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg',
    fechaAgregado: '2024-01-12'
  },
  {
    id: 2,
    nombre: 'Isabel Allende',
    libros: 23,
    imagen: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg',
    fechaAgregado: '2024-01-05'
  }
];

const mockCategoriasFavoritas: CategoriaFavorita[] = [
  {
    id: 1,
    nombre: 'Ficción',
    librosCount: 1250,
    color: 'bg-blue-500',
    fechaAgregado: '2024-01-20'
  },
  {
    id: 2,
    nombre: 'Ciencia Ficción',
    librosCount: 890,
    color: 'bg-purple-500',
    fechaAgregado: '2024-01-18'
  }
];

export const FavoritosPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'libros' | 'autores' | 'categorias'>('libros');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  const cambiarEstadoLibro = (libroId: number, nuevoEstado: 'leido' | 'ver-mas-tarde' | 'pendiente') => {
    // Aquí implementarías la lógica para cambiar el estado en tu base de datos
    console.log(`Cambiar estado del libro ${libroId} a ${nuevoEstado}`);
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

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'leido':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'ver-mas-tarde':
        return <Eye className="w-5 h-5 text-blue-600" />;
      case 'pendiente':
        return <Clock className="w-5 h-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'leido':
        return 'bg-green-100 text-green-800';
      case 'ver-mas-tarde':
        return 'bg-blue-100 text-blue-800';
      case 'pendiente':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const librosFiltrados = filtroEstado === 'todos' 
    ? mockLibrosFavoritos 
    : mockLibrosFavoritos.filter(libro => libro.estado === filtroEstado);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Mis Favoritos</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Gestiona tus libros, autores y categorías favoritas
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-8 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('libros')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'libros'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Book className="w-5 h-5" />
            <span>Libros</span>
          </button>
          <button
            onClick={() => setActiveTab('autores')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'autores'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Autores</span>
          </button>
          <button
            onClick={() => setActiveTab('categorias')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'categorias'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Tag className="w-5 h-5" />
            <span>Categorías</span>
          </button>
        </div>

        {/* Libros Tab */}
        {activeTab === 'libros' && (
          <div>
            {/* Filtros */}
            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={() => setFiltroEstado('todos')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filtroEstado === 'todos'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Todos ({mockLibrosFavoritos.length})
              </button>
              <button
                onClick={() => setFiltroEstado('leido')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filtroEstado === 'leido'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Leídos ({mockLibrosFavoritos.filter(l => l.estado === 'leido').length})</span>
              </button>
              <button
                onClick={() => setFiltroEstado('ver-mas-tarde')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filtroEstado === 'ver-mas-tarde'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Ver más tarde ({mockLibrosFavoritos.filter(l => l.estado === 'ver-mas-tarde').length})</span>
              </button>
              <button
                onClick={() => setFiltroEstado('pendiente')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filtroEstado === 'pendiente'
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Pendientes ({mockLibrosFavoritos.filter(l => l.estado === 'pendiente').length})</span>
              </button>
            </div>

            {/* Libros Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {librosFiltrados.map((libro) => (
                <div key={libro.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="relative">
                    <img
                      src={libro.imagen}
                      alt={libro.titulo}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Heart className="w-6 h-6 text-red-500 fill-current" />
                    </div>
                    <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(libro.estado)}`}>
                      <div className="flex items-center space-x-1">
                        {getEstadoIcon(libro.estado)}
                        <span className="capitalize">{libro.estado.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <Link to={`/libro/${libro.id}`} className="block">
                      <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors duration-200">
                        {libro.titulo}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm mb-3">por {libro.autor}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1">
                        {renderStars(libro.rating)}
                        <span className="text-sm text-gray-600 ml-1">{libro.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500">{libro.categoria}</span>
                    </div>
                    
                    {/* Estado Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => cambiarEstadoLibro(libro.id, 'leido')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors duration-200 ${
                          libro.estado === 'leido'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                        }`}
                      >
                        Leído
                      </button>
                      <button
                        onClick={() => cambiarEstadoLibro(libro.id, 'ver-mas-tarde')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors duration-200 ${
                          libro.estado === 'ver-mas-tarde'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-blue-50'
                        }`}
                      >
                        Ver después
                      </button>
                      <button
                        onClick={() => cambiarEstadoLibro(libro.id, 'pendiente')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors duration-200 ${
                          libro.estado === 'pendiente'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-orange-50'
                        }`}
                      >
                        Pendiente
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Autores Tab */}
        {activeTab === 'autores' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockAutoresFavoritos.map((autor) => (
              <div key={autor.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <img
                  src={autor.imagen}
                  alt={autor.nombre}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Link 
                        to={`/usuario/${autor.id}`}
                        className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors duration-200 block"
                      >
                        {autor.nombre}
                      </Link>
                      <p className="text-gray-600 text-sm">{autor.libros} libros</p>
                    </div>
                    <Heart className="w-6 h-6 text-red-500 fill-current" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Agregado el {new Date(autor.fechaAgregado).toLocaleDateString('es-ES')}
                    </span>
                    <Link
                      to={`/autor/${autor.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Ver perfil
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Categorías Tab */}
        {activeTab === 'categorias' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCategoriasFavoritas.map((categoria) => (
              <div key={categoria.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className={`h-32 ${categoria.color} flex items-center justify-center relative`}>
                  <Tag className="w-12 h-12 text-white" />
                  <div className="absolute top-3 right-3">
                    <Heart className="w-6 h-6 text-white fill-current" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{categoria.nombre}</h3>
                  <p className="text-gray-600 text-sm mb-4">{categoria.librosCount.toLocaleString()} libros</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Agregado el {new Date(categoria.fechaAgregado).toLocaleDateString('es-ES')}
                    </span>
                    <Link
                      to={`/categoria/${categoria.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Explorar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};