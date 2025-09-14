import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  Star,
  Heart,
  BookOpen,
  User,
  ThumbsUp,
  ArrowLeft,
  Calendar,
  ExternalLink,
  MessageCircle,
  Award,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Libro {
  id: string;
  titulo: string;
  title?: string;
  autores: string[];
  descripcion: string | null;
  imagen: string | null;
  coverUrl?: string | null;
  enlace: string | null;
  slug?: string;
  activities_count?: number;
  source?: "hardcover" | "google";
}

interface Reseña {
  id: number;
  usuario: string;
  avatar: string;
  rating: number;
  titulo: string;
  comentario: string;
  fecha: string;
  likes: number;
  esUtil: boolean;
}

export const DetalleLibro: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from || "/libros"; // Página de origen
  const [libro, setLibro] = useState<Libro | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reseñas, setReseñas] = useState<Reseña[]>([]);
  const [esFavorito, setEsFavorito] = useState(false);
  const [mostrarSinopsis, setMostrarSinopsis] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const mockReseñas: Reseña[] = [
    {
      id: 1,
      usuario: "María García",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      titulo: "Una obra maestra",
      comentario:
        "Este libro me ha cautivado desde la primera página. La narrativa es excepcional y los personajes están perfectamente desarrollados.",
      fecha: "2024-01-15",
      likes: 12,
      esUtil: true,
    },
    {
      id: 2,
      usuario: "Carlos Rodríguez",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 4,
      titulo: "Muy recomendable",
      comentario:
        "Una lectura fascinante que te mantiene enganchado hasta el final. El autor tiene un estilo único.",
      fecha: "2024-01-10",
      likes: 8,
      esUtil: false,
    },
  ];

  useEffect(() => {
    const fetchLibro = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);

      try {
        let response = await fetch(`http://localhost:3000/api/hardcover/libro/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setLibro({
            id: data.id.toString(),
            titulo: data.title,
            title: data.title,
            autores: data.authors?.length ? data.authors : ["Autor desconocido"],
            descripcion: data.description || "No hay descripción disponible.",
            imagen: data.coverUrl,
            coverUrl: data.coverUrl,
            enlace: null,
            slug: data.slug,
            activities_count: data.activities_count,
            source: "hardcover",
          });
        } else {
          response = await fetch(`http://localhost:3000/api/google-books/${slug}`);
          if (!response.ok) {
            const searchQuery = slug.replace(/-/g, " ");
            response = await fetch(
              `http://localhost:3000/api/google-books/buscar?q=${encodeURIComponent(
                searchQuery
              )}&maxResults=1`
            );
            if (!response.ok) throw new Error("Libro no encontrado");

            const searchData = await response.json();
            if (searchData && searchData.length > 0) {
              const libroGoogle = searchData[0];
              setLibro({
                id: libroGoogle.id,
                titulo: libroGoogle.title || "Título desconocido",
                title: libroGoogle.title,
                autores: libroGoogle.autores?.length ? libroGoogle.autores : ["Autor desconocido"],
                descripcion: libroGoogle.descripcion || "No hay descripción disponible.",
                imagen: libroGoogle.imagen || null,
                coverUrl: libroGoogle.imagen || null,
                enlace: libroGoogle.enlace || null,
                slug: libroGoogle.slug || undefined,
                activities_count: libroGoogle.activities_count,
                source: "google",
              });
            } else throw new Error("Libro no encontrado");
          } else {
            const libroData = await response.json();
            setLibro({ ...libroData, source: "google" });
          }
        }

        setReseñas(mockReseñas);
      } catch (err: any) {
        setError(err.message || "Error al cargar el libro");
      } finally {
        setLoading(false);
      }
    };

    fetchLibro();
  }, [slug]);

  const toggleFavorito = () => setEsFavorito(!esFavorito);

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < Math.floor(rating) ? "text-amber-400 fill-current" : "text-gray-300"}`}
      />
    ));

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <DotLottieReact
          src="https://lottie.host/6d727e71-5a1d-461e-9434-c9e7eb1ae1d1/IWVmdeMHnT.lottie"
          loop
          autoplay
          style={{ width: 140, height: 140 }}
        />
      </div>
    );

  if (error || !libro)
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto text-red-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">{error || "Libro no encontrado"}</h2>
          <button
            onClick={() => navigate(from)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-10 items-center">
        <div className="flex justify-center">
          <img
            src={libro.coverUrl || libro.imagen || "https://via.placeholder.com/400x600"}
            alt={libro.titulo}
            onLoad={() => setImageLoaded(true)}
            className={`w-64 h-96 object-cover rounded-2xl shadow-xl transition-all duration-700 ${
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <button
            onClick={() => navigate(from)}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>

          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">{libro.titulo}</h1>

          <div className="flex flex-wrap gap-3">
            {libro.autores.map((a, i) => (
              <Link
                key={i}
                to={`/autores/${encodeURIComponent(a)}`}
                className="px-3 py-1 bg-white rounded-full shadow hover:shadow-md text-sm font-medium text-gray-700"
              >
                <User className="w-4 h-4 inline mr-1" />
                {a}
              </Link>
            ))}
          </div>

          {libro.source && (
            <span className="inline-block text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Fuente: {libro.source === "hardcover" ? "Hardcover" : "Google Books"}
            </span>
          )}

          <div className="flex flex-wrap gap-4 mt-3">
            <button
              onClick={toggleFavorito}
              className={`px-5 py-2 rounded-lg flex items-center gap-2 shadow hover:scale-105 transition ${
                esFavorito ? "bg-red-500 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Heart className={esFavorito ? "fill-current" : ""} /> {esFavorito ? "Favorito" : "Agregar a Favoritos"}
            </button>

            {libro.enlace && (
              <a
                href={libro.enlace}
                target="_blank"
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 shadow hover:bg-indigo-700 transition"
              >
                <ExternalLink className="w-4 h-4" /> Ver en Google Books
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Sinopsis */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white/90 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-indigo-600" />
            Sinopsis
          </h2>
          <p className={`text-gray-700 leading-relaxed ${!mostrarSinopsis ? "line-clamp-4" : ""}`}>
            {libro.descripcion}
          </p>
          {libro.descripcion && libro.descripcion.length > 200 && (
            <button
              onClick={() => setMostrarSinopsis(!mostrarSinopsis)}
              className="mt-3 text-indigo-600 flex items-center gap-1 hover:underline"
            >
              {mostrarSinopsis ? (
                <>
                  <ChevronUp className="w-4 h-4" /> Ver menos
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" /> Ver más
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Reseñas */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <Award className="w-6 h-6 text-purple-600" /> Reseñas
        </h2>
        <div className="space-y-6">
          {reseñas.map((r) => (
            <div key={r.id} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
              <div className="flex gap-4">
                <img src={r.avatar} alt={r.usuario} className="w-14 h-14 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg">{r.usuario}</h4>
                    <span className="text-sm text-gray-500">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {formatDate(r.fecha)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {renderStars(r.rating)} <span className="text-sm text-gray-500 ml-2">{r.rating}/5</span>
                  </div>
                  <p className="mt-3 text-gray-700">{r.comentario}</p>
                  <div className="flex gap-6 mt-4 text-sm">
                    <button className="flex items-center gap-1 text-gray-600 hover:text-indigo-600">
                      <ThumbsUp className="w-4 h-4" /> {r.likes}
                    </button>
                    <button className="text-gray-600 hover:text-indigo-600">Responder</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
