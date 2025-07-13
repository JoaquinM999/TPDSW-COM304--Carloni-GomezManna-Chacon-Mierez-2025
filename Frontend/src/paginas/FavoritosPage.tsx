// src/paginas/FavoritosPage.tsx
import React, { useEffect, useState } from 'react';
import { obtenerFavoritos } from '../services/favoritosService';
import { getLibrosPorIds } from '../services/libroService';
import LibroCard from '../componentes/LibroCard';

interface Libro {
  id: number;
  nombre: string;
  sinopsis: string;
}

const FavoritosPage = () => {
  const [librosFavoritos, setLibrosFavoritos] = useState<Libro[]>([]); // 👈 fijate acá

  useEffect(() => {
    const cargarFavoritos = async () => {
      try {
        const favoritosIds = await obtenerFavoritos();
        if (favoritosIds.length === 0) {
          setLibrosFavoritos([]);
          return;
        }
        const libros = await getLibrosPorIds(favoritosIds);
        setLibrosFavoritos(libros);
      } catch (error) {
        console.error('Error cargando favoritos', error);
      }
    };

    cargarFavoritos();
  }, []);

  if (librosFavoritos.length === 0) {
    return <p>No tenés libros favoritos aún.</p>;
  }

  return (
    <div>
      <h2>Mis Libros Favoritos</h2>
      {librosFavoritos.map((libro) => (
        <LibroCard key={libro.id} nombre={libro.nombre} sinopsis={libro.sinopsis} />
      ))}
    </div>
  );
};

export default FavoritosPage;
