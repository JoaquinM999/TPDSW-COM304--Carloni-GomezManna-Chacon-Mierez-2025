import { useEffect, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface Libro {
  id: string;
  titulo: string;
  autores: string[];
  descripcion?: string;
  imagen: string | null;
  enlace: string | null;
}



export default function TodosLosLibros() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        <div className="flex justify-center items-center">
          <DotLottieReact
            src="https://lottie.host/6d727e71-5a1d-461e-9434-c9e7eb1ae1d1/IWVmdeMHnT.lottie"
            loop
            autoplay
            style={{ width: 200, height: 200 }}
          />
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
                      {libro.autores?.length
                        ? libro.autores.join(", ")
                        : "Autor desconocido"}
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


    </div>
  );
}
