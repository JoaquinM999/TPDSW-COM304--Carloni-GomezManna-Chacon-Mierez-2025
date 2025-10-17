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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 p-6">
      <header className="max-w-5xl mx-auto mb-6">
        <h2 className="text-center text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 via-blue-600 to-indigo-700">
            Sagas
          </span>
        </h2>
        <p className="text-center text-sm text-gray-600">
          Descubre series completas de libros
        </p>
      </header>

      <main className="max-w-5xl mx-auto">
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
      </main>
    </div>
  );
};

export default SagasPage;
