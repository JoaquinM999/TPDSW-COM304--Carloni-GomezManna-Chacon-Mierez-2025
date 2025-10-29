import React, { useEffect, useState } from 'react';
import { SearchBar } from './SearchBar';
import { Star, Users, BookOpen, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import Spline from '@splinetool/react-spline';

// Componente del pollito con animación al aparecer
const PollitoSpline: React.FC = () => {
  const [showSpline, setShowSpline] = useState(
    typeof window !== 'undefined' && window.innerWidth >= 1024
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');

    const handler = (e: MediaQueryListEvent) => {
      setShowSpline(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (!showSpline) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ width: '100%', height: '100%' }}
    >
      <Spline scene="https://prod.spline.design/mwDSVm4wBNVQVDdz/scene.splinecode" />
    </motion.div>
  );
};

export const HeroSection: React.FC = () => {
  const stats = [
    { icon: BookOpen, label: 'Libros Reseñados', value: '50,000+', color: '#14F0FF' },
    { icon: Star, label: 'Reseñas Totales', value: '250,000+', color: '#FFD700' },
    { icon: Users, label: 'Lectores Activos', value: '15,000+', color: '#7B68EE' },
    { icon: Heart, label: 'Libros Favoritos', value: '180,000+', color: '#FF6FAF' },
  ];

  const iconVariants = {
    hover: {
      scale: 1.3,
      rotate: [0, 15, -15, 0],
      transition: { duration: 0.6, repeat: Infinity, repeatDelay: 2 }
    }
  };

  return (
    <section
      aria-label="Sección principal de bienvenida"
      className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-10"
    >
      {/* Fondo animado */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-radial from-indigo-300 via-purple-200 to-pink-100 opacity-50"
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 30, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
        style={{ backgroundSize: '200% 200%' }}
      />

      {/* Contenedor principal */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 flex flex-col lg:flex-row items-center lg:justify-center gap-12">
        
        {/* Pollito - solo en desktop y iPad Pro */}
        <div className="hidden lg:flex relative z-10 justify-center items-center h-full min-h-[300px]">
          <div className="w-full max-w-6xl h-[440px] sm:h-[500px] lg:h-[560px] overflow-hidden flex items-center justify-center">
            <div
              style={{
                transformOrigin: 'center',
                width: '100%',
                height: '100%',
                transform: 'translateY(80px)',
              }}
            >
              <PollitoSpline />
            </div>
          </div>
        </div>

        {/* Títulos y barra de búsqueda */}
        <div className="flex flex-col justify-center text-center lg:text-left w-full lg:w-2/3">
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
            className="max-w-3xl mx-auto lg:mx-0 text-lg sm:text-xl text-gray-700 mb-8 leading-relaxed"
          >
            Explora millones de reseñas, descubre nuevos autores y sagas, recibe recomendaciones personalizadas 
            y conecta con una comunidad lectora apasionada.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="mb-16 max-w-xl mx-auto lg:mx-0"
          >
            <SearchBar
              placeholder="Buscar libros, autores..."
              aria-label="Buscar libros, autores"
              className="shadow-lg"
            />
          </motion.div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {stats.map(({ icon: Icon, label, value, color }, idx) => (
          <motion.div
            key={idx}
            className="relative rounded-2xl p-6 sm:p-8 border border-white/30 shadow-lg cursor-default select-none flex flex-col items-center justify-center text-center overflow-hidden bg-gradient-to-br from-white/70 to-white/30 backdrop-blur-xl"
            whileHover="hover"
            initial="rest"
            animate="rest"
            variants={{
              rest: { scale: 1, rotate: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' },
              hover: { scale: 1.05, rotate: 1, boxShadow: '0 12px 32px rgba(0,0,0,0.15)' }
            }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {/* Efecto de brillo de fondo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>

            {/* Icono */}
            <motion.div
              variants={iconVariants}
              className="mb-4 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl"
              style={{
                background: `${color}15`,
                color: color,
              }}
            >
              <Icon className="w-7 h-7 sm:w-8 sm:h-8" aria-hidden="true" />
            </motion.div>

            {/* Valor */}
            <p className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 drop-shadow-sm">
              {value}
            </p>

            {/* Etiqueta */}
            <p className="mt-1 text-sm sm:text-base text-gray-600 font-medium">
              {label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
