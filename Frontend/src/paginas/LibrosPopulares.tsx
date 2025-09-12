import { useEffect, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Link } from "react-router-dom";

interface LibroTrending {
  id: string;
  title: string;
  slug: string;
  activities_count: number;
  coverUrl: string | null;
}

export default function LibrosPopulares() {
  const [trending, setTrending] = useState<LibroTrending[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [errorTrending, setErrorTrending] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  const [userTrending, setUserTrending] = useState<LibroTrending[]>([]);
  const [loadingUserTrending, setLoadingUserTrending] = useState(true);
  const [errorUserTrending, setErrorUserTrending] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoadingTrending(true);
      try {
        const res = await fetch("http://localhost:3000/api/hardcover/trending");
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        const response = await res.json();

        if (response.loading) {
          setTimeout(fetchTrending, 2000);
          return;
        }

        const mapped = (response.books ?? []).map((b: any) => ({
          id: b.id,
          title: b.title,
          slug: b.slug,
          activities_count: b.activities_count,
          coverUrl: b.coverUrl ?? null,
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

  useEffect(() => {
    const fetchUserTrending = async () => {
      setLoadingUserTrending(true);
      try {
        const res = await fetch("http://localhost:3000/api/user/trending");
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        const response = await res.json();

        if (response.loading) {
          setTimeout(fetchUserTrending, 2000);
          return;
        }

        const mapped = (response.books ?? []).map((b: any) => ({
          id: b.id,
          title: b.title,
          slug: b.slug,
          activities_count: b.activities_count,
          coverUrl: b.coverUrl ?? null,
        }));

        setUserTrending(mapped);
        setErrorUserTrending(null);
      } catch (err: any) {
        setErrorUserTrending(err.message);
      } finally {
        setLoadingUserTrending(false);
      }
    };

    fetchUserTrending();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradientShift 3s ease infinite;
          }
        `}
      </style>
      {/* Título principal */}
      <h2 className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-600 animate-gradient mb-14">
        Libros populares
      </h2>

      {/* Loading */}
      {loadingTrending && (
        <div className="flex justify-center items-center h-72">
          <DotLottieReact
            src="https://lottie.host/6d727e71-5a1d-461e-9434-c9e7eb1ae1d1/IWVmdeMHnT.lottie"
            loop
            autoplay
            style={{ width: 200, height: 200 }}
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
                <Link
                  to={`/libro/${libro.slug}`}
                  key={libro.id}
                  className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-3 hover:scale-105 duration-500 flex flex-col overflow-hidden"
                >
                  {/* Ranking Badge SVG */}
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
                        className="text-white font-bold text-lg"
                        fill="white"
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

                  {/* Portada */}
                  <div className="w-full h-64 bg-gray-50 flex items-center justify-center overflow-hidden relative">
                    {libro.coverUrl ? (
                      <img
                        src={libro.coverUrl}
                        alt={libro.title}
                        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110 group-hover:brightness-110"
                      />
                    ) : (
                      <img
                        src="/placeholder-cover.png"
                        alt="Sin portada"
                        className="h-full w-full object-contain opacity-50"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2 truncate">
                      {libro.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Actividad: {libro.activities_count}
                    </p>
                  </div>
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
                <Link
                  to={`/libro/${libro.slug}`}
                  key={libro.id}
                  className="bg-white rounded-3xl shadow-md hover:shadow-xl transform hover:-translate-y-2 hover:scale-105 transition duration-300 flex flex-col overflow-hidden"
                >
                  <div className="w-full h-56 bg-gray-50 flex items-center justify-center overflow-hidden">
                    {libro.coverUrl ? (
                      <img
                        src={libro.coverUrl}
                        alt={libro.title}
                        className="h-full w-full object-contain transition-transform duration-300 hover:scale-105 hover:brightness-105"
                      />
                    ) : (
                      <img
                        src="/placeholder-cover.png"
                        alt="Sin portada"
                        className="h-full w-full object-contain opacity-50"
                      />
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-md font-semibold mb-1 truncate">{libro.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      Actividad: {libro.activities_count}
                    </p>
                  </div>
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

      {/* Libros más leídos esta semana por usuarios */}
      <section className="mt-20">
        <h3 className="text-3xl font-bold text-slate-800 mb-10 text-center flex items-center justify-center gap-2">
          Libros más leídos esta semana
        </h3>

        <p className="text-center text-gray-500 italic">En construcción</p>
      </section>
    </div>
  );
}
