import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getLibrosPorCategoria } from '../services/libroService';
import LibroCard from '../componentes/LibroCard';

interface Libro {
  id: number;
  nombre: string;
  sinopsis: string;
}

const LibrosPorCategoria = () => {
  const { categoriaId } = useParams<{ categoriaId: string }>();
  const [libros, setLibros] = useState<Libro[]>([]);

  useEffect(() => {
    if (categoriaId) {
      getLibrosPorCategoria(Number(categoriaId))
        .then(setLibros)
        .catch((err) => console.error(err));
    }
  }, [categoriaId]);

  return (
    <div>
      <h2>Libros de la Categoría {categoriaId}</h2>
      {libros.map((libro) => (
        <LibroCard key={libro.id} nombre={libro.nombre} sinopsis={libro.sinopsis} />
      ))}
    </div>
  );
};

export default LibrosPorCategoria;
