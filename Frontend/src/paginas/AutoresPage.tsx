import React from 'react';
import { Link } from 'react-router-dom';

interface Autor {
  id: number;
  nombre: string;
  apellido: string;
  libros: number; // cantidad de libros publicados
}

const autoresMock: Autor[] = [
  { id: 1, nombre: 'Gabriel', apellido: 'García Márquez', libros: 15 },
  { id: 2, nombre: 'Isabel', apellido: 'Allende', libros: 20 },
  { id: 3, nombre: 'J.K.', apellido: 'Rowling', libros: 7 },
];

const AutoresPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Autores</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {autoresMock.map((autor) => (
          <div
            key={autor.id}
            className="bg-white shadow-lg rounded-xl p-4 border hover:shadow-xl transition-shadow duration-200"
          >
            <h2 className="text-xl font-semibold">{autor.nombre} {autor.apellido}</h2>
            <p className="text-gray-600">Libros publicados: {autor.libros}</p>
            <Link
              to={`/autores/${autor.id}`}
              className="mt-3 inline-block text-green-600 hover:text-green-800"
            >
              Ver detalles →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutoresPage;
