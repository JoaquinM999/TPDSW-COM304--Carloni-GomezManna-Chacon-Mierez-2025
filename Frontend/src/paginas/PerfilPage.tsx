import { useEffect, useState } from 'react';
import axios from 'axios';

const PerfilPage = () => {
  const [perfil, setPerfil] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    axios.get('http://localhost:3000/perfil', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      setPerfil(res.data);
    })
    .catch((err) => {
      setError(err.response?.data?.error || 'Error al cargar perfil');
    });
  }, []);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!perfil) return <p>Cargando perfil...</p>;

  return (
    <div>
      <h2>Bienvenido, {perfil.usuario.email}</h2>
      <p>ID de usuario: {perfil.usuario.id}</p>
      <p>Creado en: {perfil.usuario.created_at}</p>
    </div>
  );
};

export default PerfilPage;
