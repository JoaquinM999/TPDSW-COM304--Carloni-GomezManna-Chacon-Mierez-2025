import fetch, { RequestInit } from "node-fetch";
import redis from "../redis";

const HARDCOVER_API = "https://api.hardcover.app/v1/graphql";
const TOKEN = process.env.HARDCOVER_TOKEN;
if (!TOKEN) console.warn("HARDCOVER_TOKEN no definido. Algunas funciones fallarán.");

export interface HardcoverBook {
  id: number;
  title: string;
  slug: string;
  activities_count: number;
  coverUrl: string | null;
}

interface HardcoverEdition {
  image?: { url: string; width?: number; height?: number };
  language?: { id?: number };
}

// --- util: evita placeholders comunes ---
const isPlaceholderUrl = (url?: string) =>
  !url || /placeholder|no_image|nophoto|default_cover/i.test(url);

// --- Scoring simple para elegir mejor portada ---
function getBestCover(editions: HardcoverEdition[]): string | null {
  let bestUrl: string | null = null;
  let bestScore = -Infinity;

  for (const ed of editions || []) {
    const img = ed.image;
    if (!img?.url || isPlaceholderUrl(img.url)) continue;

    const width = img.width ?? 0;
    const height = img.height ?? 0;
    const size = width * height; // proxy de resolución
    const ratio = width > 0 ? height / width : 0;
    const portraitBonus = ratio >= 1.2 && ratio <= 2.5 ? 1.0 : 0; // favorece retrato
    const langBonus = ed.language?.id === 1 ? 1_000_000 : 0; // preferir idioma id=1 (ejemplo)
    // score: combina tamaño + idioma + forma
    const score = Math.log1p(size) * (1 + portraitBonus) + langBonus;

    if (score > bestScore) {
      bestScore = score;
      bestUrl = img.url!;
    }
  }

  if (!bestUrl) return null;

  // Intentar transformar tamaño de forma segura:
  // reemplazar segmentos tipo "/wNNN" por "/w800" si aparecen como segmento
  try {
    bestUrl = bestUrl.replace(/\/w\d+(?=\/|$)/i, "/w800");
    // si tiene query like ?width=128 -> reemplazar con la misma clave + nuevo valor
    bestUrl = bestUrl.replace(/([?&]width=)\d+/i, (m, p1) => `${p1}800`);
  } catch {
    // fallback: devolver la URL original si la manipulación falla
  }

  return bestUrl;
}

// --- Retry con timeout, comprobación de content-type y jitter ---
async function fetchWithRetry(
  query: string,
  {
    retries = 3,
    baseDelayMs = 500,
    timeoutMs = 15_000, // aumentado por defecto a 15s
  }: { retries?: number; baseDelayMs?: number; timeoutMs?: number } = {}
): Promise<any> {
  if (!TOKEN) throw new Error("HARDCOVER_TOKEN no definido en .env");

  let currentTimeout = timeoutMs;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), currentTimeout);

    try {
      const res = await fetch(HARDCOVER_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ query }),
        signal: controller.signal,
        // node-fetch sigue redirecciones por defecto; si necesitás cambiarlo pon `redirect: 'follow'`
      } as RequestInit);

      clearTimeout(timer);

      // lee el texto (por si viene HTML o JSON mal formado)
      const text = await res.text();
      const contentType = (res.headers && res.headers.get && res.headers.get("content-type")) || "";

      // Si no es JSON, no intentar parsear: lanzamos error con contexto
      if (!/application\/json/i.test(contentType)) {
        const snippet = text ? text.slice(0, 1000) : "<empty body>";
        const msg = `Non-JSON response from Hardcover. status=${res.status} ${res.statusText} url=${(res as any).url || "unknown"} content-type=${contentType} body_snippet=${snippet}`;
        // Si es HTML (probablemente una página de error/protección), no reintentamos múltiples veces:
        throw new Error(msg);
      }

      // parse JSON
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(`Respuesta JSON inválida (primeros 1000 chars): ${text.slice(0, 1000)}`);
      }

      // GraphQL errors o HTTP not-ok
      if (!res.ok || json.errors) {
        const msg =
          (json?.errors && json.errors.map((e: any) => e.message).join(" | ")) ||
          `${res.status} ${res.statusText}`;
        if (res.status >= 400 && res.status < 500) {
          throw new Error(`Hardcover client error: ${msg}`);
        }
        throw new Error(`Hardcover server error: ${msg}`);
      }

      return json.data;
    } catch (err: any) {
      clearTimeout(timer);
      const errStr = String(err);
      const isAbort = err?.name === "AbortError" || /aborted|abort/i.test(errStr);
      const isNonJson = /Non-JSON response|Respuesta JSON inválida/i.test(errStr);

      // Si es error cliente (401/403) no reintentar
      if (/401|403|client error/i.test(errStr)) {
        console.error("Hardcover client error (no reintentar):", errStr);
        throw err;
      }

      // Si recibimos HTML u otra respuesta no-JSON, no reintentamos múltiples veces:
      if (isNonJson) {
        console.error("Non-JSON response detected, abortando reintentos:", errStr);
        throw err;
      }

      if (attempt < retries) {
        // backoff exponencial + jitter
        const backoff = baseDelayMs * Math.pow(2, attempt);
        const jitter = Math.floor(Math.random() * baseDelayMs);
        const delay = backoff + jitter;

        if (isAbort) {
          console.warn(
            `Hardcover fetch abortado (intento ${attempt + 1}/${retries + 1}). timeout=${currentTimeout}ms. Reintentando en ${delay}ms...`
          );
        } else {
          console.warn(
            `Hardcover fetch fallo (intento ${attempt + 1}/${retries + 1}): ${errStr}. Reintentando en ${delay}ms...`
          );
        }

        // esperar y aumentar ligeramente el timeout para el próximo intento (cap a 60s)
        await new Promise((r) => setTimeout(r, delay));
        currentTimeout = Math.min(Math.round(currentTimeout * 1.5), 60_000);
      } else {
        const finalMsg = `Hardcover trending error: ${errStr}`;
        console.error(finalMsg);
        throw new Error(finalMsg);
      }
    } finally {
      clearTimeout(timer);
    }
  }
}

