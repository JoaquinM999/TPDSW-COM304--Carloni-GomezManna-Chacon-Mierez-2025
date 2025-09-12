import { useEffect, useState, useRef } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Link, useLocation } from "react-router-dom";
import LibroCard from "../componentes/LibroCard";

interface LibroTrending {
  id: string;
  title: string;
  slug: string;
  activities_count: number;
  coverUrl: string | null;
  authors: string[];
  description: string | null;
}

export default function LibrosPopulares() {
  const location = useLocation();
  const [trending, setTrending] = useState<LibroTrending[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [errorTrending, setErrorTrending] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  const isFetchingTrending = useRef(false);

  useEffect(() => {
    const fetchTrending = async () => {
      if (isFetchingTrending.current) return;
      isFetchingTrending.current = true;
      setLoadingTrending(true);

      try {
        const res = await fetch("http://localhost:3000/api/hardcover/trending");
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        const response = await res.json();

        if (response.loading) {
          setTimeout(fetchTrending, 2000);
          return;
        }

        const mapped: LibroTrending[] = (response.books ?? []).map((b: any) => ({
          id: b.id,
          title: b.title,
          slug: b.slug,
          activities_count: b.activities_count,
          coverUrl: b.coverUrl ?? null,
          authors: b.authors ?? [],
          description: b.description ?? null,
        }));

        setTrending(mapped);
        setErrorTrending(null);
      } catch (err: any) {
        setErrorTrending(err.message || "Error al cargar libros populares");
      } finally {
        setLoadingTrending(false);
        isFetchingTrending.current = false;
      }
    };

    fetchTrending();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 p-6">
      <h2 className="text-center text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 via-blue-600 to-indigo-700">
          Libros populares
        </span>
      </h2>
      <p className="text-center text-sm text-gray-600 mb-14">
        Descubre los libros más leídos y trending
      </p>

      {/* Loading */}
      {loadingTrending && (
        <div className="flex justify-center items-center my-8">
          <DotLottieReact
            src="https://lottie.host/6d727e71-5a1d-461e-9434-c9e7eb1ae1d1/IWVmdeMHnT.lottie"
            loop
            autoplay
            style={{ width: 140, height: 140 }}
          />
        </div>
      )}

      {/* Error */}
      {errorTrending && (
        <p className="text-red-500 text-center text-lg">Error: {errorTrending}</p>
      )}

      {/* Contenido */}
      {!loadingTrending && !errorTrending && (
        <>
          {/* Top 5 */}
          <section className="mb-16">
            <h3 className="text-3xl font-bold text-slate-800 mb-10 text-center flex items-center justify-center gap-2">
              Los 5 más leídos
            </h3>
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
              {trending.slice(0, 5).map((libro, index) => (
                <Link to={`/libro/${libro.slug}`} state={{ from: location.pathname }} key={libro.id} className="group relative block">
                  <div className="absolute top-4 left-4 z-10">
                    <svg
                      className="w-12 h-12"
                      viewBox="0 0 50 50"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="25" cy="25" r="25" fill={index === 0 ? "#A855F7" : "url(#grad)"} />
                      <text
                        x="50%"
                        y="50%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        fill="white"
                        className="text-white font-bold text-lg"
                      >
                        {index + 1}
                      </text>
                      <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#8B5CF6" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <LibroCard
                    title={libro.title}
                    authors={libro.authors}
                    image={libro.coverUrl}
                    extraInfo={`Actividad: ${libro.activities_count}`}
                  />
                </Link>
              ))}
            </div>
          </section>

          {/* Otros Libros */}
          <section>
            <h3 className="text-3xl font-bold text-blue-800 mb-10 text-center">
              Siguientes en popularidad
            </h3>
            <div className="grid gap-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {trending.slice(5, visibleCount).map((libro) => (
                <Link key={libro.id} to={`/libro/${libro.slug}`} state={{ from: location.pathname }} className="block">
                  <LibroCard
                    title={libro.title}
                    authors={libro.authors}
                    image={libro.coverUrl}
                    extraInfo={`Actividad: ${libro.activities_count}`}
                  />
                </Link>
              ))}
            </div>

            {visibleCount < trending.length && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setVisibleCount(prev => Math.min(prev + 5, trending.length))}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Ver más
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
