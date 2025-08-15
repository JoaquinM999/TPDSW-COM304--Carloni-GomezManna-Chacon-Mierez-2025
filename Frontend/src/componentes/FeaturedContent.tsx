"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, BookOpen, User, ChevronRight, ChevronLeft } from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  author: string;
  image: string;
  category?: string;
  trending?: boolean;
}

interface Review {
  id: string;
  user: string;
  book: string;
  comment: string;
  time: string;
  avatar: string;
}

interface UserList {
  title: string;
  isPublic: boolean;
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

const recentReviews: Review[] = [
  {
    id: "1",
    user: "María González",
    book: "Dune",
    comment:
      "Una obra maestra de la ciencia ficción que invita a reflexionar sobre el poder y la humanidad.",
    time: "hace poco",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
  },
  {
    id: "2",
    user: "Carlos Rivera",
    book: "El Nombre del Viento",
    comment:
      "Narrativa envolvente que te atrapa y no te deja ir hasta la última página.",
    time: "recientemente",
    avatar: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg",
  },
  {
    id: "3",
    user: "Ana Martín",
    book: "Educated",
    comment:
      "Un relato profundamente humano sobre la superación y la búsqueda de la verdad.",
    time: "recientemente",
    avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
  },
];

const userLists: UserList[] = [
  { title: "Mis Libros Favoritos", isPublic: true },
  { title: "Para Leer", isPublic: false },
  { title: "Ciencia Ficción Recomendada", isPublic: true },
  { title: "Autores Latinoamericanos", isPublic: true },
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
    <section className="py-20 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Encabezado Tendencias */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-sans font-extrabold text-gray-900">
              Historias que están marcando el momento
            </h2>
            <p className="text-gray-600 mt-1 text-sm">
              Selección creada por la comunidad según las lecturas más comentadas.
            </p>
          </div>
          <button className="flex items-center gap-1 text-blue-600 hover:underline text-sm font-medium">
            Explorar más <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Carrusel Libros Destacados */}
        <div className="relative max-w-md mx-auto">
          <div className="relative h-[480px] sm:h-[520px] md:h-[560px] overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <motion.article
                key={book.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 bg-white rounded-xl shadow-md overflow-hidden flex flex-col"
                style={{ willChange: "transform" }}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-64 sm:h-72 md:h-80 object-cover"
                  />
                  {book.trending && (
                    <span className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                      Recomendado
                    </span>
                  )}
                  {book.category && (
                    <span className="absolute top-3 right-3 bg-gray-800 bg-opacity-60 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                      {book.category}
                    </span>
                  )}
                </div>
                <div className="p-5 flex-grow">
                  <h3 className="font-sans text-lg font-bold text-gray-900 mb-1">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 italic text-sm mb-4">
                    por {book.author}
                  </p>
                  <blockquote className="italic text-gray-700 text-sm border-l-4 border-gray-200 pl-3">
                    “Una lectura que transforma y abre nuevos horizontes.”
                  </blockquote>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>

          {/* Flechas */}
          <button
            onClick={() => paginate(-1)}
            aria-label="Anterior"
            className="absolute left-0 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition z-20"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={() => paginate(1)}
            aria-label="Siguiente"
            className="absolute right-0 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition z-20"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Resto de secciones... */}
      </div>
    </section>
  );
};
