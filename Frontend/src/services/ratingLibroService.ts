// src/services/ratingLibroService.ts
const API_URL = 'http://localhost:3000/api/rating-libro';

export const getRatingLibros = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('No se pudieron obtener los ratings de libros');
  }
  return await response.json();
};

export const getRatingLibroById = async (id: number) => {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) {
    throw new Error('No se pudo obtener el rating del libro');
  }
  return await response.json();
};

export const getRatingLibroByLibroId = async (libroId: number) => {
  const response = await fetch(`${API_URL}/libro/${libroId}`);
  if (!response.ok) {
    throw new Error('No se pudo obtener el rating del libro');
  }
  return await response.json();
};

export const createOrUpdateRatingLibro = async (ratingData: any, token: string) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(ratingData),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Error al crear o actualizar el rating del libro');
  }

  return await response.json();
};

export const deleteRatingLibro = async (id: number, token: string) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Error al eliminar el rating del libro');
  }

  return await response.json();
};
