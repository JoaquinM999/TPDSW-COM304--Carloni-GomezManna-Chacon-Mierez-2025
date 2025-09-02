import fetch from "node-fetch"; 

const HARDCOVER_API = "https://api.hardcover.app/v1/graphql"; 
const TOKEN = process.env.HARDCOVER_TOKEN as string; 

export interface HardcoverBook { 
  id: number; 
  title: string; 
  slug: string; 
  activities_count: number; 
  coverUrl: string | null; 
} 

interface HardcoverEdition { 
  image?: { url: string; width?: number; height?: number }; 
  language?: { id: number }; 
} 

// Elegir la mejor portada
function getBestCover(editions: HardcoverEdition[]): string | null { 
  let best: HardcoverEdition | null = null; 
  let bestSize = 0; 

  for (const ed of editions) { 
    const img = ed.image; 
    if (!img?.url || /placeholder|no_image|nophoto/i.test(img.url)) continue; 
    const isPreferredLang = ed.language?.id === 1; 
    const ratio = img.height && img.width ? img.height / img.width : 0; 
    const isRect = ratio >= 1.4 && ratio <= 2.5; 
    const size = (img.width || 0) * (img.height || 0); 

    if (!best || (isPreferredLang && isRect && size > bestSize) || (!best && size > bestSize)) { 
      best = ed; 
      bestSize = size; 
    } 
  } 

  if (!best) return null; 
  let url = best.image!.url; 
  url = url.replace(/w128|small|thumb/gi, "w800").replace(/_sm_/gi, "_lg_"); 
  return url; 
} 

// Fetch con retries exponenciales
async function fetchWithRetry(query: string, retries = 3, baseDelayMs = 500): Promise<any> { 
  if (!TOKEN) throw new Error("HARDCOVER_TOKEN no definido en .env"); 

  for (let attempt = 0; attempt <= retries; attempt++) { 
    try { 
      const res = await fetch(HARDCOVER_API, { 
        method: "POST", 
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${TOKEN}`, 
        }, 
        body: JSON.stringify({ query }), 
      }); 

      const text = await res.text(); 
      let json; 

      try { 
        json = JSON.parse(text); 
      } catch { 
        throw new Error(`Respuesta no es JSON: ${text.slice(0, 200)}...`); 
      } 

      if (!res.ok || json.errors) { 
        const msg = json?.errors?.map((e: any) => e.message).join(" | ") || `${res.status} ${res.statusText}`; 
        throw new Error(msg); 
      } 

      return json.data; 
    } catch (err) { 
      if (attempt < retries) { 
        const delay = baseDelayMs * Math.pow(2, attempt); 
        console.warn(`Hardcover fetch falló (intento ${attempt + 1}), reintentando en ${delay}ms...`, err); 
        await new Promise(r => setTimeout(r, delay)); 
      } else { 
        throw new Error(`Hardcover trending error: ${err}`); 
      } 
    } 
  } 
} 

// --- CACHE con TTL ---
interface CacheEntry { 
  data: HardcoverBook[]; 
  expiresAt: number; 
} 

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
let trendingCache: CacheEntry | null = null; 

// Función principal con cache + TTL
export async function getTrendingBooks(): Promise<HardcoverBook[]> { 
  const now = Date.now(); 

  // Devuelve cache si no expiró
  if (trendingCache && trendingCache.expiresAt > now) { 
    return trendingCache.data; 
  } 

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

  const data = await fetchWithRetry(query); 
  const books: HardcoverBook[] = data.books.map((book: any) => ({ 
    id: book.id, 
    title: book.title, 
    slug: book.slug, 
    activities_count: book.activities_count, 
    coverUrl: getBestCover(book.editions), 
  })); 

  // Guardar en cache con TTL
  trendingCache = { data: books, expiresAt: now + CACHE_TTL_MS }; 

  return books; 
}
