import React, { useState, useEffect } from 'react';
import { obtenerResenasPendientes, aprobarResena, rechazarResena } from '../services/resenaService';
import { getAccessToken } from '../utils/tokenUtil';

interface Resena {
  id: number;
  comentario: string;
  estrellas: number;
  fechaResena: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
  };
  libro: {
    id: number;
    titulo: string;
    slug: string;
  };
}

const AdminModerationPage: React.FC = () => {
  const [resenasPendientes, setResenasPendientes] = useState<Resena[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarResenasPendientes();
  }, []);

  const cargarResenasPendientes = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        setError('No tienes permisos para acceder a esta página');
        return;
      }

      const resenas = await obtenerResenasPendientes(token);
      setResenasPendientes(resenas);
    } catch (err) {
      setError('Error al cargar reseñas pendientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (id: number) => {
    try {
      const token = getAccessToken();
      if (!token) return;

      await aprobarResena(id, token);
      setResenasPendientes(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError('Error al aprobar la reseña');
      console.error(err);
    }
  };

  const handleRechazar = async (id: number) => {
    try {
      const token = getAccessToken();
      if (!token) return;

      await rechazarResena(id, token);
      setResenasPendientes(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError('Error al rechazar la reseña');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Moderación de Reseñas</h1>
          <div className="text-center">Cargando reseñas pendientes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Moderación de Reseñas</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Moderación de Reseñas</h1>

        {resenasPendientes.length === 0 ? (
          <div className="text-center text-gray-500">
            No hay reseñas pendientes de moderación.
          </div>
        ) : (
          <div className="space-y-6">
            {resenasPendientes.map((resena) => (
              <div key={resena.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Reseña de "{resena.libro.titulo}"
                    </h3>
                    <p className="text-sm text-gray-600">
                      Por: {resena.usuario.nombre} ({resena.usuario.email})
                    </p>
                    <p className="text-sm text-gray-500">
                      Fecha: {new Date(resena.fechaResena).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span className="font-semibold">{resena.estrellas}/5</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded p-4 mb-4">
                  <p className="text-gray-800">{resena.comentario}</p>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => handleAprobar(resena.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleRechazar(resena.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModerationPage;
