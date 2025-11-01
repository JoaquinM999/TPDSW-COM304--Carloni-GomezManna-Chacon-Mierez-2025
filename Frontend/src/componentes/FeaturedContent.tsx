"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Heart, Star, Filter, ThumbsUp, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getFeaturedBooks, GoogleBooksVolume } from "../services/googleBooksService";
import { CardSkeleton } from "./SkeletonLoader";

// Categorías disponibles para filtrar con queries mejoradas
const CATEGORIES = [
  { id: 'all', label: 'Todos', query: 'bestseller' },
  { id: 'fiction', label: 'Ficción', query: 'fiction+bestseller' },
  { id: 'fantasy', label: 'Fantasía', query: 'fantasy+novel' },
  { id: 'mystery', label: 'Misterio', query: 'mystery+thriller+detective' },
  { id: 'romance', label: 'Romance', query: 'romance+love+story' },
  { id: 'science', label: 'Ciencia', query: 'science+nonfiction' },
  { id: 'history', label: 'Historia', query: 'history+nonfiction' },
  { id: 'biography', label: 'Biografía', query: 'biography+memoir' },
] as const;

interface ContentItem {
  id: string;
  title: string;
  author: string;
  image: string;
  category?: string;
  trending?: boolean;
  description?: string;
  rating?: number;
  votes?: number; // Nuevo: contador de votos
}

// Función para convertir GoogleBooksVolume a ContentItem
const convertGoogleBookToContentItem = (book: GoogleBooksVolume): ContentItem => {
  const volumeInfo = book.volumeInfo;
  // Obtener la imagen de mayor calidad disponible
  let imageUrl = 'https://via.placeholder.com/400x600?text=No+Image';
  if (volumeInfo.imageLinks) {
    // Forzar mejor calidad de imagen cambiando parámetros de Google Books
    imageUrl = volumeInfo.imageLinks.thumbnail
      ?.replace('http:', 'https:')
      .replace('&zoom=1', '&zoom=3') // Aumentar zoom para mejor calidad
      .replace('&edge=curl', '') // Quitar efecto de página curvada
      || volumeInfo.imageLinks.smallThumbnail
        ?.replace('http:', 'https:')
        .replace('&zoom=1', '&zoom=3')
      || imageUrl;
  }
  
  return {
    id: book.id,
    title: volumeInfo.title,
    author: volumeInfo.authors?.[0] || 'Autor desconocido',
    image: imageUrl,
    category: volumeInfo.categories?.[0] || undefined,
    trending: (volumeInfo.averageRating || 0) >= 4,
    description: volumeInfo.description || 'Descripción no disponible.',
    rating: volumeInfo.averageRating || undefined,
  };
};

const featuredBooksMock: ContentItem[] = [
  {
    id: "1",
    title: "El Hombre en Busca de Sentido",
    author: "Viktor Frankl",
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&h=900&fit=crop&auto=format",
    category: "Psicología",
    trending: true,
    description: "Un psiquiatra en un campo de concentración descubre que la búsqueda de sentido es la fuerza primaria en el ser humano. Una obra maestra sobre la resiliencia y la esperanza.",
    rating: 4.8,
  },
  {
    id: "2",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=900&fit=crop&auto=format",
    category: "Historia",
    description: "De animales a dioses: Una breve historia de la humanidad. Harari examina cómo el Homo sapiens llegó a dominar el mundo y qué nos depara el futuro.",
    rating: 4.6,
  },
  {
    id: "3",
    title: "Atomic Habits",
    author: "James Clear",
    image: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=600&h=900&fit=crop&auto=format",
    category: "Autoayuda",
    trending: true,
    description: "Pequeños cambios, resultados extraordinarios. Un método probado para crear buenos hábitos y eliminar los malos, con estrategias prácticas y científicas.",
    rating: 4.7,
  },
  {
    id: "4",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=900&fit=crop&auto=format",
    category: "Thriller",
    description: "Alicia Berenson dispara a su esposo y luego no vuelve a hablar. Un psicoterapeuta está obsesionado con descubrir por qué. Un thriller psicológico adictivo.",
    rating: 4.5,
  },
];

// Variantes con transición suave
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 400 : -400,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring" as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.3 },
      scale: { duration: 0.3 }
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 400 : -400,
    opacity: 0,
    scale: 0.98,
    transition: {
      x: { type: "spring" as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.25 },
      scale: { duration: 0.25 }
    }
  }),
};

