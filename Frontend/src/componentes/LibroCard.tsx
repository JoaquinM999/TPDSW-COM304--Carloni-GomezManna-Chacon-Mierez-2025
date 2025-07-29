/* import React from 'react'; */

interface LibroProps {
  nombre: string;
  sinopsis: string;
}

const LibroCard = ({ nombre, sinopsis }: LibroProps) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '12px', margin: '10px', borderRadius: '6px' }}>
      <h3>{nombre}</h3>
      <p>{sinopsis}</p>
    </div>
  );
};

export default LibroCard;
