// src/paginas/DetalleLibro.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { obtenerReseñas } from '../services/resenaService';
import { obtenerFavoritos, agregarFavorito, quitarFavorito } from '../services/favoritosService';
import ReseñaList from '../componentes/ResenaList';
import NuevaReseñaForm from '../componentes/NuevaResenaForm';

const DetalleLibro = () => {
  const { id } = useParams<{ id: string }>();
  const libroId = Number(id);
  const [reseñas, setReseñas] = useState([]);
  const [esFavorito, setEsFavorito] = useState(false);

  const cargarReseñas = async () => {
    try {
      const data = await obtenerReseñas(libroId);
      setReseñas(data);
    } catch (err) {
      console.error('Error cargando reseñas');
    }
  };

  const verificarFavorito = async () => {
    try {
      const favoritos = await obtenerFavoritos();
      setEsFavorito(favoritos.includes(libroId));
    } catch (error) {
      console.error('Error al verificar favoritos');
    }
  };

  const alternarFavorito = async () => {
    try {
      if (esFavorito) {
        await quitarFavorito(libroId);
        setEsFavorito(false);
      } else {
        await agregarFavorito(libroId);
        setEsFavorito(true);
      }
    } catch (error) {
      alert('Error al modificar favoritos');
    }
  };

  useEffect(() => {
    if (libroId) {
      cargarReseñas();
      verificarFavorito();
    }
  }, [libroId]);

  return (
    <div>
      <h2>Detalle del Libro {libroId}</h2>

      <button onClick={alternarFavorito}>
        {esFavorito ? 'Quitar de Favoritos 💔' : 'Agregar a Favoritos ❤️'}
      </button>

      <NuevaReseñaForm libroId={libroId} onReseñaAgregada={cargarReseñas} />
      <ReseñaList reseñas={reseñas} />
    </div>
  );
};

export default DetalleLibro;
