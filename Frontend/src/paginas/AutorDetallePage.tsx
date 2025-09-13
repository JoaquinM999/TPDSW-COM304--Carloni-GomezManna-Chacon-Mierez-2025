import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface AutorDetalle {
  id: string;
  nombre: string;
  apellido: string;
  bio?: string;
  libros: number;
}

const AutorDetallePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [autor, setAutor] = useState<AutorDetalle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  if (!id) {
    return <div className="text-center py-6">ID de autor inválido</div>;
  }

  const authorId = id;

  useEffect(() => {
    const fetchAutorDetalle = async () => {
      try {
        const response = await axios.get(`/api/open-library/authors/${authorId}`);
        const data = response.data;
        setAutor({
          id: authorId,
          nombre: data.name ? data.name.split(' ')[0] : '',
          apellido: data.name ? data.name.split(' ').slice(1).join(' ') : '',
          bio: typeof data.bio === 'string' ? data.bio : (data.bio?.value ?? ''),
          libros: data.work_count || 0,
        });
      } catch (err: any) {
        setError(err.message || 'Error al cargar detalles del autor');
      } finally {
        setLoading(false);
      }
    };
    fetchAutorDetalle();
  }, [id]);

  if (loading) {
    return <div className="text-center py-6">Cargando detalles del autor...</div>;
  }

  if (error) {
    return <div className="text-center py-6 text-red-600">Error: {error}</div>;
  }

  if (!autor) {
    return <div className="text-center py-6">Autor no encontrado</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-4">{autor.nombre} {autor.apellido}</h1>
      {autor.bio && <p className="mb-4">{autor.bio}</p>}
      <p>Libros publicados: {autor.libros}</p>
    </div>
  );
};

export default AutorDetallePage;
