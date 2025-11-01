import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { getSagas } from '../services/sagaService';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface Saga {
  id: number;
  nombre: string;
  cantidadLibros: number;
  libros: Array<{
    id: number;
    titulo: string;
    autores: string[];
    descripcion: string | null;
    imagen: string | null;
    enlace: string | null;
    externalId: string | null;
  }>;
}

const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-gray-700', 'bg-amber-600', 'bg-green-500', 'bg-indigo-500', 'bg-red-500'];

const SagasPage: React.FC = () => {
  const [sagas, setSagas] = useState<Saga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSagas = async () => {
      try {
        const data = await getSagas();
        setSagas(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    fetchSagas();
  }, []);

  if (loading) {
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

  if (error) {
    return <p className="text-center text-red-500 dark:text-red-400 text-lg">{error}</p>;
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-center text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 via-blue-600 to-indigo-700 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400">
                  Sagas
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Descubre series completas de libros
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sagas.map((saga, index) => {
            const firstBookWithImage = saga.libros.find(libro => libro.imagen);
            return (
              <motion.div
                key={saga.id}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/20 dark:border-gray-700/50"
                variants={cardVariants}
                whileHover={{
                  scale: 1.03,
                  y: -8,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                {firstBookWithImage ? (
                  <div className="h-48 relative overflow-hidden">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url(${firstBookWithImage.imagen})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(8px)',
                      }}
                    />
                    <div className="relative z-10 h-full flex items-center justify-center">
                      <img
                        src={firstBookWithImage.imagen!}
                        alt={firstBookWithImage.titulo}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className={`h-48 ${colors[index % colors.length]} flex items-center justify-center relative`}>
                    <BookOpen className="w-12 h-12 text-white" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 text-lg leading-tight">{saga.nombre}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 font-medium">{saga.cantidadLibros} libros</p>
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/sagas/${saga.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      Explorar
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default SagasPage;
