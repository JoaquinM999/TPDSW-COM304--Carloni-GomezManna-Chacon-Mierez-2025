// src/componentes/ReseñaList.tsx
import React from 'react';

const ReseñaList = ({ reseñas }: { reseñas: any[] }) => {
  if (reseñas.length === 0) return <p>No hay reseñas aún.</p>;

  return (
    <ul>
      {reseñas.map((res) => (
        <li key={res.id}>
          <strong>{res.usuario?.username || 'Anónimo'}:</strong> {res.comentario} ({res.estrellas} ⭐)
        </li>
      ))}
    </ul>
  );
};

export default ReseñaList;
