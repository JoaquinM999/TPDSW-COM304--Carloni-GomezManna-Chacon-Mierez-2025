import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Book, User, Tag, Star, Clock, CheckCircle, Bookmark, Eye, Plus, X, Edit, Trash2 } from 'lucide-react';
import { listaService, Lista, ContenidoLista } from '../services/listaService';
import { getAutores } from '../services/autorService';
import { getCategorias } from '../services/categoriaService';
import { obtenerFavoritos } from '../services/favoritosService';

interface LibroFavorito {
  id: number; // ✅ Volvemos a usar 'number' como el tipo del ID.
  titulo: string;
  autor: string;
  categoria: string;
  rating: number;
  imagen: string;
  estados: ('leido' | 'ver-mas-tarde' | 'pendiente' | 'favorito')[]; // ✅ CAMBIO CLAVE: de 'estado' a 'estados'
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



export const FavoritosPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'libros' | 'autores' | 'categorias'>('libros');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [listas, setListas] = useState<Lista[]>([]);
  const [librosFavoritos, setLibrosFavoritos] = useState<LibroFavorito[]>([]);
  const [autoresFavoritos, setAutoresFavoritos] = useState<AutorFavorito[]>([]);
  const [categoriasFavoritas, setCategoriasFavoritas] = useState<CategoriaFavorita[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
        const [favoritos, allContenidos, userListas] = await Promise.all([
            obtenerFavoritos(),
            listaService.getAllUserContenido(),
            listaService.getUserListas(),
        ]);

        // ======================= DEBUGGING =======================
        console.log("DATOS DE LISTAS (allContenidos):", allContenidos);
        console.log("DATOS DE FAVORITOS (favoritos):", favoritos);
        // =========================================================

        setListas(userListas);

        const getPriority = (estado: string) => {
            switch (estado) {
                case 'favorito': return 4;
                case 'leido': return 3;
                case 'ver-mas-tarde': return 2;
                case 'pendiente': return 1;
                default: return 0;
            }
        };

        // ✅ El mapa ahora guardará un array de estados
        const librosMap = new Map<number, { libroData: any, estados: Set<string>, fecha: string }>();

        // 1. PROCESAR LIBROS DE LISTAS (Acumulando estados)
        allContenidos.forEach(contenido => {
            const libroId = contenido.libro.id;
            const estado = contenido.lista.tipo === 'read' ? 'leido' :
                           contenido.lista.tipo === 'to_read' ? 'ver-mas-tarde' : 'pendiente';

            const existing = librosMap.get(libroId);
            if (existing) {
                // Si el libro ya está en el mapa, solo añade el nuevo estado
                existing.estados.add(estado);
            } else {
                // Si es la primera vez que vemos el libro, lo agregamos al mapa
                librosMap.set(libroId, {
                    libroData: contenido.libro,
                    estados: new Set([estado]), // Usamos un Set para evitar estados duplicados
                    fecha: contenido.createdAt,
                });
            }
        });

        // 2. PROCESAR FAVORITOS (Añadiendo el estado 'favorito')
        favoritos.forEach(fav => {
            const libroId = fav.libroId;
            const existing = librosMap.get(libroId);

            if (existing) {
                // Si el libro ya existe (viene de una lista), añade el estado 'favorito'
                existing.estados.add('favorito');
            } else {
                // Si es un favorito que no está en ninguna lista, lo agregamos al mapa
                librosMap.set(libroId, {
                    libroData: {
                        id: libroId,
                        nombre: fav.titulo,
                        autores: fav.autor ? fav.autor.split(', ') : ['Autor desconocido'],
                        categoria: { nombre: fav.categoria },
                        ratingLibro: { avgRating: fav.rating },
                        imagen: fav.imagen,
                    },
                    estados: new Set(['favorito']),
                    fecha: fav.fechaAgregado,
                });
            }
        });

        // 3. CONSTRUIR EL ARRAY FINAL
        const allLibros: LibroFavorito[] = Array.from(librosMap.values()).map(item => ({
            id: item.libroData.id,
            titulo: item.libroData.nombre,
            autor: (Array.isArray(item.libroData.autores) && item.libroData.autores.length > 0)
                ? (typeof item.libroData.autores[0] === 'string'
                    ? (item.libroData.autores as string[]).join(', ')
                    : (item.libroData.autores as any[]).map(a => a?.nombre ?? a).join(', '))
                : 'Autor desconocido',
            categoria: typeof item.libroData.categoria === 'string' ? item.libroData.categoria : item.libroData.categoria?.nombre || 'Sin categoría',
            rating: item.libroData.ratingLibro?.avgRating || 0,
            imagen: item.libroData.imagen,
            // ✅ Convertimos el Set de estados a un array
            estados: Array.from(item.estados) as ('leido' | 'ver-mas-tarde' | 'pendiente' | 'favorito')[],
            fechaAgregado: item.fecha,
        }));
        
        setLibrosFavoritos(allLibros);

        // --- El resto de la función para autores y categorías no cambia ---
        const autorMap = new Map<string, AutorFavorito>();
        const categoriaMap = new Map<string, CategoriaFavorita>();

        allLibros.forEach(libro => {
            const autoresArray = libro.autor.split(', ').filter(a => a);
            autoresArray.forEach((autorNombre, index) => {
                if (autorNombre === 'Autor desconocido') return;
                if (!autorMap.has(autorNombre)) {
                    autorMap.set(autorNombre, {
                        id: Date.now() + Math.random(),
                        nombre: autorNombre,
                        libros: 1,
                        imagen: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg',
                        fechaAgregado: libro.fechaAgregado
                    });
                } else {
                    const existing = autorMap.get(autorNombre)!;
                    existing.libros += 1;
                }
            });

            if (libro.categoria && libro.categoria !== 'Sin categoría') {
                if (!categoriaMap.has(libro.categoria)) {
                    categoriaMap.set(libro.categoria, {
                        id: Date.now() + Math.random(),
                        nombre: libro.categoria,
                        librosCount: 1,
                        color: getRandomColor(),
                        fechaAgregado: libro.fechaAgregado
                    });
                } else {
                    const existing = categoriaMap.get(libro.categoria)!;
                    existing.librosCount += 1;
                }
            }
        });

        setAutoresFavoritos(Array.from(autorMap.values()));
        setCategoriasFavoritas(Array.from(categoriaMap.values()));

    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getRandomColor = () => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

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
      // Find the libro object
      const libro = librosFavoritos.find(l => l.id === libroId);
      if (!libro) {
        console.error('Libro not found');
        return;
      }

      // Map estado to lista tipo
      const tipoLista = nuevoEstado === 'leido' ? 'read' :
                       nuevoEstado === 'ver-mas-tarde' ? 'to_read' : 'pending';

      // Find if user already has a list of this type
      const listaExistente = listas.find(l => l.tipo === tipoLista);

      if (listaExistente) {
        // Check if book is already in this list
        const libroEnLista = librosFavoritos.find(l => l.id === libroId && l.estados.includes(nuevoEstado));
        if (libroEnLista) {
          // Remove from list if already there
          await listaService.removeLibroDeLista(listaExistente.id, libroId.toString());
        } else {
          // Add to existing list
          await listaService.addLibroALista(listaExistente.id, {
            id: libroId.toString(),
            titulo: libro.titulo,
            autores: libro.autor.split(', '),
            descripcion: null,
            imagen: libro.imagen,
            enlace: null,
            source: 'google' // default, since we don't have source info here
          });
        }
      } else {
        // Create new list and add book
        const nuevaLista = await listaService.createLista(
          tipoLista === 'read' ? 'Leídos' :
          tipoLista === 'to_read' ? 'Para Leer' : 'Pendientes',
          tipoLista
        );

        // Update listas state synchronously for immediate use
        const updatedListas = [...listas, nuevaLista];
        setListas(updatedListas);

        await listaService.addLibroALista(nuevaLista.id, {
          id: libroId.toString(),
          titulo: libro.titulo,
          autores: libro.autor.split(', '),
          descripcion: null,
          imagen: libro.imagen,
          enlace: null,
          source: 'google' // default, since we don't have source info here
        });
      }

      // Refresh data after state change
      await fetchData();
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
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'ver-mas-tarde':
        return <Eye className="w-5 h-5 text-sky-600" />;
      case 'pendiente':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'favorito':
        return <Heart className="w-5 h-5 text-rose-600" />;
      default:
        return null;
    }
  };

  const getPrimaryEstado = (estados: string[]) => {
    const priority = ['favorito', 'leido', 'ver-mas-tarde', 'pendiente'];
    for (const p of priority) {
      if (estados.includes(p)) return p;
    }
    return estados[0] || 'pendiente';
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'leido':
        return 'bg-slate-200 text-slate-800';
      case 'ver-mas-tarde':
        return 'bg-slate-300 text-slate-900';
      case 'pendiente':
        return 'bg-slate-400 text-slate-900';
      case 'favorito':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const librosFiltrados = filtroEstado === 'todos'
    ? librosFavoritos
    : librosFavoritos.filter(libro => libro.estados.includes(filtroEstado as 'leido' | 'ver-mas-tarde' | 'pendiente' | 'favorito'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-center text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 via-blue-600 to-indigo-700">
                  Mis Favoritos
                </span>
              </h2>
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
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg'
                : 'text-gray-600 hover:text-indigo-700 hover:bg-white/50'
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
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg'
                : 'text-gray-600 hover:text-indigo-700 hover:bg-white/50'
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
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg'
                : 'text-gray-600 hover:text-indigo-700 hover:bg-white/50'
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
                    ? 'bg-slate-600 text-white shadow-slate-600/25'
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
                    ? 'bg-green-600 text-white shadow-green-600/25'
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg border border-white/20'
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Leídos ({librosFavoritos.filter(l => l.estados.includes('leido')).length})</span>
              </motion.button>
              <motion.button
                onClick={() => setFiltroEstado('ver-mas-tarde')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 shadow-lg ${
                  filtroEstado === 'ver-mas-tarde'
                    ? 'bg-blue-600 text-white shadow-blue-600/25'
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg border border-white/20'
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Eye className="w-4 h-4" />
                <span>Ver más tarde ({librosFavoritos.filter(l => l.estados.includes('ver-mas-tarde')).length})</span>
              </motion.button>
              <motion.button
                onClick={() => setFiltroEstado('pendiente')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 shadow-lg ${
                  filtroEstado === 'pendiente'
                    ? 'bg-orange-600 text-white shadow-orange-600/25'
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg border border-white/20'
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Clock className="w-4 h-4" />
                <span>Pendientes ({librosFavoritos.filter(l => l.estados.includes('pendiente')).length})</span>
              </motion.button>
              <motion.button
                onClick={() => setFiltroEstado('favorito')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 shadow-lg ${
                  filtroEstado === 'favorito'
                    ? 'bg-red-600 text-white shadow-red-600/25'
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-lg border border-white/20'
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className="w-4 h-4" />
                <span>Favoritos ({librosFavoritos.filter(l => l.estados.includes('favorito')).length})</span>
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
                    {libro.estados.includes('favorito') && (
                      <motion.div
                        className="absolute top-4 right-4 bg-red-600 rounded-full p-1"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Heart className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" />
                      </motion.div>
                    )}
                  </div>
                  <div className="p-6">
                    <Link to={`/libro/${libro.id}`} className="block group">
                      <h3 className="font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300 text-lg leading-tight">
                        {libro.titulo}
                      </h3>
                    </Link>
                    {/* <p className="text-gray-600 text-sm mb-4 font-medium">por {libro.autor}</p>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center space-x-1">
                        {renderStars(libro.rating)}
                        <span className="text-sm font-semibold text-gray-700 ml-1">{libro.rating}</span>
                      </div>
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {libro.categoria}
                      </span>
                    </div> */}

                    {/* Estado Buttons */}
                    <div className="flex space-x-2">
                      <motion.button
                        onClick={() => cambiarEstadoLibro(libro.id, 'leido')}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-300 ${
                          libro.estados.includes('leido')
                            ? 'bg-indigo-900 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Leídos
                      </motion.button>
                      <motion.button
                        onClick={() => cambiarEstadoLibro(libro.id, 'ver-mas-tarde')}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-300 ${
                          libro.estados.includes('ver-mas-tarde')
                            ? 'bg-indigo-800 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Ver después
                      </motion.button>
                      <motion.button
                        onClick={() => cambiarEstadoLibro(libro.id, 'pendiente')}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-300 ${
                          libro.estados.includes('pendiente')
                            ? 'bg-indigo-700 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md'
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
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {autoresFavoritos.length > 0 ? autoresFavoritos.map((autor) => (
              <motion.div
                key={autor.id}
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
                    src={autor.imagen}
                    alt={autor.nombre}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <motion.div
                    className="absolute top-4 right-4"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart className="w-7 h-7 text-red-500 drop-shadow-lg" fill="currentColor" />
                  </motion.div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2 text-lg leading-tight">
                        {autor.nombre}
                      </h3>
                      <p className="text-gray-600 text-sm font-medium">{autor.libros} libro{autor.libros !== 1 ? 's' : ''} en tu colección</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Agregado el {new Date(autor.fechaAgregado).toLocaleDateString('es-ES')}
                    </span>
                    <Link
                      to={`/autores`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Ver más
                    </Link>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full text-center py-12">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No tienes autores favoritos aún</h3>
                <p className="text-gray-500 mb-6">Agrega libros a tus listas para ver aquí a tus autores favoritos</p>
                <Link
                  to="/libros"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-2xl hover:shadow-lg transition-all duration-300"
                >
                  <Book className="w-5 h-5 mr-2" />
                  Explorar libros
                </Link>
              </div>
            )}
          </motion.div>
        )}

        {/* Categorías Tab */}
        {activeTab === 'categorias' && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {categoriasFavoritas.length > 0 ? categoriasFavoritas.map((categoria) => (
              <motion.div
                key={categoria.id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/20"
                variants={cardVariants}
                whileHover={{
                  scale: 1.03,
                  y: -8,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`h-32 ${categoria.color} flex items-center justify-center relative`}>
                  <Tag className="w-12 h-12 text-white" />
                  <motion.div
                    className="absolute top-3 right-3"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart className="w-6 h-6 text-white fill-current drop-shadow-lg" />
                  </motion.div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-2 text-lg leading-tight">{categoria.nombre}</h3>
                  <p className="text-gray-600 text-sm mb-4 font-medium">{categoria.librosCount} libro{categoria.librosCount !== 1 ? 's' : ''} en tu colección</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Agregado el {new Date(categoria.fechaAgregado).toLocaleDateString('es-ES')}
                    </span>
                    <Link
                      to={`/categorias`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Ver más
                    </Link>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full text-center py-12">
                <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No tienes categorías favoritas aún</h3>
                <p className="text-gray-500 mb-6">Agrega libros a tus listas para ver aquí tus categorías favoritas</p>
                <Link
                  to="/libros"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-2xl hover:shadow-lg transition-all duration-300"
                >
                  <Book className="w-5 h-5 mr-2" />
                  Explorar libros
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};