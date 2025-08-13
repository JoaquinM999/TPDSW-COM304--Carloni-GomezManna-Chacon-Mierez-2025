import React from 'react';

interface LibroProps {
  nombre: string;
  sinopsis: string;
}

const LibroCard: React.FC<LibroProps> = ({ nombre, sinopsis }) => {
  return (
    <article
      className="
        border border-gray-300 rounded-lg p-6 m-4
        shadow-sm hover:shadow-lg transition-shadow duration-300
        bg-white cursor-pointer
        "
      aria-label={`Libro: ${nombre}`}
      tabIndex={0}
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{nombre}</h3>
      <p className="text-gray-700 leading-relaxed">{sinopsis}</p>
    </article>
  );
};

export default LibroCard;
