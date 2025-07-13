// src/services/favoritosService.ts
export const obtenerFavoritos = async (): Promise<number[]> => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:3000/api/favoritos', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error('Error al obtener favoritos');
  const data = await response.json();
  return data.map((fav: any) => fav.libro.id); // Ajustar según respuesta real del backend
};

export const agregarFavorito = async (libroId: number) => {
  const token = localStorage.getItem('accessToken');
  const res = await fetch('http://localhost:3000/api/favoritos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ libroId }),
  });
  if (!res.ok) throw new Error('Error al agregar favorito');
};

export const quitarFavorito = async (libroId: number) => {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`http://localhost:3000/api/favoritos/${libroId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al quitar favorito');
};
