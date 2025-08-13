import React, { FC } from 'react';
import { Link } from 'react-router-dom';

interface Saga {
  id: number;
  nombre: string;
  cantidadLibros: number;
}

const sagasMock: Saga[] = [
  { id: 1, nombre: 'Harry Potter', cantidadLibros: 7 },
  { id: 2, nombre: 'El Señor de los Anillos', cantidadLibros: 3 },
  { id: 3, nombre: 'Crónica del Asesino de Reyes', cantidadLibros: 2 },
];

const SagasPage: FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Sagas</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sagasMock.map((saga) => (
          <div
            key={saga.id}
            className="bg-white shadow-lg rounded-xl p-4 border hover:shadow-xl transition-shadow duration-200"
          >
            <h2 className="text-xl font-semibold">{saga.nombre}</h2>
            <p className="text-gray-600">Cantidad de libros: {saga.cantidadLibros}</p>
            <Link
              to={`/sagas/${saga.id}`}
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

export default SagasPage;
