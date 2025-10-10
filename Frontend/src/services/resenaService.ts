import { fetchWithRefresh } from '../utils/fetchWithRefresh';

const API_URL = 'http://localhost:3000/api/resena';

export const obtenerReseñas = async (idLibro: number) => {
  const res = await fetch(`${API_URL}?libroId=${idLibro}`);
  if (!res.ok) throw new Error('Error al obtener reseñas');
  return res.json();
};

export const agregarReseña = async (
  libroId: number,
  comentario: string,
  estrellas: number,
  token: string
) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ libroId, comentario, estrellas }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Error al agregar reseña');
  }

  return res.json();
};

export const obtenerResenasPendientes = async (token: string) => {
  const res = await fetch(`${API_URL}?estado=PENDING`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const error = new Error('Error al obtener reseñas pendientes');
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
};

export const aprobarResena = async (id: number, token: string) => {
  const res = await fetch(`${API_URL}/${id}/approve`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al aprobar reseña');
  return res.json();
};

export const rechazarResena = async (id: number, token: string) => {
  const res = await fetch(`${API_URL}/${id}/reject`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al rechazar reseña');
  return res.json();
};

export const getResenasByUsuario = async (userId: number) => {
  const response = await fetchWithRefresh(`${API_URL}?usuarioId=${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Error al obtener reseñas del usuario');
  return response.json();
};

export const getResenasByLibro = async (libroId: number) => {
  const response = await fetchWithRefresh(`${API_URL}?libroId=${libroId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Error al obtener reseñas del libro');
  return response.json();
};
