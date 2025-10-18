
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Check, X, Search, Plus, Globe } from "lucide-react";
import { isAdmin } from "../utils/jwtUtils";
import { createSaga } from "../services/sagaService";
import { getLibros } from "../services/libroService";
import axios from "axios";
import LibroCard from "../componentes/LibroCard";
import { SearchBar } from "../componentes/SearchBar";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface Libro {
  id: number;
  titulo: string;
  autores: string[];
  descripcion?: string;
  imagen: string | null;
  enlace: string | null;
  averageRating?: number;
}

interface GoogleBook {
  id: string;
  titulo: string;
  autores: string[];
  descripcion: string | null;
  imagen: string | null;
  enlace: string | null;
}

const CrearSagaAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [libros, setLibros] = useState<Libro[]>([]);
  const [googleBooks, setGoogleBooks] = useState<GoogleBook[]>([]);
  const [selectedLibros, setSelectedLibros] = useState<Set<number>>(new Set());
  const [selectedGoogleBooks, setSelectedGoogleBooks] = useState<Set<string>>(new Set());
  const [sagaName, setSagaName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchSource, setSearchSource] = useState<'local' | 'google'>('local');
  const [filteredLibros, setFilteredLibros] = useState<Libro[]>([]);
  const [filteredGoogleBooks, setFilteredGoogleBooks] = useState<GoogleBook[]>([]);

  // Check admin authorization
  useEffect(() => {
    if (!isAdmin()) {
      setIsAuthorized(false);
      navigate("/");
      return;
    }
    setIsAuthorized(true);
  }, [navigate]);

  // Load libros
  useEffect(() => {
    const fetchLibros = async () => {
      try {
        const data = await getLibros();
        setLibros(data);
        setFilteredLibros(data);
      } catch (err) {
        setError("Error al cargar los libros");
      }
    };

    if (isAuthorized) {
      fetchLibros();
    }
  }, [isAuthorized]);

  // Filter libros based on search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredLibros(libros);
      setFilteredGoogleBooks([]);
    } else {
      if (searchSource === 'local') {
        const filtered = libros.filter(
          (libro) =>
            (libro.titulo?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (libro.autores || []).some((autor) =>
              (autor?.toLowerCase() || "").includes(searchTerm.toLowerCase())
            )
        );
        setFilteredLibros(filtered);
        setFilteredGoogleBooks([]);
      } else {
        // Search Google Books
        const fetchGoogleBooks = async () => {
          try {
            const response = await axios.get(`http://localhost:3000/api/google-books/buscar?q=${encodeURIComponent(searchTerm)}`);
            const results = response.data;
            setGoogleBooks(results);
            setFilteredGoogleBooks(results);
            setFilteredLibros([]);
          } catch (err) {
            console.error('Error searching Google Books:', err);
            setFilteredGoogleBooks([]);
            setFilteredLibros([]);
          }
        };
        fetchGoogleBooks();
      }
    }
  }, [searchTerm, libros, searchSource]);

  const handleLibroSelect = (libroId: number) => {
    const newSelected = new Set(selectedLibros);
    if (newSelected.has(libroId)) {
      newSelected.delete(libroId);
    } else {
      newSelected.add(libroId);
    }
    setSelectedLibros(newSelected);
  };

  const handleCreateSaga = async () => {
    if (!sagaName.trim()) {
      setError("El nombre de la saga es requerido");
      return;
    }

    if (selectedLibros.size === 0 && selectedGoogleBooks.size === 0) {
      setError("Debe seleccionar al menos un libro");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No se encontró el token de autenticación");
      }

      // Add Google Books to local library first
      const allLibroIds = new Set(selectedLibros);
      for (const googleBookId of selectedGoogleBooks) {
        try {
          const response = await axios.post(`http://localhost:3000/api/google-books/add`, {
            googleBookId
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const addedBook = response.data;
          allLibroIds.add(addedBook.id);
        } catch (err: any) {
          console.error(`Error adding Google Book ${googleBookId}:`, err);
          // Continue with other books if one fails
        }
      }

      if (allLibroIds.size === 0) {
        throw new Error("No se pudieron agregar los libros seleccionados");
      }

      await createSaga(
        {
          nombre: sagaName.trim(),
          libroIds: Array.from(allLibroIds),
        },
        token
      );

      setSuccess("¡Saga creada exitosamente!");
      setSagaName("");
      setSelectedLibros(new Set());
      setSelectedGoogleBooks(new Set());

      // Redirect to sagas page after success
      setTimeout(() => {
        navigate("/sagas");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Error al crear la saga");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthorized === null) {
    return (
      <div className="flex justify-center items-center py-12">
        <DotLottieReact
          src="https://lottie.host/6d727e71-5a1d-461e-9434-c9e7eb1ae1d1/IWVmdeMHnT.lottie"
          loop
          autoplay
          style={{ width: 140, height: 140 }}
        />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">Solo los administradores pueden crear sagas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 via-blue-600 to-indigo-700">
              Crear Nueva Saga
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Selecciona libros para agruparlos en una nueva saga
          </p>
        </motion.div>

        {/* Saga Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Saga
              </label>
              <input
                type="text"
                value={sagaName}
                onChange={(e) => setSagaName(e.target.value)}
                placeholder="Ej: Harry Potter, El Señor de los Anillos..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <button
              onClick={handleCreateSaga}
              disabled={loading || !sagaName.trim() || (selectedLibros.size === 0 && selectedGoogleBooks.size === 0)}
              className={`px-8 py-3 rounded-xl font-semibold text-white flex items-center gap-2 transition-all duration-300 ${
                loading || !sagaName.trim() || (selectedLibros.size === 0 && selectedGoogleBooks.size === 0)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 hover:shadow-lg transform hover:scale-105"
              }`}
            >
              {loading ? (
                <>
                  <DotLottieReact
                    src="https://lottie.host/6d727e71-5a1d-461e-9434-c9e7eb1ae1d1/IWVmdeMHnT.lottie"
                    loop
                    autoplay
                    style={{ width: 20, height: 20 }}
                  />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Crear Saga
                </>
              )}
            </button>
          </div>

          {/* Selected Books Count */}
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <BookOpen className="w-4 h-4" />
            <span>{selectedLibros.size + selectedGoogleBooks.size} libro{(selectedLibros.size + selectedGoogleBooks.size) !== 1 ? "s" : ""} seleccionado{(selectedLibros.size + selectedGoogleBooks.size) !== 1 ? "s" : ""}</span>
          </div>
        </motion.div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3"
          >
            <X className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3"
          >
            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-green-700">{success}</p>
          </motion.div>
        )}

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="max-w-2xl mx-auto">
            <SearchBar
              placeholder="Buscar libros por título, autor o saga..."
              onSearch={(query) => setSearchTerm(query)}
              database={[
                ...libros.map(libro => ({
                  id: libro.id.toString(),
                  title: libro.titulo,
                  type: 'book' as const,
                  author: libro.autores?.join(', ') || 'Autor desconocido',
                  image: libro.imagen || undefined
                })),
                ...googleBooks.map(book => ({
                  id: book.id,
                  title: book.titulo,
                  type: 'book' as const,
                  author: book.autores?.join(', ') || 'Autor desconocido',
                  image: book.imagen || undefined
                }))
              ]}
              className="mb-4"
              disableSuggestions={true}
            />
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setSearchSource('local')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  searchSource === 'local'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <BookOpen className="w-4 h-4 inline mr-2" />
                Biblioteca Local
              </button>
              <button
                onClick={() => setSearchSource('google')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  searchSource === 'google'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Globe className="w-4 h-4 inline mr-2" />
                Google Books
              </button>
            </div>
          </div>
        </motion.div>

        {/* Books Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredLibros.map((libro) => (
            <motion.div
              key={libro.id}
              className={`relative cursor-pointer transition-all duration-300 ${
                selectedLibros.has(libro.id)
                  ? "ring-2 ring-cyan-500 ring-offset-2 scale-105"
                  : "hover:scale-105"
              }`}
              onClick={() => handleLibroSelect(libro.id)}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <LibroCard
                title={libro.titulo}
                authors={libro.autores}
                image={libro.imagen}
                description={libro.descripcion}
                rating={libro.averageRating}
              />

              {/* Selection Indicator */}
              {selectedLibros.has(libro.id) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 bg-cyan-500 text-white rounded-full p-1"
                >
                  <Check className="w-4 h-4" />
                </motion.div>
              )}
            </motion.div>
          ))}

          {filteredGoogleBooks.map((book) => (
            <motion.div
              key={book.id}
              className={`relative cursor-pointer transition-all duration-300 ${
                selectedGoogleBooks.has(book.id)
                  ? "ring-2 ring-green-500 ring-offset-2 scale-105"
                  : "hover:scale-105"
              }`}
              onClick={() => {
                const newSelected = new Set(selectedGoogleBooks);
                if (newSelected.has(book.id)) {
                  newSelected.delete(book.id);
                } else {
                  newSelected.add(book.id);
                }
                setSelectedGoogleBooks(newSelected);
              }}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <LibroCard
                title={book.titulo}
                authors={book.autores}
                image={book.imagen}
                description={book.descripcion || undefined}
                rating={null}
              />

              {/* Google Books Indicator */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1"
              >
                <Globe className="w-3 h-3" />
              </motion.div>

              {/* Selection Indicator */}
              {selectedGoogleBooks.has(book.id) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1"
                >
                  <Check className="w-4 h-4" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {filteredLibros.length === 0 && filteredGoogleBooks.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No se encontraron libros que coincidan con tu búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrearSagaAdmin;
