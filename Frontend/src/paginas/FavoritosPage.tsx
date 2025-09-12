import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Book, User, Tag, Star, Clock, CheckCircle, Bookmark, Eye, Plus, X, Edit, Trash2 } from 'lucide-react';
import { listaService, Lista, ContenidoLista } from '../services/listaService';

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
  const [listas, setListas] = useState<Lista[]>([]);
  const [librosFavoritos, setLibrosFavoritos] = useState<LibroFavorito[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userListas = await listaService.getUserListas();
        setListas(userListas);

        // Fetch contents of all lists
        const allContenidos: ContenidoLista[] = [];
        for (const lista of userListas) {
          const contenidos = await listaService.getContenidoLista(lista.id);
          allContenidos.push(...contenidos);
        }

        // Map to LibroFavorito format
        const libros: LibroFavorito[] = allContenidos.map(contenido => {
          const lista = userListas.find(l => l.id === contenido.lista.id);
          const estado = lista?.tipo === 'read' ? 'leido' :
                         lista?.tipo === 'to_read' ? 'ver-mas-tarde' : 'pendiente';
          return {
            id: contenido.libro.id,
            titulo: contenido.libro.titulo,
            autor: contenido.libro.autores.join(', '),
            categoria: contenido.libro.categoria.nombre,
            rating: contenido.libro.ratingPromedio,
            imagen: contenido.libro.imagenPortada,
            estado,
            fechaAgregado: contenido.createdAt
          };
        });

        setLibrosFavoritos(libros);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const cambiarEstadoLibro = async (libroId: number, nuevoEstado: 'leido' | 'ver-mas-tarde' | 'pendiente') => {
    try {
      // Map estado to lista tipo
      const tipoLista = nuevoEstado === 'leido' ? 'read' :
                       nuevoEstado === 'ver-mas-tarde' ? 'to_read' : 'pending';

      // Find if user already has a list of this type
      const listaExistente = listas.find(l => l.tipo === tipoLista);

      if (listaExistente) {
        // Add book to existing list
        await listaService.addLibroALista(listaExistente.id, libroId);
      } else {
        // Create new list and add book
        const nuevaLista = await listaService.createLista(
          tipoLista === 'read' ? 'Leídos' :
          tipoLista === 'to_read' ? 'Para Leer' : 'Pendientes',
          tipoLista
        );
        await listaService.addLibroALista(nuevaLista.id, libroId);
        // Refresh lists
        const userListas = await listaService.getUserListas();
        setListas(userListas);
      }

      // Refresh librosFavoritos
      const allContenidos: ContenidoLista[] = [];
      for (const lista of listas) {
        const contenidos = await listaService.getContenidoLista(lista.id);
        allContenidos.push(...contenidos);
      }

      const libros: LibroFavorito[] = allContenidos.map(contenido => {
        const lista = listas.find(l => l.id === contenido.lista.id);
        const estado = lista?.tipo === 'read' ? 'leido' :
                       lista?.tipo === 'to_read' ? 'ver-mas-tarde' : 'pendiente';
        return {
          id: contenido.libro.id,
          titulo: contenido.libro.titulo,
          autor: contenido.libro.autores.join(', '),
          categoria: contenido.libro.categoria.nombre,
          rating: contenido.libro.ratingPromedio,
          imagen: contenido.libro.imagenPortada,
          estado,
          fechaAgregado: contenido.createdAt
        };
      });

      setLibrosFavoritos(libros);
    } catch (error) {
      console.error('Error cambiando estado del libro:', error);
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
    ? librosFavoritos
    : librosFavoritos.filter(libro => libro.estado === filtroEstado);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Mis Favoritos
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Gestiona tus libros, autores y categorías favoritas con estilo
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <motion.div
          className="flex space-x-1 bg-white/60 backdrop-blur-sm p-1 rounded-2xl mb-8 max-w-md mx-auto shadow-lg border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            onClick={() => setActiveTab('libros')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'libros'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Book className="w-5 h-5" />
            <span>Libros</span>
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('autores')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'autores'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <User className="w-5 h-5" />
            <span>Autores</span>
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('categorias')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'categorias'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Tag className="w-5 h-5" />
            <span>Categorías</span>
          </motion.button>
        </motion.div>

        {/* Libros Tab */}
        {activeTab === 'libros' && (
          <div>
            {/* Filtros */}
            <motion.div
              className="flex flex-wrap gap-3 mb-8 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                onClick={() => setFiltroEstado('todos')}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 shadow-lg ${
                  filtroEstado === 'todos'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-blue-500/25'
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg border border-white/20'
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Todos ({librosFavoritos.length})
              </motion.button>
              <motion.button
                onClick={() => setFiltroEstado('leido')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 shadow-lg ${
                  filtroEstado === 'leido'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/25'
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg border border-white/20'
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Leídos ({librosFavoritos.filter(l => l.estado === 'leido').length})</span>
              </motion.button>
              <motion.button
                onClick={() => setFiltroEstado('ver-mas-tarde')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 shadow-lg ${
                  filtroEstado === 'ver-mas-tarde'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-blue-500/25'
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg border border-white/20'
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Eye className="w-4 h-4" />
                <span>Ver más tarde ({librosFavoritos.filter(l => l.estado === 'ver-mas-tarde').length})</span>
              </motion.button>
              <motion.button
                onClick={() => setFiltroEstado('pendiente')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 shadow-lg ${
                  filtroEstado === 'pendiente'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-orange-500/25'
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg border border-white/20'
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Clock className="w-4 h-4" />
                <span>Pendientes ({librosFavoritos.filter(l => l.estado === 'pendiente').length})</span>
              </motion.button>
            </motion.div>

            {/* Libros Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {librosFiltrados.map((libro) => (
                <motion.div
                  key={libro.id}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/20"
                  variants={cardVariants}
                  whileHover={{
                    scale: 1.03,
                    y: -8,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative group">
                    <img
                      src={libro.imagen}
                      alt={libro.titulo}
                      className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <motion.div
                      className="absolute top-4 right-4"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Heart className="w-7 h-7 text-red-500 drop-shadow-lg" fill="currentColor" />
                    </motion.div>
                    <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/20 ${getEstadoColor(libro.estado)} shadow-lg`}>
                      <div className="flex items-center space-x-1.5">
                        {getEstadoIcon(libro.estado)}
                        <span className="capitalize">{libro.estado.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <Link to={`/libro/${libro.id}`} className="block group">
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300 text-lg leading-tight">
                        {libro.titulo}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm mb-4 font-medium">por {libro.autor}</p>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center space-x-1">
                        {renderStars(libro.rating)}
                        <span className="text-sm font-semibold text-gray-700 ml-1">{libro.rating}</span>
                      </div>
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {libro.categoria}
                      </span>
                    </div>

                    {/* Estado Buttons */}
                    <div className="flex space-x-2">
                      <motion.button
                        onClick={() => cambiarEstadoLibro(libro.id, 'leido')}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-300 ${
                          libro.estado === 'leido'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700 hover:shadow-md'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Leído
                      </motion.button>
                      <motion.button
                        onClick={() => cambiarEstadoLibro(libro.id, 'ver-mas-tarde')}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-300 ${
                          libro.estado === 'ver-mas-tarde'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Ver después
                      </motion.button>
                      <motion.button
                        onClick={() => cambiarEstadoLibro(libro.id, 'pendiente')}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-300 ${
                          libro.estado === 'pendiente'
                            ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-700 hover:shadow-md'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Pendiente
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
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