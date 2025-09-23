// src/services/reaccionService.ts
const API_URL = 'http://localhost:3000/api/reaccion';

export const getReaccionesByResena = async (resenaId: number) => {
  const response = await fetch(`${API_URL}/resena/${resenaId}`);
  if (!response.ok) {
    throw new Error('No se pudieron obtener las reacciones');
  }
  return await response.json();
};

export const addOrUpdateReaccion = async (reaccionData: {
  usuarioId: number;
  resenaId: number;
  tipo: string;
}, token: string) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reaccionData),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Error al agregar/actualizar la reacción');
  }

  return await response.json();
};

export const deleteReaccion = async (usuarioId: number, resenaId: number, token: string) => {
  const response = await fetch(`${API_URL}/${usuarioId}/${resenaId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Error al eliminar la reacción');
  }

  return await response.json();
};
