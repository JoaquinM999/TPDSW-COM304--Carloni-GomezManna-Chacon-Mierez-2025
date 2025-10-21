// src/services/favoritosService.ts
import axios from 'axios';
import { getToken } from './authService';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export const obtenerFavoritos = async (): Promise<{
  id: number;
  titulo: string;
  autores: string[];
  categoria: string;
  rating: number;
  imagen: string;
  libroId: number;
  fechaAgregado: string;
  externalId: string;
  source: "hardcover" | "google";
}[]> => {
  const token = getToken();

  if (!token) {
    console.error("No se encontró token de autenticación.");
    return []; // Devuelve un array vacío si no hay token
  }

  const response = await api.get('/api/favoritos/mis-favoritos', {
    headers: { Authorization: `Bearer ${token}` }
  });

  return response.data; // Array con datos completos del libro
};

export const agregarFavorito = async (libroData: {
  id: string;
  titulo: string;
  descripcion: string | null;
  imagen: string | null;
  enlace: string | null;
  source: "hardcover" | "google";
}): Promise<number> => {
  const token = getToken();

  if (!token) {
    throw new Error("No se encontró token de autenticación.");
  }

  const response = await api.post('/api/favoritos', {
    libroData: {
      externalId: libroData.id,
      source: libroData.source,
      nombre: libroData.titulo,
      sinopsis: libroData.descripcion,
      imagen: libroData.imagen,
      enlace: libroData.enlace,
    }
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return response.data.id; // Return the favorite id
};

export const quitarFavorito = async (favoritoId: number) => {
  const token = getToken();

  if (!token) {
    throw new Error("No se encontró token de autenticación.");
  }

  await api.delete(`/api/favoritos/${favoritoId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
