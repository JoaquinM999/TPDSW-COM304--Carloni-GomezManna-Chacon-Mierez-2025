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
  lista: { id: number };
  libro: {
    id: number;
    titulo: string;
    autores: string[];
    imagenPortada: string;
    categoria: { nombre: string };
    ratingPromedio: number;
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

  async addLibroALista(listaId: number, libroId: number): Promise<void> {
    const response = await fetchWithRefresh('/api/contenido-lista', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ listaId, libroId }),
    });
    if (!response.ok) throw new Error('Error al agregar libro a lista');
  },

  async removeLibroDeLista(listaId: number, libroId: number): Promise<void> {
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
};
