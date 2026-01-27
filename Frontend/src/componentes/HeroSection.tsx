import React, { useEffect, useState, Suspense, lazy } from 'react';
import { SearchBar } from './SearchBar';
import { Star, Users, BookOpen, Heart, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SplineErrorBoundary } from './SplineErrorBoundary';
import { AnimatedCounter } from './AnimatedCounter';
import { getStatsWithCache, PlatformStats } from '../services/statsService';


const Spline = lazy(() => import('@splinetool/react-spline'));


const SplineSkeleton: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="w-full h-full flex items-center justify-center"
  >
    <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
  </motion.div>
);


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

  // Suprimir warnings de WebGL de Spline (son informativos, no errores)
  useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      const message = args.join(' ');
      // Filtrar warnings específicos de THREE.js/Spline
      if (message.includes('THREE.WebGLProgram') || message.includes('forcing loop to unroll')) {
        return;
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);

  if (!showSpline) return null;

  return (
    <SplineErrorBoundary>
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={<SplineSkeleton />}>
          <Spline scene="https://prod.spline.design/mwDSVm4wBNVQVDdz/scene.splinecode" />
        </Suspense>
      </motion.div>
    </SplineErrorBoundary>
  );
};

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // Cargar estadísticas al montar el componente
  useEffect(() => {
    const loadStats = async () => {
      setIsLoadingStats(true);
      try {
        console.log('📊 Cargando estadísticas...');
        const data = await getStatsWithCache();
        console.log('✅ Estadísticas recibidas:', data);
        setPlatformStats(data);
      } catch (error) {
        console.error('❌ Error loading platform stats:', error);
        // Usar valores por defecto si falla
        const fallbackStats = {
          librosCreados: 50000,
          reseniasTotales: 250000,
          lectoresActivos: 15000,
          librosFavoritos: 180000,
        };
        console.log('⚠️ Usando valores por defecto:', fallbackStats);
        setPlatformStats(fallbackStats);
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    loadStats();
  }, []);
  
  const stats = [
    { 
      icon: BookOpen, 
      label: 'Libros Creados', 
      value: platformStats?.librosCreados || 0, 
      color: '#14F0FF' 
    },
    { 
      icon: Star, 
      label: 'Reseñas Totales', 
      value: platformStats?.reseniasTotales || 0, 
      color: '#FFD700' 
    },
    { 
      icon: Users, 
      label: 'Lectores Activos', 
      value: platformStats?.lectoresActivos || 0, 
      color: '#7B68EE' 
    },
    { 
      icon: Heart, 
      label: 'Libros Favoritos', 
      value: platformStats?.librosFavoritos || 0, 
      color: '#FF6FAF' 
    },
  ];

  const scrollToFeatured = () => {
    const featuredSection = document.querySelector('[aria-label="Libros destacados"]');
    if (featuredSection) {
      featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
      className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 py-12 sm:py-16 md:py-20 transition-colors duration-300"
    >
      {/* Fondo animado */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-radial from-indigo-300 via-purple-200 to-pink-100 dark:from-indigo-900/40 dark:via-purple-900/30 dark:to-pink-900/20 opacity-50"
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 30, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
        style={{ backgroundSize: '200% 200%' }}
      />

      {/* Contenedor principal */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 flex flex-col lg:flex-row items-center lg:justify-center gap-6 sm:gap-8 lg:gap-12 mb-12 sm:mb-16 md:mb-20">
        
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
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-4 sm:mb-6 select-none text-gray-900 dark:text-white"
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
            className="max-w-3xl mx-auto lg:mx-0 text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed transition-colors duration-300"
          >
            Explora millones de reseñas, descubre nuevos autores y sagas, recibe recomendaciones personalizadas 
            y conecta con una comunidad lectora apasionada.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="max-w-xl mx-auto lg:mx-0 mb-8"
          >
            <SearchBar
              placeholder="Buscar libros, autores..."
              aria-label="Buscar libros, autores"
              className="shadow-lg hover:shadow-xl transition-shadow duration-300"
            />
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <motion.button
              onClick={() => navigate('/registro')}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white rounded-lg sm:rounded-xl font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all duration-300 group"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
              Comenzar ahora
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button
              onClick={scrollToFeatured}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-300 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300 group backdrop-blur-sm"
            >
              Ver libros destacados
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {stats.map(({ icon: Icon, label, value, color }, idx) => (
          <motion.div
            key={idx}
            className="relative rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-white/40 dark:border-gray-700/70 shadow-md cursor-default select-none flex flex-col items-center justify-center text-center overflow-hidden bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/90 dark:to-gray-900/60 backdrop-blur-xl hover:border-white/60 dark:hover:border-gray-600/90 transition-colors duration-300"
            whileHover="hover"
            initial="rest"
            animate="rest"
            variants={{
              rest: { scale: 1, rotate: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
              hover: { scale: 1.08, rotate: 1.5, boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Efecto de brillo de fondo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 dark:via-gray-600/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>

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

            {/* Valor con contador animado o skeleton */}
            {isLoadingStats ? (
              <div className="h-10 sm:h-12 md:h-14 lg:h-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg w-24 sm:w-28 md:w-32 transition-colors duration-300"></div>
            ) : (
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white drop-shadow-sm transition-colors duration-300">
                <AnimatedCounter end={value} suffix="+" duration={2000} />
              </p>
            )}

            {/* Etiqueta */}
            <p className="mt-1 text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium transition-colors duration-300">
              {label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
