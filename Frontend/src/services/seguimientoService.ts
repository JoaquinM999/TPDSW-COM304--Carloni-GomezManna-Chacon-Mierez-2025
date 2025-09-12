import { fetchWithRefresh } from '../utils/fetchWithRefresh';

export interface Usuario {
  id: number;
  username: string;
  email: string;
  nombre?: string;
  biografia?: string;
  ubicacion?: string;
  genero?: string;
  avatar?: string;
  rol: string;
  createdAt: string;
  updatedAt?: string;
}

export const seguimientoService = {
  async followUser(seguidoId: number): Promise<{ message: string }> {
    const response = await fetchWithRefresh('/seguimiento', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ seguidoId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al seguir al usuario');
    }

    return response.json();
  },

  async unfollowUser(seguidoId: number): Promise<{ message: string }> {
    const response = await fetchWithRefresh(`/seguimiento/${seguidoId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al dejar de seguir al usuario');
    }

    return response.json();
  },

  async getSeguidores(usuarioId: number): Promise<Usuario[]> {
    const response = await fetchWithRefresh(`/seguimiento/seguidores/${usuarioId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener seguidores');
    }

    return response.json();
  },

  async getSeguidos(): Promise<Usuario[]> {
    const response = await fetchWithRefresh('/seguimiento/seguidos');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener seguidos');
    }

    return response.json();
  },
};
