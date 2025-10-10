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
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import { getResenasByLibro } from "../services/resenaService";
import { getRatingLibroByLibroId } from "../services/ratingLibroService";
import { addOrUpdateReaccion, deleteReaccion } from "../services/reaccionService";
import { isAuthenticated, getToken } from "../services/authService";

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
  comentario: string;
  estrellas: number;
  estado: string;
  fechaResena: string;
  usuario: {
    id: number;
    username: string;
    nombre?: string;
  };
  reacciones?: { id: number; tipo: string; usuarioId?: number }[];
}

const DetalleLibro: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const from = (location.state as any)?.from || "/libros";

  const [libro, setLibro] = useState<Libro | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reseñas, setReseñas] = useState<Reseña[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [esFavorito, setEsFavorito] = useState(false);
  const [mostrarSinopsis, setMostrarSinopsis] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'mas_recientes' | 'mejor_valoradas'>('mas_recientes');
  const [expandedReviewIds, setExpandedReviewIds] = useState<Record<number, boolean>>({});
  const [likedByUser, setLikedByUser] = useState<Record<number, boolean>>({}); // reviewId -> liked?

  useEffect(() => {
    const fetchLibro = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);

      try {
        let response = await fetch(`http://localhost:3000/api/hardcover/libro/${slug}`);
        let data: any = null;

        if (response.ok) {
          data = await response.json();
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
              `http://localhost:3000/api/google-books/buscar?q=${encodeURIComponent(searchQuery)}&maxResults=1`
            );
            if (!response.ok) throw new Error("Libro no encontrado");

            const searchData = await response.json();
            if (searchData && searchData.length > 0) {
              const libroGoogle = searchData[0];
              data = libroGoogle;
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
            data = libroData;
            setLibro({ ...libroData, source: "google" });
          }
        }

        // ahora que tenemos data (si existe id/int), buscamos reseñas y rating usando el id que vino en "data" o en la respuesta
        try {
          const libroIdCandidate = data?.id ?? (data && data.id ? data.id : undefined);
          const libroId = libroIdCandidate ? parseInt(String(libroIdCandidate)) : NaN;
          if (!isNaN(libroId)) {
            setReviewsLoading(true);
            const [reviewsData, ratingData] = await Promise.all([
              getResenasByLibro(libroId),
              getRatingLibroByLibroId(libroId),
            ]);
            setReseñas(reviewsData || []);
            setAverageRating(ratingData?.promedio ?? null);
            // Nota: si tu API devuelve info sobre si el usuario actual reaccionó,
            // aquí podrías inicializar likedByUser.
          }
        } catch (reviewError) {
          console.warn("Error fetching reviews:", reviewError);
          setReseñas([]);
          setAverageRating(null);
        } finally {
          setReviewsLoading(false);
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar el libro");
      } finally {
        setLoading(false);
      }
    };

    fetchLibro();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const toggleFavorito = () => setEsFavorito(!esFavorito);

  const refreshResenas = async () => {
    if (!libro) return;
    const libroId = parseInt(libro.id);
    if (isNaN(libroId)) return;
    try {
      setReviewsLoading(true);
      const reviewsData = await getResenasByLibro(libroId);
      setReseñas(reviewsData || []);
    } catch (error) {
      console.warn("Error refreshing reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const addResenaLocally = (r: Reseña) => {
    setReseñas(prev => [r, ...prev]);
  };

  const renderStars = (rating: number, sizeClass = "w-4 h-4") =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${sizeClass} ${i < Math.floor(rating) ? "text-amber-400 fill-current" : "text-gray-300"}`}
      />
    ));

  // StarsInput: componente para seleccionar rating con estrellas clicables
  const StarsInput: React.FC<{
    value: number;
    onChange: (v: number) => void;
    sizeClass?: string;
  }> = ({ value, onChange, sizeClass = "w-7 h-7" }) => {
    const [hover, setHover] = useState<number>(0);
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => {
          const idx = i + 1;
          const active = hover ? idx <= hover : idx <= value;
          return (
            <button
              key={idx}
              type="button"
              aria-label={`${idx} estrellas`}
              onMouseEnter={() => setHover(idx)}
              onMouseLeave={() => setHover(0)}
              onClick={() => onChange(idx)}
              className={`p-1 rounded ${active ? "text-amber-400" : "text-gray-300"} transition`}
            >
              <Star className={`${sizeClass} ${active ? "fill-current" : ""}`} />
            </button>
          );
        })}
      </div>
    );
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const sortedResenas = () => {
    const filtered = reseñas;
    if (sortOrder === "mas_recientes")
      return [...filtered].sort((a, b) => Number(new Date(b.fechaResena)) - Number(new Date(a.fechaResena)));
    return [...filtered].sort((a, b) => b.estrellas - a.estrellas);
  };

  const toggleExpand = (id: number) =>
    setExpandedReviewIds((prev) => ({ ...prev, [id]: !prev[id] }));

  // Helper: extraer userId desde un token JWT (si es que hay uno)
  const getUserIdFromToken = (token?: string): number => {
    if (!token) return 0;
    try {
      const parts = token.split(".");
      if (parts.length < 2) return 0;
      const payload = parts[1];
      // atob + manejo unicode
      const jsonString = decodeURIComponent(
        Array.prototype.map
          .call(atob(payload), (c: string) => {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      const parsed = JSON.parse(jsonString);
      // buscar campos comunes
      return Number(parsed.id || parsed.sub || parsed.userId || parsed.usuarioId || 0) || 0;
    } catch (e) {
      return 0;
    }
  };

  // toggle like/unlike con manejo optimista y llamadas a servicios
  const handleToggleLike = async (reviewId: number) => {
    const token = getToken();
    if (!token) {
      alert("Debes iniciar sesión para dar like a una reseña.");
      return;
    }

    const usuarioId = getUserIdFromToken(token);
    const currentlyLiked = !!likedByUser[reviewId];

    // snapshots para revertir en caso de error
    const prevResenas = reseñas;
    const prevLiked = likedByUser;

    // optimista: actualizar contador y estado liked
    setLikedByUser(prev => ({ ...prev, [reviewId]: !currentlyLiked }));
    setReseñas(prev =>
      prev.map(r =>
        r.id === reviewId
          ? {
              ...r,
              reacciones: !currentlyLiked
                ? [...(r.reacciones || []), { id: Date.now(), tipo: "like", usuarioId }]
                : (r.reacciones?.filter(rec => !(rec.tipo === "like" && (rec.usuarioId ?? 0) === usuarioId)) ?? []),
            }
          : r
      )
    );

    try {
      if (!currentlyLiked) {
        // dar like: usamos resenaId y pasamos usuarioId también si el servicio lo espera
        await addOrUpdateReaccion({ usuarioId, resenaId: reviewId, tipo: "like" }, token);
      } else {
        // quitar like: deleteReaccion espera (usuarioId, resenaId, tipo)
        await deleteReaccion(usuarioId, reviewId, "like");
      }
    } catch (err) {
      console.warn("Error guardando reaccion:", err);
      // revertir a los snapshots previos
      setLikedByUser(prevLiked);
      setReseñas(prevResenas);
      alert("No se pudo actualizar la reacción. Intentá de nuevo.");
    }
  };

  // Formulario inline para crear reseña (estrellas + textarea grande)
  const NewReviewForm: React.FC<{ libroId: number; onAdded?: () => void; onOptimisticAdd?: (r: Reseña) => void }> = ({ libroId, onAdded, onOptimisticAdd }) => {
    const [estrellas, setEstrellas] = useState<number>(5);
    const [comentario, setComentario] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);
    const [errorLocal, setErrorLocal] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isAuthenticated()) {
        alert("Debes iniciar sesión para publicar una reseña.");
        return;
      }
      if (!comentario.trim()) {
        setErrorLocal("El comentario no puede estar vacío.");
        return;
      }

      setSubmitting(true);
      setErrorLocal(null);

      // Optimistic add: construir reseña temporal
      const tempReview: Reseña = {
        id: Date.now(),
        comentario,
        estrellas,
        estado: "pending", // optimista
        fechaResena: new Date().toISOString(),
        usuario: { id: 0, username: "Tú", nombre: undefined },
        reacciones: [],
      };

      try {
        // mostrar inmediatamente
        onOptimisticAdd?.(tempReview);

        const token = getToken();
        const res = await fetch("http://localhost:3000/api/resena", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            libroId,
            estrellas,
            comentario,
            libro: {
              id: libro!.id,
              titulo: libro!.titulo,
              autores: libro!.autores,
              descripcion: libro!.descripcion,
              imagen: libro!.imagen,
              enlace: libro!.enlace,
              source: libro!.source,
            },
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Error creando reseña");
        }

        // si todo ok, refrescar reseñas reales desde servidor
        onAdded?.();
        setComentario("");
        setEstrellas(5);
      } catch (err: any) {
        console.error("Error creando reseña:", err);
        setErrorLocal(err.message || "No se pudo crear la reseña");
        onAdded?.();
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tu calificación</label>
          <StarsInput value={estrellas} onChange={setEstrellas} sizeClass="w-7 h-7" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tu reseña</label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={6}
            className="w-full min-h-[8rem] resize-y rounded-lg border border-gray-200 p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 text-lg"
            placeholder="Escribe tu reseña: qué te gustó, qué no, para quién recomendarías este libro..."
          />
          <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
            <div>{comentario.length} caracteres</div>
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publicar reseña"}
              </button>
            </div>
          </div>
          {errorLocal && <div className="mt-2 text-sm text-red-600">{errorLocal}</div>}
        </div>
      </form>
    );
  };

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
                rel="noreferrer"
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

      {/* Reseñas mejoradas */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Award className="w-6 h-6 text-purple-600" /> Reseñas
          </h2>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 text-right">
              <div className="font-semibold">{reseñas.length} reseñas</div>
              <div className="flex items-center gap-1">
                {averageRating ? (
                  <>
                    <div className="flex items-center gap-1">{renderStars(averageRating, "w-4 h-4")}</div>
                    <span className="ml-2 font-medium">{averageRating.toFixed(1)}/5</span>
                  </>
                ) : (
                  <span className="text-gray-400">Sin calificaciones</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-lg shadow px-3 py-2">
              <button
                onClick={() => setSortOrder('mas_recientes')}
                className={`text-sm px-2 py-1 rounded ${sortOrder === 'mas_recientes' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
              >
                Más recientes
              </button>
              <button
                onClick={() => setSortOrder('mejor_valoradas')}
                className={`text-sm px-2 py-1 rounded ${sortOrder === 'mejor_valoradas' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
              >
                Mejor valoradas
              </button>
            </div>
          </div>
        </div>

        {isAuthenticated() && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Agregar una reseña</h3>
            <NewReviewForm
              libroId={parseInt(libro.id)}
              onAdded={refreshResenas}
              onOptimisticAdd={(r) => addResenaLocally(r)}
            />
          </div>
        )}

        <div className="space-y-6">
          {reviewsLoading ? (
            <div className="flex items-center justify-center p-8 bg-white rounded-xl shadow">
              <Loader2 className="w-6 h-6 animate-spin mr-2 text-indigo-600" /> Cargando reseñas...
            </div>
          ) : sortedResenas().length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Aún no hay reseñas disponibles para este libro. ¡Sé el primero en comentar!</p>
            </div>
          ) : (
            sortedResenas().map((r) => (
              <article key={r.id} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-bold text-lg">
                    {((r.usuario.nombre || r.usuario.username) || "?").split(" ").map(s => s[0]).slice(0,2).join("")}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg">{r.usuario.nombre || r.usuario.username}</h4>
                          {r.estado === "pending" && (
                            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                              Pendiente de moderación
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1">
                            {renderStars(r.estrellas, "w-4 h-4")} <span className="ml-2">{r.estrellas}/5</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-400 flex items-center gap-2">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(r.fechaResena)}</span>
                        <button className="p-1 rounded hover:bg-gray-100" title="Más opciones"><MoreHorizontal className="w-4 h-4" /></button>
                      </div>
                    </div>

                    <div className="mt-3 text-gray-700">
                      {/* bloque de comentario más grande: text-lg y mayor line-height */}
                      <p className={`${expandedReviewIds[r.id] ? '' : 'line-clamp-5'} text-lg leading-relaxed`}>{r.comentario}</p>
                      {r.comentario && r.comentario.length > 300 && (
                        <button onClick={() => toggleExpand(r.id)} className="mt-2 text-sm text-indigo-600 hover:underline flex items-center gap-1">
                          {expandedReviewIds[r.id] ? <><ChevronUp className="w-4 h-4"/> Ver menos</> : <><ChevronDown className="w-4 h-4"/> Ver más</>}
                        </button>
                      )}
                    </div>

                    <div className="flex gap-6 mt-4 text-sm items-center">
                      <button
                        onClick={() => handleToggleLike(r.id)}
                        className={`flex items-center gap-2 ${likedByUser[r.id] ? "text-indigo-600" : "text-gray-600"} hover:text-indigo-600`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{r.reacciones?.length || 0}</span>
                      </button>

                      <button className="text-gray-600 hover:text-indigo-600">Responder</button>

                      <span className="ml-auto text-xs text-gray-400">ID: {r.id}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export { DetalleLibro };
