// componentes/LibroCard.tsx

import React from 'react';

interface LibroCardProps {
  nombre: string;
  sinopsis: string;
  imagen?: string;
}

const LibroCard: React.FC<LibroCardProps> = ({ nombre, sinopsis, imagen }) => {
  return (
    <article
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      tabIndex={0}
      aria-label={`Libro: ${nombre}`}
    >
      <div className="h-64 bg-gray-100 overflow-hidden">
        <img
          src={imagen || 'https://via.placeholder.com/300x400?text=Sin+Imagen'}
          alt={`Portada del libro ${nombre}`}
          loading="lazy"
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 flex flex-col justify-between h-48">
        <h3 className="text-xl font-semibold mb-2 text-gray-900 truncate" title={nombre}>
          {nombre}
        </h3>
        <p className="text-gray-700 text-sm line-clamp-4" title={sinopsis}>
          {sinopsis}
        </p>
        <button
          type="button"
          className="mt-4 self-start px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 transition"
          aria-label={`Más información sobre ${nombre}`}
          onClick={() => alert(`Más información de "${nombre}" aún no implementada`)}
        >
          Ver más
        </button>
      </div>
    </article>
  );
};

export default LibroCard;
