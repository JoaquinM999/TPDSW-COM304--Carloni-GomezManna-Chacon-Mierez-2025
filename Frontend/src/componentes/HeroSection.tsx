import React from 'react';
import { SearchBar } from './SearchBar';
import { Star, /* TrendingUp, */ Users, BookOpen, Heart/* , User */ } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const stats = [
    { icon: BookOpen, label: 'Libros Reseñados', value: '50,000+' },
    { icon: Star, label: 'Reseñas Totales', value: '250,000+' },
    { icon: Users, label: 'Lectores Activos', value: '15,000+' },
    { icon: Heart, label: 'Libros Favoritos', value: '180,000+' },
  ];

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Descubre tu próximo
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              libro favorito
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Explora millones de reseñas, descubre nuevos autores y sagas, encuentra recomendaciones personalizadas y conecta con una comunidad apasionada por la lectura.
          </p>
          
          {/* Search Bar */}
          <div className="mb-12">
            <SearchBar placeholder="Buscar libros, autores, sagas..." />
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl">
              Libros Trending
            </button>
            <button className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium border border-gray-300 transition-colors duration-200 shadow-lg hover:shadow-xl">
              Mis Listas de Lectura
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};