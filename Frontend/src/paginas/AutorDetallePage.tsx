import React from 'react';
import { useParams, Link } from 'react-router-dom';

const autoresMock = [
  { id: 1, nombre: 'Gabriel', apellido: 'García Márquez', libros: ['Cien años de soledad', 'El amor en los tiempos del cólera'] },
  { id: 2, nombre: 'Isabel', apellido: 'Allende', libros: ['La casa de los espíritus', 'Eva Luna'] },
  { id: 3, nombre: 'J.K.', apellido: 'Rowling', libros: ['Harry Potter y la piedra filosofal', 'Harry Potter y la cámara secreta'] },
];

const AutorDetallePage: React.FC = () => {
  const { id } = useParams();
  const autor = autoresMock.find((a) => a.id === Number(id));

  if (!autor) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Autor no encontrado</h1>
        <Link to="/autores" className="text-green-600 underline">Volver a la lista de autores</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-green-700">
        {autor.nombre} {autor.apellido}
      </h1>
      <h2 className="text-lg text-gray-700 mt-2">Libros publicados:</h2>
      <ul className="list-disc list-inside mt-2">
        {autor.libros.map((libro, index) => (
          <li key={index} className="text-gray-800">{libro}</li>
        ))}
      </ul>
      <Link to="/autores" className="mt-4 inline-block text-green-600 hover:text-green-800">
        ← Volver a Autores
      </Link>
    </div>
  );
};

export default AutorDetallePage;
