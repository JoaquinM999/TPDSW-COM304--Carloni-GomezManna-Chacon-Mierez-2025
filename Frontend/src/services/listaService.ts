import { fetchWithRefresh } from '../utils/fetchWithRefresh';

export interface Lista {
  id: number;
  nombre: string;
  tipo: 'read' | 'to_read' | 'pending' | 'custom';
  createdAt: string;
  ultimaModificacion: string;
  usuario: { id: number; username: string };
}

export interface ContenidoLista {
  id: number;
  createdAt: string;
  lista: { id: number; tipo: string };
  libro: {
    id: number;
    nombre: string;
    autor?: { nombre: string };
    autores: string[];
    imagen: string;
    categoria: { nombre: string };
    ratingLibro?: { avgRating: number };
  };
}

export const listaService = {
  async getUserListas(): Promise<Lista[]> {
    const response = await fetchWithRefresh('/api/lista', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Error al obtener listas');
    return response.json();
  },

  async createLista(nombre: string, tipo: string): Promise<Lista> {
    const response = await fetchWithRefresh('/api/lista', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre, tipo }),
    });
    if (!response.ok) throw new Error('Error al crear lista');
    return response.json();
  },

  async getContenidoLista(listaId: number): Promise<ContenidoLista[]> {
    const response = await fetchWithRefresh(`/api/contenido-lista/${listaId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Error al obtener contenido de lista');
    return response.json();
  },

  async addLibroALista(listaId: number, libro: { id: string; titulo: string; autores: string[]; descripcion: string | null; imagen: string | null; enlace: string | null; source: 'hardcover' | 'google' }): Promise<void> {
    const response = await fetchWithRefresh('/api/contenido-lista', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ listaId, libro }),
    });

    if (!response.ok) {
      // Lee el cuerpo del error desde el servidor
      const errorData = await response.json();
      // Muestra el mensaje de error real en la consola
      console.error("Error del servidor:", errorData);
      // Lanza un error más descriptivo
      throw new Error(errorData.error || 'Error al agregar libro a lista');
    }
  },

  async removeLibroDeLista(listaId: number, libroId: string): Promise<void> {
    const response = await fetchWithRefresh(`/api/contenido-lista/${listaId}/${libroId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Error al remover libro de lista');
  },

  async getListasByUsuario(userId: number): Promise<Lista[]> {
    const response = await fetchWithRefresh(`/api/lista?usuarioId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Error al obtener listas del usuario');
    return response.json();
  },

  async getListasContainingBook(libroId: string): Promise<number[]> {
    const response = await fetchWithRefresh(`/api/libro/${libroId}/listas`);
    if (!response.ok) {
      throw new Error('Error al obtener las listas del libro');
    }
    return response.json(); // Devuelve el array de IDs
  },

  async getAllUserContenido(): Promise<ContenidoLista[]> {
    const response = await fetchWithRefresh('/api/contenido-lista/user/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Error al obtener todo el contenido del usuario');
    return response.json();
  },
};
