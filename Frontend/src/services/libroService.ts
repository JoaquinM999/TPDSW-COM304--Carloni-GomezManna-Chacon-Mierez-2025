// src/services/libroService.ts
import { API_ENDPOINTS } from '../config/api';

// 👉 Obtener libros por IDs (para favoritos, listas, etc.)
export const getLibrosPorIds = async (ids: number[]) => {
  const promesas = ids.map(id =>
    fetch(API_ENDPOINTS.LIBRO_BY_ID(id)).then(res => {
      if (!res.ok) throw new Error('Error al cargar libro ' + id);
      return res.json();
    })
  );
  return Promise.all(promesas);
};

// ✅ Obtener libros por categoría
export const getLibrosPorCategoria = async (categoriaId: number) => {
  const response = await fetch(API_ENDPOINTS.LIBROS_BY_CATEGORIA(categoriaId));
  if (!response.ok) {
    throw new Error('No se pudieron cargar los libros por categoría');
  }
  return await response.json();
};
