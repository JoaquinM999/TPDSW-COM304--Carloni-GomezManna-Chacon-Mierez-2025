"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getFeaturedBooks, GoogleBooksVolume } from "../services/googleBooksService";
import { CardSkeleton } from "./SkeletonLoader";

interface ContentItem {
  id: string;
  title: string;
  author: string;
  image: string;
  category?: string;
  trending?: boolean;
  description?: string;
  rating?: number;
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

  // Cargar libros de Google Books API
  useEffect(() => {
    const loadFeaturedBooks = async () => {
      setIsLoading(true);
      try {
        const googleBooks = await getFeaturedBooks(10);
        if (googleBooks.length > 0) {
          const convertedBooks = googleBooks.map(convertGoogleBookToContentItem).slice(0, 5);
          setFeaturedBooks(convertedBooks);
        }
      } catch (error) {
        console.error('Error loading featured books:', error);
        // Mantener los libros mock si falla la API
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedBooks();
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
      className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-gray-100"
      aria-label="Libros destacados"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Encabezado Tendencias */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-sans font-extrabold text-gray-900">
              Historias que están marcando el momento
            </h2>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              Selección creada por la comunidad según las lecturas más comentadas.
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300"
          >
            Explorar más <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Carrusel Libros Destacados */}
        <div className="relative max-w-md mx-auto">
          <div
            className="relative h-[520px] sm:h-[480px] overflow-hidden mb-2"
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
                className="absolute inset-0 bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden flex flex-col sm:flex-row transition-shadow duration-300 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                style={{ willChange: "transform" }}
              >
                                {/* Contenedor de portada con efecto 3D - Lado izquierdo */}
                <div className="relative flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 w-full sm:w-2/5 p-4 sm:p-6 flex items-center justify-center">
                  {/* Portada del libro con efecto 3D */}
                  <div className="relative w-full max-w-[200px] sm:max-w-none group">
                    {/* Sombra y efecto de profundidad */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/40 via-gray-800/30 to-gray-900/40 rounded-lg transform translate-x-2 translate-y-2 blur-xl group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-300"></div>
                    
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
                    className="absolute inset-0 opacity-[0.05] pointer-events-none"
                    style={{
                      backgroundImage: `url(${book.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'blur(40px) saturate(1.5)',
                      transform: 'scale(1.2)'
                    }}
                  ></div>
                  
                  {/* Gradiente overlay para mejor legibilidad */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/98 via-white/96 to-gray-50/95 pointer-events-none"></div>
                  
                  {/* Contenido con z-index superior */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Título y autor con mejor diseño y contraste */}
                    <div className="mb-3 bg-white/70 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-gray-100">
                      <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900 mb-2 leading-tight tracking-tight drop-shadow-sm line-clamp-2">
                        {book.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="h-0.5 flex-grow bg-gradient-to-r from-blue-600/60 to-transparent rounded-full"></div>
                        <p className="text-gray-700 text-xs sm:text-sm font-medium whitespace-nowrap">
                          por <span className="text-blue-700 font-bold">{book.author}</span>
                        </p>
                        <div className="h-0.5 flex-grow bg-gradient-to-l from-blue-600/60 to-transparent rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Rating con diseño mejorado y compacto */}
                    {book.rating && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 mb-3 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-2 rounded-lg border border-amber-200/50 shadow-sm"
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
                                  ? 'text-amber-500 fill-amber-500 drop-shadow-sm'
                                  : 'text-gray-300 fill-gray-300'
                              }`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </motion.svg>
                          ))}
                        </div>
                        <span className="text-base sm:text-lg font-bold text-amber-700 drop-shadow-sm">{book.rating}</span>
                        <span className="text-xs text-gray-500 font-medium">/ 5.0</span>
                      </motion.div>
                    )}
                    
                    {/* Descripción con mejor diseño */}
                    <div className="flex-1 overflow-hidden">
                      <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 rounded-lg p-3 sm:p-4 border border-blue-200/40 shadow-inner h-full flex flex-col">
                        {/* Icono decorativo */}
                        <div className="absolute top-2 left-2 text-blue-300/30 text-3xl font-serif leading-none">"</div>
                        
                        <p className="relative text-gray-700 text-xs sm:text-sm leading-relaxed pl-5 sm:pl-6 italic flex-1 overflow-y-auto">
                          {book.description || "Una lectura que transforma y abre nuevos horizontes."}
                        </p>
                        
                        {/* Barra decorativa inferior */}
                        <div className="mt-2 flex gap-1 flex-shrink-0">
                          <div className="h-0.5 w-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                          <div className="h-0.5 w-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                          <div className="h-0.5 w-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
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
            className="absolute left-0 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300 z-20 border border-gray-200"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </motion.button>
          <motion.button
            onClick={() => paginate(1)}
            aria-label="Siguiente"
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300 z-20 border border-gray-200"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </motion.button>

          {/* Indicadores de paginación con miniaturas */}
          <div className="flex justify-center gap-3 sm:gap-4 mt-8 px-4 overflow-x-auto pb-2">
            {featuredBooks.map((book, idx) => (
              <motion.button
                key={idx}
                onClick={() => setPage([idx, idx > index ? 1 : -1])}
                aria-label={`Ver ${book.title}`}
                whileHover={{ scale: 1.1, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className={`relative flex-shrink-0 transition-all duration-300 rounded-lg overflow-hidden group ${
                  idx === index
                    ? 'ring-4 ring-blue-500 shadow-xl'
                    : 'ring-2 ring-gray-200 hover:ring-gray-400 shadow-md hover:shadow-lg'
                }`}
              >
                {/* Miniatura de la portada */}
                <div className="relative w-16 h-24 sm:w-20 sm:h-28">
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
