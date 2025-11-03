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

// Variantes con transición suave y rápida
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 200 : -200,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeIn"
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
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-bold text-gray-900 dark:text-white">Filtrar por género</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category.id;
              const count = categoryCounts[category.id];
              
              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    px-4 py-2 rounded-lg font-medium text-sm transition-all
                    ${isActive 
                      ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    {category.label}
                    {count !== undefined && (
                      <span className={`
                        px-2 py-0.5 rounded-full text-xs font-semibold
                        ${isActive 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }
                      `}>
                        {count}
                      </span>
                    )}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Carrusel Libros Destacados */}
        <div className="relative max-w-4xl mx-auto">
          <div
            className="relative h-[380px] overflow-hidden mb-4"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.article
                key={book.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                onClick={() => handleCardClick(book.id)}
                className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col sm:flex-row cursor-pointer border border-gray-200 dark:border-gray-700"
              >
                {/* Contenedor de portada - Lado izquierdo */}
                <div className="relative flex-shrink-0 bg-gray-50 dark:bg-gray-900 w-full sm:w-1/3 p-4 flex items-center justify-center">
                  {/* Portada del libro */}
                  <div className="relative w-full max-w-[160px]">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                  </div>
                  
                  {/* Botón de favoritos */}
                  <button
                    onClick={(e) => toggleFavorite(e, book.id)}
                    className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-md hover:shadow-lg transition-all z-10"
                    title={favorites.has(book.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  >
                    <Heart 
                      className={`w-4 h-4 ${
                        favorites.has(book.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    />
                  </button>
                  
                  {/* Badge de trending */}
                  {book.trending && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-md z-10 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" />
                      Trending
                    </span>
                  )}
                </div>
                
                {/* Sección de información del libro - Lado derecho */}
                <div className="relative p-5 flex-grow flex flex-col sm:w-2/3">
                  <div className="flex flex-col h-full space-y-3">
                    {/* Título y autor */}
                    <div>
                      {book.category && (
                        <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs font-semibold mb-2">
                          {book.category}
                        </span>
                      )}
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 leading-tight line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        por <span className="text-blue-600 dark:text-blue-400 font-semibold">{book.author}</span>
                      </p>
                    </div>
                    
                    {/* Rating */}
                    {book.rating && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(book.rating!)
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{book.rating}</span>
                      </div>
                    )}
                    
                    {/* Descripción */}
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
                        {book.description || "Una lectura fascinante que te atrapará desde la primera página."}
                      </p>
                    </div>
                    
                    {/* Sistema de Votación Compacto */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        {/* Título con info */}
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Vota por este libro</span>
                          <div className="group/info relative">
                            <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-help text-xs text-gray-600 dark:text-gray-400">
                              ?
                            </div>
                            <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-30">
                              Vota 👍 si te gusta o 👎 si no te interesa
                            </div>
                          </div>
                        </div>
                        
                        {/* Botones de votación */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleVote(e, book.id, 1)}
                            className={`p-2 rounded-lg transition-all ${
                              (userVotes.get(book.id) || 0) === 1
                                ? 'bg-green-500 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}
                            title="Me gusta"
                          >
                            <ThumbsUp className={`w-4 h-4 ${(userVotes.get(book.id) || 0) === 1 ? 'fill-current' : ''}`} />
                          </button>
                          
                          <span className="min-w-[32px] text-center font-bold text-sm text-gray-900 dark:text-white">
                            {(bookVotes.get(book.id) || 0) > 0 ? '+' : ''}{bookVotes.get(book.id) || 0}
                          </span>
                          
                          <button
                            onClick={(e) => handleVote(e, book.id, -1)}
                            className={`p-2 rounded-lg transition-all ${
                              (userVotes.get(book.id) || 0) === -1
                                ? 'bg-red-500 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                            }`}
                            title="No me gusta"
                          >
                            <ThumbsUp className={`w-4 h-4 rotate-180 ${(userVotes.get(book.id) || 0) === -1 ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>

          {/* Flechas de navegación */}
          <motion.button
            onClick={() => paginate(-1)}
            aria-label="Anterior"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all z-20 border border-gray-200 dark:border-gray-700"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </motion.button>
          <motion.button
            onClick={() => paginate(1)}
            aria-label="Siguiente"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all z-20 border border-gray-200 dark:border-gray-700"
          >
            <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </motion.button>

          {/* Indicadores de paginación con miniaturas */}
          <div className="flex justify-center gap-3 mt-8 overflow-x-auto pb-2">
            {featuredBooks.map((book, idx) => (
              <div key={idx} className="group/thumb relative">
                <motion.button
                  onClick={() => setPage([idx, idx > index ? 1 : -1])}
                  aria-label={`Ver ${book.title}`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex-shrink-0 transition-all rounded-lg overflow-hidden ${
                    idx === index
                      ? 'ring-3 ring-blue-600 dark:ring-blue-400 shadow-lg'
                      : 'ring-2 ring-gray-300 dark:ring-gray-600 hover:ring-blue-400'
                  }`}
                >
                  <div className="relative w-16 h-24">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay cuando no está activo */}
                    <div className={`absolute inset-0 bg-black transition-opacity ${
                      idx === index ? 'opacity-0' : 'opacity-40 group-hover/thumb:opacity-20'
                    }`}></div>
                    
                    {/* Check mark cuando está activo */}
                    {idx === index && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </motion.button>
                
                {/* Tooltip */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/thumb:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30">
                  {book.title.length > 20 ? book.title.substring(0, 20) + '...' : book.title}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