// --- Cache híbrido mejor: Map simple + in-flight dedupe ---
const CACHE_KEY = "hardcover:trending";
const CACHE_TTL_SEC = 300;
const MAX_MEM_ENTRIES = 200;
const memoryCache = new Map<string, { data: HardcoverBook[]; expiresAt: number }>();
const inFlight = new Map<string, Promise<HardcoverBook[]>>();

export async function getTrendingBooks(): Promise<HardcoverBook[]> {
  const now = Date.now();

  // memoria
  const mem = memoryCache.get(CACHE_KEY);
  if (mem && mem.expiresAt > now) return mem.data;
  if (mem && mem.expiresAt <= now) memoryCache.delete(CACHE_KEY);

  // dedupe peticiones concurrentes
  if (inFlight.has(CACHE_KEY)) return inFlight.get(CACHE_KEY)!;

  const p = (async (): Promise<HardcoverBook[]> => {
    // primer intento: leer redis (fast path)
    if (redis) {
      try {
        const cached = await redis.get(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as HardcoverBook[];
          memoryCache.set(CACHE_KEY, { data: parsed, expiresAt: now + CACHE_TTL_SEC * 1000 });
          if (memoryCache.size > MAX_MEM_ENTRIES) {
            const oldest = memoryCache.keys().next().value;
            if (typeof oldest === "string") memoryCache.delete(oldest);
          }
          return parsed;
        }
      } catch (err) {
        console.error("Redis get error:", String(err));
      }
    }

    // fetch GraphQL
    const query = `
      query {
        books(order_by: {activities_count: desc}, limit: 20) {
          id
          title
          slug
          activities_count
          editions {
            image { url width height }
            language { id }
          }
        }
      }
    `;

    // Intentamos obtener datos de la API; si falla con non-JSON, hacemos fallback a Redis (si está disponible)
    let data;
    try {
      data = await fetchWithRetry(query);
    } catch (err: any) {
      console.error("fetchWithRetry falló:", String(err));

      // intentar fallback a Redis una vez más por si otro proceso actualizó la cache
      if (redis) {
        try {
          const cached = await redis.get(CACHE_KEY);
          if (cached) {
            const parsed = JSON.parse(cached) as HardcoverBook[];
            memoryCache.set(CACHE_KEY, { data: parsed, expiresAt: now + CACHE_TTL_SEC * 1000 });
            if (memoryCache.size > MAX_MEM_ENTRIES) {
              const oldest = memoryCache.keys().next().value;
              if (typeof oldest === "string") memoryCache.delete(oldest);
            }
            console.warn("Usando fallback de Redis tras error en la API.");
            return parsed;
          }
        } catch (rErr) {
          console.error("Redis get fallback error:", String(rErr));
        }
      }

      // si no hay fallback, propaga el error
      throw err;
    }

    if (!data || !Array.isArray(data.books)) {
      // no cachee resultados vacíos completos; devolver [] y no cachear, o cachear por menos tiempo si preferís
      return [];
    }

    const books: HardcoverBook[] = data.books.map((b: any) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      activities_count: b.activities_count,
      coverUrl: getBestCover(b.editions || []),
    }));

    // guardar en memoria
    memoryCache.set(CACHE_KEY, { data: books, expiresAt: now + CACHE_TTL_SEC * 1000 });
    if (memoryCache.size > MAX_MEM_ENTRIES) {
      const oldest = memoryCache.keys().next().value;
      if (typeof oldest === "string") {
        memoryCache.delete(oldest);
      }
    }

    // guardar en redis con EX
    if (redis) {
      try {
        await redis.set(CACHE_KEY, JSON.stringify(books), "EX", CACHE_TTL_SEC);
      } catch (err) {
        console.error("Redis set error:", String(err));
      }
    }

    return books;
  })();

  inFlight.set(CACHE_KEY, p);
  p.finally(() => inFlight.delete(CACHE_KEY));
  return p;
}
