import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  BookOpen, 
  MessageCircle,
  UserCircle,
  ChevronDown,
  ChevronUp,
  Award,
  TrendingUp,
  Star
} from 'lucide-react';

interface AutorDetalle {
  id: number;
  nombre: string;
  apellido: string;
  foto?: string;
  biografia?: string; // Nueva: biografía de APIs externas
  googleBooksId?: string; // Nueva: ID de Google Books
  openLibraryKey?: string; // Nueva: Key de OpenLibrary
  createdAt: string;
  updatedAt?: string;
}

interface LibroPopular {
  id: number;
  nombre: string;
  imagen?: string;
  totalResenas: number;
}

interface EstadisticasAutor {
  autorId: number;
  nombreCompleto: string;
  estadisticas: {
    totalLibros: number;
    totalResenas: number;
    promedioCalificacion: number;
    librosMasPopulares: LibroPopular[];
  };
}

interface Libro {
  id: number;
  nombre: string;
  imagen?: string;
  descripcion?: string;
  isbn?: string;
  idioma?: string;
  fecha_publicacion?: string;
}

const DetalleAutor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [autor, setAutor] = useState<AutorDetalle | null>(null);
  const [estadisticas, setEstadisticas] = useState<EstadisticasAutor | null>(null);
  const [libros, setLibros] = useState<Libro[]>([]);
  const [biografia, setBiografia] = useState<string>('');
  const [bioExpanded, setBioExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingBio, setLoadingBio] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchAutorData();
    }
  }, [id]);

  const fetchAutorData = async () => {
    try {
      setLoading(true);
      
      // Fetch autor básico
      const autorRes = await fetch(`http://localhost:3000/api/autor/${id}`);
      if (!autorRes.ok) throw new Error('Autor no encontrado');
      const autorData = await autorRes.json();
      setAutor(autorData);

      // Si el autor tiene biografía de las APIs, usarla directamente
      if (autorData.biografia) {
        setBiografia(autorData.biografia);
        setLoadingBio(false);
      } else {
        // Fetch biografía de Wikipedia como fallback
        fetchBiografia(`${autorData.nombre} ${autorData.apellido}`);
      }

      // Fetch estadísticas
      const statsRes = await fetch(`http://localhost:3000/api/autor/${id}/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setEstadisticas(statsData);
      }

      // Fetch libros del autor
      const librosRes = await fetch(`http://localhost:3000/api/libro?autor=${id}`);
      if (librosRes.ok) {
        const librosData = await librosRes.json();
        setLibros(librosData.libros || librosData);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar autor');
      setLoading(false);
    }
  };

  const fetchBiografia = async (nombreCompleto: string) => {
    try {
      setLoadingBio(true);
      
      // Verificar cache (24h)
      const cacheKey = `bio_${id}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { bio, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        if (age < 24 * 60 * 60 * 1000) { // 24 horas
          setBiografia(bio);
          setLoadingBio(false);
          return;
        }
      }

      // Llamar a Wikipedia API
      const response = await fetch(
        `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(nombreCompleto)}`
      );

      if (response.ok) {
        const data = await response.json();
        const bio = data.extract || 'No se encontró biografía disponible.';
        setBiografia(bio);
        
        // Guardar en cache
        localStorage.setItem(cacheKey, JSON.stringify({
          bio,
          timestamp: Date.now()
        }));
      } else {
        setBiografia('No se encontró biografía disponible en Wikipedia.');
      }
    } catch (err) {
      console.error('Error fetching biografía:', err);
      setBiografia('No se pudo cargar la biografía.');
    } finally {
      setLoadingBio(false);
    }
  };

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  const getAvatarUrl = (nombre: string, apellido: string) => {
    const initials = getInitials(nombre, apellido);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre + ' ' + apellido)}&size=256&background=9333ea&color=fff&bold=true&format=png`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 font-medium">Cargando información del autor...</p>
        </div>
      </div>
    );
  }

  if (error || !autor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Autor no encontrado</h2>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-6">{error || 'No pudimos encontrar este autor en la base de datos.'}</p>
          <button
            onClick={() => navigate('/autores')}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            Volver a Autores
          </button>
        </motion.div>
      </div>
    );
  }

  const nombreCompleto = `${autor.nombre} ${autor.apellido}`;
  const bioTruncated = biografia.length > 300;
  const displayBio = bioExpanded || !bioTruncated ? biografia : biografia.substring(0, 300) + '...';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header con botón volver */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/autores')}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-8 group transition-colors"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Volver a Autores</span>
        </motion.button>

        {/* Sección principal: Foto y Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden mb-8"
        >
          <div className="md:flex">
            {/* Foto del autor */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="md:w-1/3 bg-gradient-to-br from-purple-100 via-pink-100 to-purple-200 flex items-center justify-center p-12 relative overflow-hidden"
            >
              {/* Decorative circles */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-purple-200 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-pink-200 rounded-full translate-x-1/3 translate-y-1/3 opacity-50"></div>
              
              {autor.foto ? (
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src={autor.foto}
                  alt={nombreCompleto}
                  className="w-64 h-64 rounded-full object-cover shadow-2xl border-8 border-white relative z-10"
                />
              ) : (
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src={getAvatarUrl(autor.nombre, autor.apellido)}
                  alt={nombreCompleto}
                  className="w-64 h-64 rounded-full object-cover shadow-2xl border-8 border-white relative z-10"
                />
              )}
            </motion.div>

            {/* Información básica */}
            <div className="md:w-2/3 p-8 md:p-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                  {nombreCompleto}
                </h1>
              </motion.div>

              {/* Estadísticas */}
              {estadisticas && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                >
                  {/* Total Libros */}
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <BookOpen className="w-10 h-10 text-white" />
                      <span className="text-4xl font-bold text-white">
                        {estadisticas.estadisticas.totalLibros}
                      </span>
                    </div>
                    <p className="text-sm text-cyan-100 font-semibold">Total Libros</p>
                  </motion.div>

                  {/* Total Reseñas */}
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <MessageCircle className="w-10 h-10 text-white" />
                      <span className="text-4xl font-bold text-white">
                        {estadisticas.estadisticas.totalResenas}
                      </span>
                    </div>
                    <p className="text-sm text-purple-100 font-semibold">Reseñas Totales</p>
                  </motion.div>

                  {/* Promedio Calificación */}
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Star className="w-10 h-10 text-white" />
                      <span className="text-4xl font-bold text-white">
                        {estadisticas.estadisticas.promedioCalificacion > 0 
                          ? estadisticas.estadisticas.promedioCalificacion.toFixed(1)
                          : '—'}
                      </span>
                    </div>
                    <p className="text-sm text-amber-100 font-semibold">Calificación Promedio</p>
                  </motion.div>
                </motion.div>
              )}

              {/* Biografía */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200"
              >
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                  Biografía
                </h2>
                {loadingBio ? (
                  <div className="flex items-center gap-3 text-gray-500">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full"
                    />
                    <span>Cargando biografía desde Wikipedia...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">{displayBio}</p>
                    {bioTruncated && (
                      <button
                        onClick={() => setBioExpanded(!bioExpanded)}
                        className="mt-3 flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium transition-colors text-sm"
                      >
                        {bioExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Ver menos
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Ver más
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Libros más populares */}
        {estadisticas && estadisticas.estadisticas.librosMasPopulares.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <Award className="w-8 h-8 text-yellow-500" />
              <h2 className="text-3xl font-bold text-gray-800">Libros Más Populares</h2>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {estadisticas.estadisticas.librosMasPopulares.map((libro, index) => (
                <motion.div
                  key={libro.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.03 }}
                  className="group cursor-pointer relative"
                >
                  <Link to={`/libros/${libro.id}`}>
                    {/* Badge Popular */}
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">
                      #{index + 1} Popular
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all border-2 border-transparent group-hover:border-purple-300">
                      {libro.imagen ? (
                        <img
                          src={libro.imagen}
                          alt={libro.nombre}
                          className="w-full h-72 object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-72 flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                          <BookOpen className="w-20 h-20 text-purple-300" />
                        </div>
                      )}
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50">
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2 text-sm group-hover:text-purple-600 transition-colors">
                          {libro.nombre}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 bg-white rounded-full px-3 py-1 w-fit">
                          <MessageCircle className="w-3 h-3" />
                          <span className="font-semibold">{libro.totalResenas} reseñas</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Todos los libros del autor */}
        {libros.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="w-8 h-8 text-purple-600" />
              <h2 className="text-3xl font-bold text-gray-800">
                Todos los Libros 
                <span className="ml-2 text-purple-600">({libros.length})</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {libros.map((libro, index) => (
                <motion.div
                  key={libro.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.03 }}
                  whileHover={{ y: -8, scale: 1.05 }}
                  className="group cursor-pointer"
                >
                  <Link to={`/libros/${libro.id}`}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md group-hover:shadow-2xl transition-all border border-gray-100 group-hover:border-purple-300">
                      {libro.imagen ? (
                        <div className="relative overflow-hidden">
                          <img
                            src={libro.imagen}
                            alt={libro.nombre}
                            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      ) : (
                        <div className="w-full h-56 flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                          <BookOpen className="w-16 h-16 text-blue-300" />
                        </div>
                      )}
                      <div className="p-3">
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors min-h-[2.5rem]">
                          {libro.nombre}
                        </h3>
                        {libro.fecha_publicacion && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 font-medium bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1 w-fit">
                            {new Date(libro.fecha_publicacion).getFullYear()}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Sin libros */}
        {libros.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-16 text-center"
          >
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Sin libros registrados</h3>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 max-w-md mx-auto">
              Este autor aún no tiene libros registrados en la base de datos. 
              Los libros pueden ser agregados próximamente.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DetalleAutor;
