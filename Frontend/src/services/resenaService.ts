// src/services/resenaService.ts
import { fetchWithRefresh } from '../utils/fetchWithRefresh';

const API_URL = 'http://localhost:3000/api/resena';

/**
 * 🔹 Obtiene reseñas de un libro.
 * Acepta tanto el ID interno como el externalId (Google Books, por ejemplo).
 * Devuelve todas las reseñas excepto las rechazadas (según la lógica del backend).
 */
export const obtenerReseñas = async (idLibro: string) => {
  const response = await fetchWithRefresh(`${API_URL}?libroId=${encodeURIComponent(idLibro)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ Error al obtener reseñas:', error);
    throw new Error('Error al obtener reseñas');
  }

  return response.json();
};

/**
 * 🔹 Agrega una nueva reseña.
 * Si el libro no existe en la BD, el backend lo crea automáticamente.
 * Invalida la caché en Redis (si está activo) para mostrar los cambios instantáneamente.
 */
export const agregarReseña = async (
  libroId: string,
  comentario: string,
  estrellas: number,
  libro: any
) => {
  const response = await fetchWithRefresh(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ libroId, comentario, estrellas, libro }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Error al agregar reseña');
  }

  return response.json();
};

/**
 * 🔹 Obtiene todas las reseñas pendientes (solo admin).
 */
export const obtenerResenasPendientes = async (token: string) => {
  const response = await fetch(`${API_URL}?estado=PENDING`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-cache',
    },
  });

  if (!response.ok) {
    const error = new Error('Error al obtener reseñas pendientes');
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
};

/**
 * 🔹 Aprueba una reseña (solo admin).
 */
export const aprobarResena = async (id: number, token: string) => {
  const response = await fetch(`${API_URL}/${id}/approve`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error('Error al aprobar reseña');
  return response.json();
};

/**
 * 🔹 Rechaza una reseña (solo admin).
 */
export const rechazarResena = async (id: number, token: string) => {
  const response = await fetch(`${API_URL}/${id}/reject`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error('Error al rechazar reseña');
  return response.json();
};

/**
 * 🔹 Obtiene reseñas de un usuario.
 */
export const getResenasByUsuario = async (userId: number) => {
  const response = await fetchWithRefresh(`${API_URL}?usuarioId=${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });

  if (!response.ok) throw new Error('Error al obtener reseñas del usuario');
  return response.json();
};

/**
 * 🔹 Obtiene reseñas de un libro (mismo propósito que obtenerReseñas, pero separado por compatibilidad).
 */
export const getResenasByLibro = async (libroId: string) => {
  const response = await fetchWithRefresh(`${API_URL}?libroId=${encodeURIComponent(libroId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });

  if (!response.ok) throw new Error('Error al obtener reseñas del libro');
  return response.json();
};

/**
 * 🔹 Crea una respuesta a una reseña.
 */
export const crearRespuesta = async (
  parentId: number,
  comentario: string
) => {
  const response = await fetchWithRefresh(`${API_URL}/${parentId}/responder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ comentario }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Error al crear respuesta');
  }

  return response.json();
};
