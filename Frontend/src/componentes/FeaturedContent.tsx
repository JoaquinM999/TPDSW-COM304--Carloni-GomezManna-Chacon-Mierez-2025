"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  author: string;
  image: string;
  category?: string;
  trending?: boolean;
}

const featuredBooks: ContentItem[] = [
  {
    id: "1",
    title: "El Hombre en Busca de Sentido",
    author: "Viktor Frankl",
    image: "https://images.pexels.com/photos/1741230/pexels-photo-1741230.jpeg",
    category: "Psicología",
    trending: true,
  },
  {
    id: "2",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    image: "https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg",
    category: "Historia",
  },
  {
    id: "3",
    title: "Atomic Habits",
    author: "James Clear",
    image: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg",
    category: "Autoayuda",
    trending: true,
  },
  {
    id: "4",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    image: "https://images.pexels.com/photos/1130980/pexels-photo-1130980.jpeg",
    category: "Thriller",
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
  const [[page, direction], setPage] = useState([0, 0]);
  const featuredCount = featuredBooks.length;
  const index = ((page % featuredCount) + featuredCount) % featuredCount;

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const book = featuredBooks[index];

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-gray-100">
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
          <div className="relative h-[480px] sm:h-[520px] md:h-[560px] overflow-hidden mb-8">
            <AnimatePresence initial={false} custom={direction}>
              <motion.article
                key={book.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden flex flex-col transition-shadow duration-300"
                style={{ willChange: "transform" }}
              >
                                <div className="relative flex-shrink-0">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-64 sm:h-72 md:h-80 object-cover"
                  />
                  {book.trending && (
                    <span className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
                      ⭐ Recomendado
                    </span>
                  )}
                  {book.category && (
                    <span className="absolute top-4 right-4 bg-gray-900/70 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                      {book.category}
                    </span>
                  )}
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="font-sans text-xl font-bold text-gray-900 mb-2">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 italic text-base mb-4">
                    por {book.author}
                  </p>
                  <blockquote className="italic text-gray-700 text-sm border-l-4 border-blue-500 pl-4 py-2 bg-blue-50/50 rounded-r">
                    "Una lectura que transforma y abre nuevos horizontes."
                  </blockquote>
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

          {/* Indicadores de paginación */}
          <div className="flex justify-center gap-2 mt-6">
            {featuredBooks.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPage([idx, idx > index ? 1 : -1])}
                aria-label={`Ir al libro ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  idx === index
                    ? 'w-8 h-2 bg-blue-600'
                    : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
