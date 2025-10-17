// src/services/favoritosService.ts

export const obtenerFavoritos = async (): Promise<{ id: number; externalId: string; source: string }[]> => {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('No hay token de autenticación');

  const response = await fetch('http://localhost:3000/api/favoritos/mis-favoritos', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error('Error al obtener favoritos');
  const data = await response.json();
  return data; // Ya viene como array de objetos { id, externalId, source }
};

export const agregarFavorito = async (libroData: {
  id: string;
  titulo: string;
  descripcion: string | null;
  imagen: string | null;
  enlace: string | null;
  source: "hardcover" | "google";
}): Promise<number> => {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('No hay token de autenticación');

  const res = await fetch('http://localhost:3000/api/favoritos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    // SOLO ENVIAMOS LOS DATOS DEL LIBRO. El back-end sabe quién es el usuario.
    body: JSON.stringify({
      libroData: {
        externalId: libroData.id,
        source: libroData.source,
        nombre: libroData.titulo,
        sinopsis: libroData.descripcion,
        imagen: libroData.imagen,
        enlace: libroData.enlace,
      }
    }),
  });
  if (!res.ok) throw new Error('Error al agregar favorito');
  const data = await res.json();
  return data.id; // Return the favorite id
};

export const quitarFavorito = async (libroId: number) => {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('No hay token de autenticación');

  // La URL ahora es más simple y segura.
  const res = await fetch(`http://localhost:3000/api/favoritos/${libroId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al quitar favorito');
};
