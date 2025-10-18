import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import LibroCard from "../componentes/LibroCard";
import { getResenasByLibro } from "../services/resenaService";

interface Libro {
  id: string;
  titulo: string;
  autores: string[];
  descripcion?: string;
  imagen: string | null;
  enlace: string | null;
  averageRating?: number;
}

export default function TodosLosLibros() {
  const location = useLocation();
  const [libros, setLibros] = useState<Libro[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load More
  const [pagina, setPagina] = useState<number>(1);
  const librosPorPagina = 8;
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [totalItems, setTotalItems] = useState<number | null>(null);

  // Búsqueda y debounce
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>(searchTerm);
  const [searchFilter, setSearchFilter] = useState<string>("todos");
  const debounceDelay = 300;
  const baseQuery = "subject:fantasy";

  // Hook para leer los parámetros de la URL
  const [searchParams] = useSearchParams();

  // Panel debug (visible en UI)
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [lastCount, setLastCount] = useState<number | null>(null);
  const [lastStartIndex, setLastStartIndex] = useState<number | null>(null);

  // Ordenamiento
  const [sortOrder, setSortOrder] = useState<'relevance' | 'rating_high_to_low'>('relevance');

  // Debounce simple para searchTerm -> debouncedSearchTerm
  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, debounceDelay);
    return () => window.clearTimeout(id);
  }, [searchTerm]);

  // 2. useEffect para leer los parámetros de la URL al cargar la página
  useEffect(() => {
    const filtroFromURL = searchParams.get('filtro');
    const terminoFromURL = searchParams.get('termino');

    // 3. Si existen, actualiza el estado del buscador
    if (filtroFromURL && terminoFromURL) {
      setSearchFilter(filtroFromURL);
      setSearchTerm(terminoFromURL);
    }
  }, []);

  // Cuando cambia la búsqueda, el filtro o el orden, se resetea la paginación.
  useEffect(() => {
    setPagina(1);
    setLibros([]);
    setHasMore(true);
  }, [debouncedSearchTerm, searchFilter, sortOrder]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchLibros = async () => {
      const isInitialLoad = pagina === 1;
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      try {
        // Construir query con prefijo según filtro seleccionado
        let q = "";
        if (debouncedSearchTerm && debouncedSearchTerm.length) {
          switch (searchFilter) {
            case "titulo":
              q = `intitle:${debouncedSearchTerm}`;
              break;
            case "autor":
              q = `inauthor:${debouncedSearchTerm}`;
              break;
            case "isbn":
              q = `isbn:${debouncedSearchTerm}`;
              break;
            case "tema":
              q = `subject:${debouncedSearchTerm}`;
              break;
            case "todos":
            default:
              q = debouncedSearchTerm;
              break;
          }
        } else {
          q = baseQuery;
        }

        const startIndex = (pagina - 1) * librosPorPagina;
        const cb = Date.now(); // cache buster
        const url = `http://localhost:3000/api/google-books/buscar?q=${encodeURIComponent(
          q
        )}&orderBy=relevance&maxResults=${librosPorPagina}&startIndex=${startIndex}&cb=${cb}`;

        // Guardar URL visible en UI para debug
        setLastUrl(url);
        setLastStartIndex(startIndex);

        const res = await fetch(url, { signal });
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
        const raw = await res.json();

        // Soportar varios shapes: array directo o { items, totalItems } o wrappers comunes
        let items: any[] = [];
        let total: number | null = null;

        if (Array.isArray(raw)) {
          items = raw;
        } else if (raw && Array.isArray(raw.items)) {
          items = raw.items;
          total = typeof raw.totalItems === "number" ? raw.totalItems : null;
        } else if (raw && Array.isArray(raw.results)) {
          items = raw.results;
        } else if (raw && Array.isArray(raw.books)) {
          items = raw.books;
        } else {
          // fallback: si no hay items, dejar vacío
          items = [];
        }

        // Mapeo seguro
        const mapped: Libro[] = items.map((it: any, idx: number) => {
          return {
            id: it.id ?? it._id ?? `${pagina}-${idx}-${it.title ?? it.titulo ?? "no-id"}`,
            titulo: it.titulo ?? it.title ?? it.volumeInfo?.title ?? "Título desconocido",
            autores:
              it.autores ??
              it.authors ??
              (it.volumeInfo?.authors as string[] | undefined) ??
              [],
            descripcion:
              it.descripcion ?? it.description ?? it.volumeInfo?.description ?? undefined,
            imagen:
              it.imagen ??
              it.image ??
              it.volumeInfo?.imageLinks?.thumbnail ??
              it.volumeInfo?.imageLinks?.smallThumbnail ??
              null,
            enlace: it.enlace ?? it.link ?? it.volumeInfo?.infoLink ?? null,
          };
        });

        // Always fetch ratings for all libros in parallel for hover display
        const ratingPromises = mapped.map(async (libro) => {
          try {
            const reviewsData = await getResenasByLibro(libro.id);
            const reviews = reviewsData?.reviews || [];
            const avgRating = reviews.length > 0
              ? reviews.reduce((sum: number, r: any) => sum + r.estrellas, 0) / reviews.length
              : 0;
            return { ...libro, averageRating: avgRating };
          } catch (err) {
            console.warn(`Error fetching ratings for ${libro.id}:`, err);
            return { ...libro, averageRating: 0 };
          }
        });
        const librosWithRatings = await Promise.all(ratingPromises);

        let finalLibros = librosWithRatings;
        if (sortOrder === 'rating_high_to_low') {
          // Sort: rated books first (descending), then unrated
          finalLibros = librosWithRatings.sort((a, b) => {
            const aRated = a.averageRating > 0;
            const bRated = b.averageRating > 0;
            if (aRated && !bRated) return -1;
            if (!aRated && bRated) return 1;
            return b.averageRating - a.averageRating;
          });
        }

        if (isInitialLoad) {
          setLibros(finalLibros);
        } else {
          setLibros((prev) => [...prev, ...finalLibros]);
        }
        setTotalItems(total);
        setLastCount(mapped.length);

        // Lógica mejorada de hasMore:
        // - Si conocemos total -> comparo startIndex + fetched < total
        // - Si NO conocemos total -> asumimos que hay más si la API devolvió al menos 1 item.
        if (total !== null) {
          const fetchedCount = startIndex + mapped.length;
          setHasMore(fetchedCount < total);
        } else {
          // importante: si la API devolvió 0 items, no hay más; si devolvió >0, habilitamos "Siguiente" para que pruebes.
          setHasMore(mapped.length > 0);
        }

        // logs en consola para debugging
        console.debug("Fetch URL:", url);
        console.debug("Mapped length:", mapped.length, "startIndex:", startIndex, "total:", total);
      } catch (err: any) {
        if (err?.name === "AbortError") {
          // request cancelado
          return;
        }
        setError(err?.message ?? "Error desconocido");
        if (pagina === 1) {
          setLibros([]);
        }
        setHasMore(false);
        setTotalItems(null);
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    };

    fetchLibros();
    return () => controller.abort();
  }, [debouncedSearchTerm, pagina, searchFilter, sortOrder]);

  // helper imagen válida
  const imagenValida = (img: string | null | undefined) =>
    !!img &&
    typeof img === "string" &&
    !img.toLowerCase().includes("image_not_available") &&
    !img.toLowerCase().includes("no_image") &&
    !img.toLowerCase().includes("nophoto");

  const totalPages = totalItems ? Math.ceil(totalItems / librosPorPagina) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 p-6">
      <header className="max-w-5xl mx-auto mb-6">
        <h2 className="text-center text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 via-blue-600 to-indigo-700">
            Explorador de Libros
          </span>
        </h2>
        <p className="text-center text-sm text-gray-600">
          Buscar por título, autor, ISBN o queries (ej: <code className="bg-white px-1 rounded">subject:fantasy</code>).
        </p>

        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="flex-shrink-0">
            <select
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="px-4 py-4 rounded-3xl border border-slate-200 shadow-lg bg-white focus:outline-none focus:ring-4 focus:ring-cyan-200 focus:border-cyan-400 transition-all duration-300 text-gray-700 font-medium min-w-[120px]"
            >
              <option value="todos">Todos</option>
              <option value="titulo">Título</option>
              <option value="autor">Autor</option>
              <option value="isbn">ISBN</option>
              <option value="tema">Tema</option>
            </select>
          </div>

          <div className="flex-shrink-0">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'relevance' | 'rating_high_to_low')}
              className="px-4 py-4 rounded-3xl border border-slate-200 shadow-lg bg-white focus:outline-none focus:ring-4 focus:ring-cyan-200 focus:border-cyan-400 transition-all duration-300 text-gray-700 font-medium min-w-[140px]"
            >
              <option value="relevance">Relevancia</option>
              <option value="rating_high_to_low">Mejor Calificado</option>
            </select>
          </div>

          <div className="w-full max-w-2xl relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <svg className="w-5 h-5 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                <circle cx="11" cy="11" r="6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <input
              type="text"
              placeholder="Buscar libros (ej: tolkien, subject:fantasy, 978014...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-4 rounded-3xl border border-slate-200 shadow-lg bg-white focus:outline-none focus:ring-4 focus:ring-cyan-200 focus:border-cyan-400 transition-all duration-300 text-gray-700 placeholder-gray-400"
            />

            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                title="Limpiar búsqueda"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-slate-100 transition-colors duration-200"
              >
                <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        {loading && libros.length === 0 && (
          <div className="flex justify-center items-center my-8">
            <DotLottieReact
              src="https://lottie.host/6d727e71-5a1d-461e-9434-c9e7eb1ae1d1/IWVmdeMHnT.lottie"
              loop
              autoplay
              style={{ width: 140, height: 140 }}
            />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 text-xl font-semibold mb-2">¡Oops! Algo salió mal</p>
            <p className="text-gray-600 text-lg">{error}</p>
          </div>
        )}

        {!loading && !error && libros.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-gray-700 text-xl font-semibold mb-2">No se encontraron libros</p>
            <p className="text-gray-500 text-lg">Intenta con otra búsqueda o términos diferentes</p>
          </div>
        )}

        {!error && libros.length > 0 && (
          <>
            <div className="grid gap-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {libros.map((libro) => (
                <Link key={libro.id} to={`/libro/${libro.id}`} state={{ from: location.pathname }} className="block">
                  <LibroCard
                    title={libro.titulo}
                    authors={libro.autores}
                    image={libro.imagen}
                    description={libro.descripcion}
                    rating={libro.averageRating}
                  />
                </Link>
              ))}
            </div>

            <div className="flex flex-col items-center gap-4 mt-8">
              {hasMore && (
                <button
                  onClick={() => setPagina((p) => p + 1)}
                  disabled={loadingMore}
                  className={`px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
                    loadingMore
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  }`}
                >
                  {loadingMore ? "Cargando más..." : "Cargar más libros"}
                </button>
              )}

              <div className="text-base text-gray-700 font-medium">
                {totalItems !== null ? (
                  <span>{totalItems.toLocaleString()} resultados totales</span>
                ) : (
                  <span>Libros cargados: {libros.length}</span>
                )}
              </div>
            </div>
          </>
        )}

        {/* Panel debug en acordeón */}
        <details className="mt-6 max-w-5xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100">
          <summary className="cursor-pointer p-6 text-lg font-semibold text-gray-800 hover:text-cyan-600 transition-colors duration-200 flex items-center justify-between">
            <span>🔧 Panel de Debug</span>
            <svg className="w-5 h-5 transform transition-transform duration-200 details-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>

          <div className="px-6 pb-6 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-semibold text-base mb-3 text-gray-800">📡 Información de Requests</h4>
                <div className="space-y-2 text-sm">
                  <div><strong className="text-gray-600">Last URL:</strong> <code className="break-all bg-gray-50 px-2 py-1 rounded text-xs font-mono">{lastUrl ?? "—"}</code></div>
                  <div><strong className="text-gray-600">startIndex:</strong> <span className="bg-blue-50 px-2 py-1 rounded text-xs font-mono">{lastStartIndex ?? "—"}</span></div>
                  <div><strong className="text-gray-600">Últimos items devueltos:</strong> <span className="bg-green-50 px-2 py-1 rounded text-xs font-mono">{lastCount ?? "—"}</span></div>
                </div>
              </div>

              <div className="flex-1">
                <h4 className="font-semibold text-base mb-3 text-gray-800">⚙️ Estado de la Aplicación</h4>
                <div className="space-y-2 text-sm">
                  <div><strong className="text-gray-600">loading:</strong> <span className={`px-2 py-1 rounded text-xs font-mono ${loading ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>{String(loading)}</span></div>
                  <div><strong className="text-gray-600">hasMore:</strong> <span className={`px-2 py-1 rounded text-xs font-mono ${hasMore ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{String(hasMore)}</span></div>
                  <div><strong className="text-gray-600">totalItems:</strong> <span className="bg-purple-50 px-2 py-1 rounded text-xs font-mono">{totalItems ?? "—"}</span></div>
                  <div><strong className="text-gray-600">query usada:</strong> <code className="break-all bg-indigo-50 px-2 py-1 rounded text-xs font-mono">{debouncedSearchTerm || baseQuery}</code></div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-800 leading-relaxed">
                💡 <strong>Consejo:</strong> Si el botón "Cargar más libros" queda deshabilitado aún cuando esperás más resultados,
                lo más probable es que tu backend esté ignorando el parámetro <code className="bg-white px-1 rounded">startIndex</code> o devolviendo siempre la misma lista.
                Copiá la <strong>Last URL</strong> y probala en el navegador (o en Postman) para ver la respuesta que está devolviendo el servidor.
              </p>
            </div>
          </div>
        </details>
      </main>
    </div>
  );
}
