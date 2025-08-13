// src/services/libroService.ts

// 👉 Obtener libros por IDs (para favoritos, listas, etc.)
export const getLibrosPorIds = async (ids: number[]) => {
  const promesas = ids.map(id =>
    fetch(`http://localhost:3000/api/libro/${id}`).then(res => {
      if (!res.ok) throw new Error('Error al cargar libro ' + id);
      return res.json();
    })
  );
  return Promise.all(promesas);
};

// ✅ Obtener libros por categoría
export const getLibrosPorCategoria = async (categoriaId: number) => {
  const response = await fetch(`http://localhost:3000/api/libro/categoria/${categoriaId}`);
  if (!response.ok) {
    throw new Error('No se pudieron cargar los libros por categoría');
  }
  return await response.json();
};
