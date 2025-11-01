import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { getSagaById } from '../services/sagaService';
import LibroCard from '../componentes/LibroCard';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface Libro {
  id: number;
  titulo: string;
  autores: string[];
  descripcion?: string;
  imagen: string | null;
  enlace: string | null;
  averageRating?: number;
  externalId?: string;
}

interface Saga {
  id: number;
  nombre: string;
  libros: Libro[];
  createdAt: string;
  updatedAt?: string;
}

const SagaDetallePage: React.FC = () => {
  const { id } = useParams();
  const [saga, setSaga] = useState<Saga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSaga = async () => {
      if (!id) return;

      try {
        const data = await getSagaById(Number(id));
        setSaga(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchSaga();
  }, [id]);

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

  if (error || !saga) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            {error || 'Saga no encontrada'}
          </h1>
          <Link
            to="/sagas"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Sagas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/sagas"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver a Sagas
            </Link>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 via-blue-600 to-indigo-700 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400">
                {saga.nombre}
              </span>
            </h1>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <BookOpen className="w-5 h-5" />
              <span className="text-lg">{saga.libros.length} libro{saga.libros.length !== 1 ? 's' : ''} en esta saga</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {saga.libros.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">Esta saga no tiene libros asociados aún.</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {saga.libros.map((libro, index) => (
              <motion.div
                key={libro.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to={`/libro/${libro.externalId || libro.id}`}>
                  <LibroCard
                    title={libro.titulo}
                    authors={libro.autores}
                    image={libro.imagen}
                    description={libro.descripcion}
                    rating={libro.averageRating}
                  />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SagaDetallePage;
