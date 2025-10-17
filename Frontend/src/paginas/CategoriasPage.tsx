import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag } from 'lucide-react';
import { getCategorias } from '../services/categoriaService';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  librosCount: number;
}

const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-gray-700', 'bg-amber-600', 'bg-green-500', 'bg-indigo-500', 'bg-red-500'];

export const CategoriasPage: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await getCategorias();
        setCategorias(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    fetchCategorias();
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
    return <p className="text-center text-red-500 text-lg">{error}</p>;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-center text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 via-blue-600 to-indigo-700">
                  Categorías
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Descubre libros organizados por categorías
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
          {categorias.map((categoria, index) => (
            <motion.div
              key={categoria.id}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/20"
              variants={cardVariants}
              whileHover={{
                scale: 1.03,
                y: -8,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`h-32 ${colors[index % colors.length]} flex items-center justify-center relative`}>
                <Tag className="w-12 h-12 text-white" />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-2 text-lg leading-tight">{categoria.nombre}</h3>
                <p className="text-gray-600 text-sm mb-4 font-medium">{categoria.librosCount.toLocaleString()} libros</p>
                <div className="flex items-center justify-between">
                  <Link
                    to={`/categoria/${categoria.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Explorar
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};



/* import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategorias } from '../services/categoriaService';

interface Categoria {
  id: number;
  nombre: string;
}

const CategoriasPage = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getCategorias()
      .then(setCategorias)
      .catch((err) => console.error(err));
  }, []);

  const irALibros = (id: number) => {
    navigate(`/categoria/${id}`);
  };

  return (
    <div>
      <h2>Categorías</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {categorias.map((cat) => (
          <li key={cat.id} style={{ margin: '10px 0' }}>
            <button onClick={() => irALibros(cat.id)}>{cat.nombre}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoriasPage;
 */