import fetch, { RequestInit } from "node-fetch";
import redis from "../redis";

const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const CACHE_KEY_PREFIX = "google:books:";
const CACHE_TTL_SEC = 300; // 5 minutos
const MAX_MEM_ENTRIES = 200; // límite simple en memoria
const FETCH_TIMEOUT_MS = 6_000; // timeout fetch

type BookResult = {
  id: string;
  titulo: string;
  autores: string[];
  descripcion: string | null;
  imagen: string | null;
  enlace: string | null;
};

// Map mantiene orden de inserción -> permite eliminación LRU simple
const memoryCache = new Map<string, { data: BookResult[]; expiresAt: number }>();

// Para evitar múltiples fetches concurrentes para la misma query
const inFlightRequests = new Map<string, Promise<BookResult[]>>();

// Normaliza la query para generar cache keys más estables
const normalizeQuery = (q: string) => q.trim().toLowerCase();

const makeCacheKey = (q: string) => `${CACHE_KEY_PREFIX}${encodeURIComponent(q)}`;

export const buscarLibro = async (rawQuery: string): Promise<BookResult[]> => {
  if (!rawQuery) return [];

  if (!API_KEY) {
    console.warn("GOOGLE_BOOKS_API_KEY no está definido. La búsqueda puede fallar o estar limitada.");
  }

  const query = normalizeQuery(rawQuery);
  const cacheKey = makeCacheKey(query);
  const now = Date.now();

  // 0️⃣ Si hay una petición en vuelo, reusa su Promise
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const promise = (async (): Promise<BookResult[]> => {
    // 1️⃣ Cache en memoria (Map)
    const mem = memoryCache.get(cacheKey);
    if (mem && mem.expiresAt > now) {
      return mem.data;
    } else if (mem && mem.expiresAt <= now) {
      // entry expirada -> eliminar
      memoryCache.delete(cacheKey);
    }

    // 2️⃣ Cache Redis
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          const parsed: BookResult[] = JSON.parse(cached);
          // refrescar cache en memoria
          memoryCache.set(cacheKey, { data: parsed, expiresAt: now + CACHE_TTL_SEC * 1000 });
          // mantener tamaño límite LRU simple
          if (memoryCache.size > MAX_MEM_ENTRIES) {
            const oldestKey = memoryCache.keys().next().value;
            if (oldestKey !== undefined) {
              memoryCache.delete(oldestKey);
            }
          }
          return parsed;
        }
      } catch (err) {
        console.error("Redis get error:", err);
        // continúa a fetch
      }
    }

    // 3️⃣ Fetch desde Google Books (con timeout y chequeo de status)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const url = `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=40${API_KEY ? `&key=${API_KEY}` : ""}`;
      const res = await fetch(url, { signal: controller.signal } as RequestInit);
      clearTimeout(timeout);

      if (!res.ok) {
        console.error(`Google Books API returned ${res.status} ${res.statusText}`);
        return [];
      }

      const data = (await res.json()) as { items?: any[] } | null;
      const items = (data && data.items) || [];

      const results: BookResult[] = items.map((item: any) => ({
        id: item.id,
        titulo: item.volumeInfo?.title || "Título desconocido",
        autores: item.volumeInfo?.authors || [],
        descripcion: item.volumeInfo?.description || null,
        imagen: item.volumeInfo?.imageLinks?.thumbnail || null,
        enlace: item.volumeInfo?.infoLink || null,
      }));

      const expiresAt = Date.now() + CACHE_TTL_SEC * 1000;

      // Guardar en memoria (LRU simple)
      memoryCache.set(cacheKey, { data: results, expiresAt });
      if (memoryCache.size > MAX_MEM_ENTRIES) {
        const oldestKey = memoryCache.keys().next().value;
        if (oldestKey !== undefined) {
          memoryCache.delete(oldestKey);
        }
      }

      // Guardar en Redis (usando set + EX)
      if (redis) {
        try {
          // añadir pequeño jitter al TTL para reducir stampedes si querés
          await redis.set(cacheKey, JSON.stringify(results), "EX", CACHE_TTL_SEC);
        } catch (err) {
          console.error("Redis set error:", err);
        }
      }

      return results;
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.error("Fetch timed out for query:", query);
      } else {
        console.error("Error buscando libro:", err);
      }
      return [];
    } finally {
      clearTimeout(timeout);
    }
  })();

  // almacena la promesa en vuelo y la limpia cuando termina
  inFlightRequests.set(cacheKey, promise);
  promise.finally(() => inFlightRequests.delete(cacheKey));

  return promise;
};