export const FeaturedContent: React.FC = () => {
  const navigate = useNavigate();
  const [[page, direction], setPage] = useState([0, 0]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [featuredBooks, setFeaturedBooks] = useState<ContentItem[]>(featuredBooksMock);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [userVotes, setUserVotes] = useState<Map<string, number>>(new Map()); // -1, 0, 1
  const [bookVotes, setBookVotes] = useState<Map<string, number>>(new Map()); // Contador total
  const featuredCount = featuredBooks.length;
  const index = ((page % featuredCount) + featuredCount) % featuredCount;
  const AUTO_PLAY_INTERVAL = 5000; // 5 segundos

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const handleCardClick = (bookId: string) => {
    // Navegar al detalle del libro con el ID de Google Books
    // El ID de Google Books funciona directamente con la página de detalle
    navigate(`/libro/${bookId}`);
  };

  const toggleFavorite = (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation(); // Evitar que se active el click de la card
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

  const handleVote = (e: React.MouseEvent, bookId: string, voteValue: 1 | -1) => {
    e.stopPropagation(); // Evitar que se active el click de la card
    
    setUserVotes(prev => {
      const newVotes = new Map(prev);
      const currentVote = newVotes.get(bookId) || 0;
      
      // Si el usuario ya votó lo mismo, remover el voto
      if (currentVote === voteValue) {
        newVotes.set(bookId, 0);
        setBookVotes(prevBookVotes => {
          const newBookVotes = new Map(prevBookVotes);
          const currentCount = newBookVotes.get(bookId) || 0;
          newBookVotes.set(bookId, currentCount - voteValue);
          return newBookVotes;
        });
      } else {
        // Cambiar o establecer nuevo voto
        newVotes.set(bookId, voteValue);
        setBookVotes(prevBookVotes => {
          const newBookVotes = new Map(prevBookVotes);
          const currentCount = newBookVotes.get(bookId) || 0;
          // Restar voto anterior (si existía) y sumar nuevo
          newBookVotes.set(bookId, currentCount - currentVote + voteValue);
          return newBookVotes;
        });
      }
      
      return newVotes;
    });
  };

  // Cargar libros de Google Books API
  useEffect(() => {
    const loadFeaturedBooks = async () => {
      setIsLoading(true);
      setPage([0, 0]); // Reset carousel cuando cambie la categoría
      try {
        const category = CATEGORIES.find(cat => cat.id === selectedCategory);
        const query = category?.query || 'bestseller';
        
        console.log(`Loading books for category: ${selectedCategory}, query: ${query}`);
        
        const googleBooks = await getFeaturedBooks(10, query);
        
        if (googleBooks.length > 0) {
          const convertedBooks = googleBooks.map(convertGoogleBookToContentItem).slice(0, 5);
          setFeaturedBooks(convertedBooks);
          console.log(`Loaded ${convertedBooks.length} books for ${selectedCategory}`);
        } else {
          console.warn(`No books found for category ${selectedCategory}, keeping previous books`);
          // Si no hay libros, mantener los actuales o cargar genéricos
          if (featuredBooks.length === 0) {
            const fallbackBooks = await getFeaturedBooks(10, 'bestseller');
            if (fallbackBooks.length > 0) {
              const convertedBooks = fallbackBooks.map(convertGoogleBookToContentItem).slice(0, 5);
              setFeaturedBooks(convertedBooks);
            }
          }
        }
      } catch (error) {
        console.error('Error loading featured books:', error);
        // Mantener los libros mock si falla la API
        if (featuredBooks.length === 0) {
          setFeaturedBooks(featuredBooksMock);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedBooks();
  }, [selectedCategory]);

  // Ordenar libros por votos cuando cambien
  useEffect(() => {
    if (featuredBooks.length > 0) {
      const sortedBooks = [...featuredBooks].sort((a, b) => {
        const votesA = bookVotes.get(a.id) || 0;
        const votesB = bookVotes.get(b.id) || 0;
        return votesB - votesA; // Orden descendente
      });
      
      // Solo actualizar si el orden realmente cambió
      const orderChanged = sortedBooks.some((book, index) => book.id !== featuredBooks[index].id);
      if (orderChanged) {
        setFeaturedBooks(sortedBooks);
        setPage([0, 0]); // Reset carousel
      }
    }
  }, [bookVotes]); // Se ejecuta cuando cambien los votos

  // Cargar contadores de categorías de forma más eficiente
  useEffect(() => {
    const loadCategoryCounts = async () => {
      const counts: Record<string, number> = {};
      
      // Cargar en paralelo para mayor velocidad
      const countPromises = CATEGORIES.map(async (category) => {
        if (category.id === 'all') {
          return { id: 'all', count: 200 }; // Estimación total
        }
        
        try {
          const books = await getFeaturedBooks(5, category.query);
          // Si encontramos libros, estimamos que hay más disponibles
          return { 
            id: category.id, 
            count: books.length > 0 ? Math.min(books.length * 8, 40) : 0 
          };
        } catch (error) {
          console.error(`Error loading count for ${category.id}:`, error);
          return { id: category.id, count: 0 };
        }
      });
      
      const results = await Promise.all(countPromises);
      results.forEach(({ id, count }) => {
        counts[id] = count;
      });
      
      setCategoryCounts(counts);
    };

    loadCategoryCounts();
  }, []);

  // Navegación por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        paginate(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        paginate(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [page]);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || isHovered) {
      return;
    }

    const slideInterval = setInterval(() => {
      paginate(1);
    }, AUTO_PLAY_INTERVAL);

    return () => {
      clearInterval(slideInterval);
    };
  }, [isAutoPlaying, isHovered, page]);

  const book = featuredBooks[index];

  // Mostrar skeleton mientras carga
  if (isLoading) {
    return (
      <section 
        className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-gray-100"
        aria-label="Libros destacados"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
            <div className="animate-pulse space-y-2">
              <div className="h-10 bg-gray-200 rounded w-96"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
          </div>
          <div className="relative max-w-md mx-auto">
            <CardSkeleton />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300"
      aria-label="Libros destacados"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado Tendencias */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 gap-3 sm:gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-sans font-extrabold text-gray-900 dark:text-white transition-colors duration-300">
              Historias que están marcando el momento
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base transition-colors duration-300">
              Selección creada por la comunidad según las lecturas más comentadas.
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300"
          >
            Explorar más <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </motion.button>
        </div>

        {/* Filtros de Categoría */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Filtrar por género</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category, idx) => {
              const isActive = selectedCategory === category.id;
              const count = categoryCounts[category.id];
              
              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    relative px-4 py-2.5 rounded-xl font-medium text-sm
                    transition-all duration-300 border-2
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-500/30' 
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    {category.label}
                    {count !== undefined && (
                      <span className={`
                        px-2 py-0.5 rounded-full text-xs font-bold
                        ${isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-100 text-gray-600'
                        }
                      `}>
                        {count}
                      </span>
                    )}
                  </span>
                  
                  {/* Indicador activo */}
                  {isActive && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 border-2 border-blue-400 rounded-xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Carrusel Libros Destacados */}
        <div className="relative max-w-md mx-auto px-2 sm:px-0">
          <div
            className="relative h-[500px] sm:h-[480px] overflow-hidden mb-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <AnimatePresence initial={false} custom={direction}>
              <motion.article
                key={book.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                onClick={() => handleCardClick(book.id)}
                className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl dark:shadow-gray-900/50 overflow-hidden flex flex-col sm:flex-row transition-all duration-300 cursor-pointer border border-transparent dark:border-gray-700"
                whileHover={{ scale: 1.02 }}
                style={{ willChange: "transform" }}
              >
                                {/* Contenedor de portada con efecto 3D - Lado izquierdo */}
                <div className="relative flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 w-full sm:w-2/5 p-4 sm:p-6 flex items-center justify-center transition-colors duration-300">
                  {/* Portada del libro con efecto 3D */}
                  <div className="relative w-full max-w-[200px] sm:max-w-none group">
                    {/* Sombra y efecto de profundidad */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/40 via-gray-800/30 to-gray-900/40 dark:from-black/60 dark:via-gray-900/50 dark:to-black/60 rounded-lg transform translate-x-2 translate-y-2 blur-xl group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-300"></div>
                    
                    {/* Marco de la portada */}
                    <div className="relative bg-white p-1 rounded-lg shadow-2xl group-hover:shadow-3xl transition-shadow duration-300">
                      {/* Borde interior decorativo */}
                      <div className="relative border-2 border-gray-200 rounded-md overflow-hidden">
                        {/* Gradiente overlay para mejor contraste con badges */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none z-10"></div>
                        
                        {/* Imagen de la portada */}
                        <motion.img
                          src={book.image}
                          alt={book.title}
                          className="w-full h-[280px] sm:h-[400px] object-cover"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      
                      {/* Efecto de brillo en el borde */}
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                  
                  {/* Botón de favoritos */}
                  <motion.button
                    onClick={(e) => toggleFavorite(e, book.id)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-3 left-3 p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-xl hover:bg-white hover:shadow-2xl transition-all z-20 border border-gray-200"
                    aria-label={favorites.has(book.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  >
                    <Heart 
                      className={`w-5 h-5 transition-colors ${
                        favorites.has(book.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-gray-600'
                      }`}
                    />
                  </motion.button>
                  
                  {/* Badge de trending */}
                  {book.trending && (
                    <motion.span 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-xl backdrop-blur-sm z-20 border border-amber-300/50 flex items-center gap-1"
                    >
                      <span className="animate-pulse">⭐</span>
                    </motion.span>
                  )}
                  
                  {/* Badge de categoría */}
                  {book.category && (
                    <span className="absolute bottom-3 right-3 bg-gray-900/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-xl z-20 border border-white/10">
                      {book.category}
                    </span>
                  )}
                </div>
                
                {/* Sección de información del libro - Lado derecho */}
                <div className="relative p-5 sm:p-6 flex-grow flex flex-col overflow-hidden sm:w-3/5">
                  {/* Imagen de fondo difuminada */}
                  <div 
                    className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03] pointer-events-none"
                    style={{
                      backgroundImage: `url(${book.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'blur(40px) saturate(1.5)',
                      transform: 'scale(1.2)'
                    }}
                  ></div>
                  
                  {/* Gradiente overlay para mejor legibilidad */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/98 via-white/96 to-gray-50/95 dark:from-gray-800/98 dark:via-gray-800/96 dark:to-gray-900/95 pointer-events-none transition-colors duration-300"></div>
                  
                  {/* Contenido con z-index superior */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Título y autor con mejor diseño y contraste */}
                    <div className="mb-3 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-600 transition-colors duration-300">
                      <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight tracking-tight drop-shadow-sm line-clamp-2 transition-colors duration-300">
                        {book.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="h-0.5 flex-grow bg-gradient-to-r from-blue-600/60 dark:from-blue-400/60 to-transparent rounded-full"></div>
                        <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-300">
                          por <span className="text-blue-700 dark:text-blue-400 font-bold">{book.author}</span>
                        </p>
                        <div className="h-0.5 flex-grow bg-gradient-to-l from-blue-600/60 dark:from-blue-400/60 to-transparent rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Rating con diseño mejorado y compacto */}
                    {book.rating && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 mb-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 px-3 py-2 rounded-lg border border-amber-200/50 dark:border-amber-700/50 shadow-sm transition-colors duration-300"
                      >
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <motion.svg
                              key={i}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${
                                i < Math.floor(book.rating!)
                                  ? 'text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400 drop-shadow-sm'
                                  : 'text-gray-300 dark:text-gray-600 fill-gray-300 dark:fill-gray-600'
                              }`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </motion.svg>
                          ))}
                        </div>
                        <span className="text-base sm:text-lg font-bold text-amber-700 dark:text-amber-400 drop-shadow-sm transition-colors duration-300">{book.rating}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium transition-colors duration-300">/ 5.0</span>
                      </motion.div>
                    )}
                    
                    {/* Sistema de Votación */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 mb-3 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm transition-colors duration-300"
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 transition-colors duration-300">Popularidad</span>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-auto">
                        {/* Upvote Button */}
                        <motion.button
                          onClick={(e) => handleVote(e, book.id, 1)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`
                            p-2 rounded-lg transition-all duration-300
                            ${(userVotes.get(book.id) || 0) === 1
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 shadow-md'
                              : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400'
                            }
                          `}
                          aria-label="Votar positivo"
                        >
                          <ThumbsUp className={`
                            w-4 h-4 transition-all
                            ${(userVotes.get(book.id) || 0) === 1 ? 'fill-current' : ''}
                          `} />
                        </motion.button>
                        
                        {/* Vote Counter */}
                        <motion.span
                          key={bookVotes.get(book.id) || 0}
                          initial={{ scale: 1.3, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="min-w-[40px] text-center font-bold text-sm text-gray-800 dark:text-gray-200 transition-colors duration-300"
                        >
                          {(bookVotes.get(book.id) || 0) > 0 ? '+' : ''}{bookVotes.get(book.id) || 0}
                        </motion.span>
                        
                        {/* Downvote Button */}
                        <motion.button
                          onClick={(e) => handleVote(e, book.id, -1)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`
                            p-2 rounded-lg transition-all duration-300
                            ${(userVotes.get(book.id) || 0) === -1
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 shadow-md'
                              : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
                            }
                          `}
                          aria-label="Votar negativo"
                        >
                          <ThumbsUp className={`
                            w-4 h-4 rotate-180 transition-all
                            ${(userVotes.get(book.id) || 0) === -1 ? 'fill-current' : ''}
                          `} />
                        </motion.button>
                      </div>
                    </motion.div>
                    
                    {/* Descripción con mejor diseño */}
                    <div className="flex-1 overflow-hidden">
                      <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 dark:from-blue-900/20 dark:via-indigo-900/10 dark:to-purple-900/10 rounded-lg p-3 sm:p-4 border border-blue-200/40 dark:border-blue-700/40 shadow-inner h-full flex flex-col transition-colors duration-300">
                        {/* Icono decorativo */}
                        <div className="absolute top-2 left-2 text-blue-300/30 dark:text-blue-600/30 text-3xl font-serif leading-none transition-colors duration-300">"</div>
                        
                        <p className="relative text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed pl-5 sm:pl-6 italic flex-1 overflow-y-auto transition-colors duration-300">
                          {book.description || "Una lectura que transforma y abre nuevos horizontes."}
                        </p>
                        
                        {/* Barra decorativa inferior */}
                        <div className="mt-2 flex gap-1 flex-shrink-0">
                          <div className="h-0.5 w-10 bg-gradient-to-r from-blue-500 dark:from-blue-400 to-indigo-500 dark:to-indigo-400 rounded-full"></div>
                          <div className="h-0.5 w-6 bg-gradient-to-r from-indigo-500 dark:from-indigo-400 to-purple-500 dark:to-purple-400 rounded-full"></div>
                          <div className="h-0.5 w-3 bg-gradient-to-r from-purple-500 dark:from-purple-400 to-pink-500 dark:to-pink-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>

          {/* Flechas */}
          <motion.button
            onClick={() => paginate(-1)}
            aria-label="Anterior"
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.95 }}
            className="absolute left-2 sm:left-0 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 z-20 border border-gray-200 dark:border-gray-600 touch-manipulation"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300 transition-colors duration-300" />
          </motion.button>
          <motion.button
            onClick={() => paginate(1)}
            aria-label="Siguiente"
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-2 sm:right-0 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 z-20 border border-gray-200 dark:border-gray-600 touch-manipulation"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300 transition-colors duration-300" />
          </motion.button>

          {/* Indicadores de paginación con miniaturas */}
          <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mt-6 sm:mt-8 px-2 sm:px-4 overflow-x-auto pb-2 scrollbar-hide">
            {featuredBooks.map((book, idx) => (
              <motion.button
                key={idx}
                onClick={() => setPage([idx, idx > index ? 1 : -1])}
                aria-label={`Ver ${book.title}`}
                whileHover={{ scale: 1.1, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className={`relative flex-shrink-0 transition-all duration-300 rounded-md sm:rounded-lg overflow-hidden group touch-manipulation ${
                  idx === index
                    ? 'ring-3 sm:ring-4 ring-blue-500 dark:ring-blue-400 shadow-xl'
                    : 'ring-2 ring-gray-200 dark:ring-gray-600 hover:ring-gray-400 dark:hover:ring-gray-500 shadow-md hover:shadow-lg'
                }`}
              >
                {/* Miniatura de la portada */}
                <div className="relative w-12 h-18 sm:w-16 sm:h-24 md:w-20 md:h-28">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay oscuro cuando no está activo */}
                  <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                    idx === index
                      ? 'opacity-0'
                      : 'opacity-40 group-hover:opacity-20'
                  }`}></div>
                  
                  {/* Indicador de activo */}
                  {idx === index && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 border-2 border-white/50 rounded-lg pointer-events-none"
                    >
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Tooltip con título */}
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-30 shadow-xl">
                    {book.title.length > 25 ? book.title.substring(0, 25) + '...' : book.title}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
