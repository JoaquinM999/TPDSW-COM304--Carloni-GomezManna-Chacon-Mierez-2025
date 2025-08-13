import React from 'react';
import { useParams, Link } from 'react-router-dom';

const sagasMock = [
  { id: 1, nombre: 'Harry Potter', libros: ['La piedra filosofal', 'La cámara secreta', 'El prisionero de Azkaban'] },
  { id: 2, nombre: 'El Señor de los Anillos', libros: ['La comunidad del anillo', 'Las dos torres', 'El retorno del rey'] },
  { id: 3, nombre: 'Crónica del Asesino de Reyes', libros: ['El nombre del viento', 'El temor de un hombre sabio'] },
];

const SagaDetallePage: React.FC = () => {
  const { id } = useParams();
  const saga = sagasMock.find((s) => s.id === Number(id));

  if (!saga) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Saga no encontrada</h1>
        <Link to="/sagas" className="text-green-600 underline">Volver a la lista de sagas</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-green-700">{saga.nombre}</h1>
      <h2 className="text-lg text-gray-700 mt-2">Libros en esta saga:</h2>
      <ul className="list-disc list-inside mt-2">
        {saga.libros.map((libro, index) => (
          <li key={index} className="text-gray-800">{libro}</li>
        ))}
      </ul>
      <Link to="/sagas" className="mt-4 inline-block text-green-600 hover:text-green-800">
        ← Volver a Sagas
      </Link>
    </div>
  );
};

export default SagaDetallePage;
