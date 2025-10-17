// src/services/favoritosService.ts
import axios from 'axios';

export const obtenerFavoritos = async (): Promise<{ id: number; externalId: string; source: string }[]> => {
  const response = await axios.get('http://localhost:3000/api/favoritos/mis-favoritos');

  return response.data; // Ya viene como array de objetos { id, externalId, source }
};

export const agregarFavorito = async (libroData: {
  id: string;
  titulo: string;
  descripcion: string | null;
  imagen: string | null;
  enlace: string | null;
  source: "hardcover" | "google";
}): Promise<number> => {
  const response = await axios.post('http://localhost:3000/api/favoritos', {
    libroData: {
      externalId: libroData.id,
      source: libroData.source,
      nombre: libroData.titulo,
      sinopsis: libroData.descripcion,
      imagen: libroData.imagen,
      enlace: libroData.enlace,
    }
  });

  return response.data.id; // Return the favorite id
};

export const quitarFavorito = async (libroId: number) => {
  await axios.delete(`http://localhost:3000/api/favoritos/${libroId}`);
};
