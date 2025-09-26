import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSagas } from '../services/sagaService';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface Saga {
  id: number;
  nombre: string;
  cantidadLibros: number;
}

const SagasPage: React.FC = () => {
  const [sagas, setSagas] = useState<Saga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSagas = async () => {
      try {
        const data = await getSagas();
        setSagas(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    fetchSagas();
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Sagas</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sagas.map((saga) => (
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
