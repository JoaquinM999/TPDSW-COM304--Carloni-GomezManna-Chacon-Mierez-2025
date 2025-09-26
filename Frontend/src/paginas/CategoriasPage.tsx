import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Tag } from 'lucide-react';
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
  const [filteredCategorias, setFilteredCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await getCategorias();
        setCategorias(data);
        setFilteredCategorias(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    fetchCategorias();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const filtered = categorias.filter(cat =>
        cat.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategorias(filtered);
    } else {
      setFilteredCategorias(categorias);
    }
  }, [searchQuery, categorias]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Explorar por Categorías</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre libros organizados por categorías
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar categorías..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Todas las Categorías</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCategorias.map((categoria, index) => (
            <Link
              key={categoria.id}
              to={`/categoria/${categoria.id}`}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden block"
            >
              <div className={`h-32 ${colors[index % colors.length]} flex items-center justify-center`}>
                <Tag className="w-12 h-12 text-white" />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{categoria.nombre}</h3>
                {categoria.descripcion && <p className="text-gray-600 text-sm mb-3">{categoria.descripcion}</p>}
                <div className="text-blue-600 font-medium text-sm">
                  {categoria.librosCount.toLocaleString()} libros
                </div>
              </div>
            </Link>
          ))}
        </div>
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