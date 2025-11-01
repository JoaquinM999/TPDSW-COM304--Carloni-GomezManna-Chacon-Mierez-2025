/**
 * Servicio para obtener estadísticas de la plataforma
 * Proporciona métricas para el HeroSection
 */

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export interface PlatformStats {
  librosResenados: number;
  reseniasTotales: number;
  lectoresActivos: number;
  librosFavoritos: number;
}

/**
 * Obtiene las estadísticas principales de la plataforma
 */
export const getStats = async (): Promise<PlatformStats> => {
  try {
    const response = await fetch(`${API_URL}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Stats API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    
    // Fallback a valores por defecto si falla la API
    return {
      librosResenados: 50000,
      reseniasTotales: 250000,
      lectoresActivos: 15000,
      librosFavoritos: 180000,
    };
  }
};

/**
 * Obtiene estadísticas con caché local para mejorar performance
 */
export const getCachedStats = (): PlatformStats | null => {
  try {
    const cached = localStorage.getItem('platform_stats');
    const timestamp = localStorage.getItem('platform_stats_timestamp');
    
    if (!cached || !timestamp) return null;
    
    const cacheTime = parseInt(timestamp);
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
    
    // Si el cache es muy viejo, retornar null
    if (now - cacheTime > CACHE_DURATION) {
      return null;
    }
    
    return JSON.parse(cached);
  } catch (error) {
    console.error('Error reading cached stats:', error);
    return null;
  }
};

/**
 * Guarda estadísticas en caché local
 */
export const setCachedStats = (stats: PlatformStats): void => {
  try {
    localStorage.setItem('platform_stats', JSON.stringify(stats));
    localStorage.setItem('platform_stats_timestamp', Date.now().toString());
  } catch (error) {
    console.error('Error caching stats:', error);
  }
};

/**
 * Obtiene estadísticas con caché automático
 */
export const getStatsWithCache = async (): Promise<PlatformStats> => {
  // Intentar primero con caché
  const cached = getCachedStats();
  if (cached) {
    console.log('Using cached stats');
    
    // Actualizar en background
    getStats().then(freshStats => {
      setCachedStats(freshStats);
    }).catch(err => {
      console.error('Background stats update failed:', err);
    });
    
    return cached;
  }
  
  // Si no hay caché, obtener fresh y cachear
  const freshStats = await getStats();
  setCachedStats(freshStats);
  return freshStats;
};
