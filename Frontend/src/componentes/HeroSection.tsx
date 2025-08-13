import React from 'react';
import { SearchBar } from './SearchBar';
import { Star, Users, BookOpen, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export const HeroSection: React.FC = () => {
  const stats = [
    { icon: BookOpen, label: 'Libros Reseñados', value: '50,000+', color: '#14F0FF' },    // turquesa
    { icon: Star, label: 'Reseñas Totales', value: '250,000+', color: '#FFD700' },       // amarillo oro
    { icon: Users, label: 'Lectores Activos', value: '15,000+', color: '#7B68EE' },      // morado
    { icon: Heart, label: 'Libros Favoritos', value: '180,000+', color: '#FF6FAF' },     // rosa suave
  ];

  const iconVariants = {
    hover: {
      scale: 1.3,
      rotate: [0, 15, -15, 0],
      transition: { duration: 0.6, repeat: Infinity, repeatDelay: 2 }
    }
  };

  const buttonTap = {
    scale: 0.95,
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
  };

  return (
    <section
      aria-label="Sección principal de bienvenida"
      className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-24"
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-radial from-indigo-300 via-purple-200 to-pink-100 opacity-50"
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 30, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
        style={{ backgroundSize: '200% 200%' }}
      />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 select-none"
        >
          Descubre tu próximo{' '}
          <motion.span
            initial={{ backgroundPositionX: '0%' }}
            animate={{ backgroundPositionX: ['0%', '100%', '0%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="bg-gradient-to-r from-[#39FF14] via-[#14F0FF] to-[#7B68EE] bg-clip-text text-transparent inline-block"
          >
            libro favorito
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-700 mb-14 leading-relaxed select-text"
        >
          Explora millones de reseñas, descubre nuevos autores y sagas, encuentra
          recomendaciones personalizadas y conecta con una comunidad apasionada por la
          lectura.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="mb-16 max-w-xl mx-auto"
        >
          <SearchBar
            placeholder="Buscar libros, autores, sagas..."
            aria-label="Buscar libros, autores, sagas"
            className="shadow-lg"
          />
        </motion.div>

        <div className="flex flex-wrap justify-center gap-8 mb-20">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(70,130,180,0.5)' }} // steelblue sombra
            whileTap={buttonTap}
            className="bg-blue-300 text-blue-900 px-10 py-3 rounded-xl font-semibold shadow-md transition-transform duration-300 select-none"
          >
            Libros Trending
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(100,149,237,0.5)' }} // cornflowerblue sombra
            whileTap={buttonTap}
            className="bg-white border-2 border-blue-400 text-blue-600 px-10 py-3 rounded-xl font-semibold shadow-md transition-transform duration-300 select-none"
          >
            Mis Listas de Lectura
          </motion.button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-12 max-w-4xl mx-auto">
          {stats.map(({ icon: Icon, label, value, color }, idx) => (
            <motion.div
              key={idx}
              className="bg-white/90 backdrop-blur-lg rounded-2xl p-10 border border-white/30 shadow-lg cursor-default select-none flex flex-col items-center justify-center text-center"
              whileHover="hover"
              initial="rest"
              animate="rest"
              variants={{
                rest: { scale: 1, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
                hover: { scale: 1.1, boxShadow: '0 12px 20px rgba(0,0,0,0.2)' }
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.div variants={iconVariants} className="mb-4 w-12 h-12" style={{ color }}>
                <Icon className="w-full h-full" aria-hidden="true" />
              </motion.div>
              <p className="text-4xl font-extrabold text-gray-900 mb-2">{value}</p>
              <p className="text-base text-gray-600">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
