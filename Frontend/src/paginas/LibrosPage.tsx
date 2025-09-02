import { useEffect, useState } from "react";

interface Libro {
  id: string;
  titulo: string;
  autores: string[];
  descripcion?: string;
  imagen: string | null;
  enlace: string | null;
}

interface LibroTrending {
  id: string;
  title: string;
  slug: string;
  activities_count: number;
  coverUrl: string | null; // cambiamos 'image' por 'coverUrl'
}

export default function TodosLosLibros() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [trending, setTrending] = useState<LibroTrending[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorTrending, setErrorTrending] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const librosPorPagina = 8;

  // Google Books
  useEffect(() => {
    const fetchLibros = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:3000/api/google-books/buscar?q=subject:fantasy&orderBy=relevance&maxResults=40&startIndex=${
            (pagina - 1) * librosPorPagina
          }`
        );
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        const data: Libro[] = await res.json();
        setLibros(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLibros();
  }, [pagina]);

  // Trending Hardcover
  useEffect(() => {
    const fetchTrending = async () => {
      setLoadingTrending(true);
      try {
        const res = await fetch("http://localhost:3000/api/hardcover/trending");
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        const data = await res.json();

        // mapeamos usando coverUrl que devuelve el backend
        const mapped = data.map((b: any) => ({
          id: b.id,
          title: b.title,
          slug: b.slug,
          activities_count: b.activities_count,
          coverUrl: b.coverUrl ?? null, // <- cambio clave
        }));

        setTrending(mapped);
        setErrorTrending(null);
      } catch (err: any) {
        setErrorTrending(err.message);
      } finally {
        setLoadingTrending(false);
      }
    };

    fetchTrending();
  }, []);

  const totalPaginas = Math.ceil(libros.length / librosPorPagina);
  const inicio = (pagina - 1) * librosPorPagina;
  const librosMostrados = libros.slice(inicio, inicio + librosPorPagina);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">

      {/* Google Books */}
      <h2 className="flex justify-center items-center gap-3 text-4xl font-bold text-cyan-800 mb-8">
        Biblioteca de Libros (Google)
      </h2>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {Array.from({ length: librosPorPagina }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-4 animate-pulse">
              <div className="w-full h-64 bg-gray-200 rounded-md mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-500 text-center text-lg">Error: {error}</p>}

      {!loading && !error && (
        <>
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {librosMostrados.map((libro) => {
              const imagenValida =
                libro.imagen &&
                !libro.imagen.toLowerCase().includes("image_not_available") &&
                !libro.imagen.toLowerCase().includes("no_image") &&
                !libro.imagen.toLowerCase().includes("nophoto");

              return (
                <div
                  key={libro.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transform hover:-translate-y-1 transition duration-300 flex flex-col"
                >
                  <div className="w-full h-64 bg-gray-50 flex items-center justify-center">
                    {imagenValida ? (
                      <img
                        src={libro.imagen ?? undefined}
                        alt={libro.titulo}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <img
                        src="/placeholder-cover.png"
                        alt="Sin portada"
                        className="max-h-full max-w-full object-contain opacity-60"
                      />
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold mb-1">{libro.titulo}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {libro.autores?.length ? libro.autores.join(", ") : "Autor desconocido"}
                    </p>
                    {libro.enlace && (
                      <a
                        href={libro.enlace}
                        target="_blank"
                        rel="noreferrer"
                        className="self-start mt-auto px-3 py-1 bg-[#1d44c2] text-white rounded-md text-sm hover:bg-[#0d1d52] transition"
                      >
                        Ver más
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paginación Google */}
          <div className="flex justify-center mt-8 gap-2">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1}
              className={`px-3 py-1 rounded-md text-white flex items-center justify-center ${
                pagina === 1
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              ←
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i}
                onClick={() => setPagina(i + 1)}
                className={`px-3 py-1 rounded-md text-white ${
                  pagina === i + 1 ? "bg-green-800" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
              className={`px-3 py-1 rounded-md text-white flex items-center justify-center ${
                pagina === totalPaginas
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              →
            </button>
          </div>
        </>
      )}

      {/* Sección Trending Hardcover */}
      <h2 className="flex justify-center items-center gap-3 text-4xl font-bold text-purple-800 mt-16 mb-8">
        Libros más populares (Hardcover)
      </h2>

      {loadingTrending && <p className="text-center text-gray-600">Cargando...</p>}
      {errorTrending && <p className="text-red-500 text-center text-lg">Error: {errorTrending}</p>}

      {!loadingTrending && !errorTrending && (
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {trending.map((libro) => (
            <div
              key={libro.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transform hover:-translate-y-1 transition duration-300 flex flex-col"
            >
              <div className="w-full h-64 bg-gray-50 flex items-center justify-center">
                {libro.coverUrl ? ( // usamos coverUrl
                  <img
                    src={libro.coverUrl}
                    alt={libro.title}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <img
                    src="/placeholder-cover.png"
                    alt="Sin portada"
                    className="max-h-full max-w-full object-contain opacity-60"
                  />
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold mb-1">{libro.title}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Actividad: {libro.activities_count}
                </p>
                <a
                  href={`https://hardcover.app/books/${libro.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="self-start mt-auto px-3 py-1 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-800 transition"
                >
                  Ver en Hardcover
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
