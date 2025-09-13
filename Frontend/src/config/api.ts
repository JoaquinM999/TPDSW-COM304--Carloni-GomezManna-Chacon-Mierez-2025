// Configuración de la API
export const API_CONFIG = {
  BASE_URL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api',
  API_URL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000',
} as const;

// Helper function para construir URLs de API
export const buildApiUrl = (endpoint: string): string => {
  // Si el endpoint ya incluye /api, usar API_URL como base
  if (endpoint.startsWith('/api/')) {
    return `${API_CONFIG.API_URL}${endpoint}`;
  }
  // Si no, usar BASE_URL
  return `${API_CONFIG.BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// URLs específicas para diferentes servicios
export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: `${API_CONFIG.API_URL}/api/auth/login`,
  AUTH_REGISTER: `${API_CONFIG.API_URL}/api/auth/register`,
  AUTH_REFRESH: `${API_CONFIG.API_URL}/api/auth/refresh`,
  
  // Usuarios
  USUARIOS_ME: `${API_CONFIG.API_URL}/api/usuarios/me`,
  USUARIOS_CHECK_EXISTS: `${API_CONFIG.API_URL}/api/usuarios/check-exists`,
  
  // Libros
  LIBROS: `${API_CONFIG.API_URL}/api/libro`,
  LIBROS_BY_CATEGORIA: (categoriaId: number) => `${API_CONFIG.API_URL}/api/libro/categoria/${categoriaId}`,
  LIBRO_BY_ID: (id: number) => `${API_CONFIG.API_URL}/api/libro/${id}`,
  
  // Categorías
  CATEGORIAS: `${API_CONFIG.API_URL}/api/categoria`,
  
  // Favoritos
  FAVORITOS: `${API_CONFIG.API_URL}/api/favoritos`,
  FAVORITOS_BY_ID: (libroId: number) => `${API_CONFIG.API_URL}/api/favoritos/${libroId}`,
  
  // Reseñas
  RESENAS: `${API_CONFIG.API_URL}/api/resena`,
  
  // Listas
  LISTAS: '/api/lista',
  CONTENIDO_LISTA: (listaId: number) => `/api/contenidoLista/${listaId}`,
  CONTENIDO_LISTA_ADD: '/api/contenidoLista',
  CONTENIDO_LISTA_REMOVE: (listaId: number, libroId: number) => `/api/contenidoLista/${listaId}/${libroId}`,
} as const;
