import React, { useState, useEffect, useMemo, useReducer, useRef } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  Star,
  Heart,
  Plus,
  ArrowLeft,
  BookOpen,
  MessageCircle,
  Award,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  Calendar,
  MoreHorizontal,
  Loader2,
  User,
} from "lucide-react";
import { getResenasByLibro, agregarReseña, crearRespuesta } from "../services/resenaService";
import { addOrUpdateReaccion, deleteReaccion } from "../services/reaccionService";
import { isAuthenticated, getToken } from "../services/authService";
import { listaService, Lista } from "../services/listaService";
import { obtenerFavoritos, agregarFavorito, quitarFavorito } from "../services/favoritosService";

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
  source: "hardcover" | "google";
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
    avatar?: string;
  };
  reacciones?: { id: number; tipo: string; usuarioId?: number }[];
  respuestas?: Reseña[];
  resenaPadre?: { usuario: { nombre?: string; username: string } };
}

// Estado para useReducer
interface ReviewState {
  reseñas: Reseña[];
  averageRating: number | null;
  likedByUser: Record<number, boolean>;
  expandedReviewIds: Record<number, boolean>;
  expandedReplies: Record<string, boolean>;
  replyForms: Record<number, { comentario: string; submitting: boolean; error: string | null } | null>;
  sortOrder: 'mas_recientes' | 'mejor_valoradas';
  reviewsLoading: boolean;
}

type ReviewAction =
  | { type: 'SET_REVIEWS'; payload: Reseña[] }
  | { type: 'SET_AVERAGE_RATING'; payload: number | null }
  | { type: 'SET_LIKED_BY_USER'; payload: Record<number, boolean> }
  | { type: 'TOGGLE_EXPAND_REVIEW'; payload: number }
  | { type: 'TOGGLE_EXPAND_REPLIES'; payload: string }
  | { type: 'SET_REPLY_FORM'; payload: { reviewId: number; form: { comentario: string; submitting: boolean; error: string | null } | null } }
  | { type: 'SET_SORT_ORDER'; payload: 'mas_recientes' | 'mejor_valoradas' }
  | { type: 'SET_REVIEWS_LOADING'; payload: boolean }
  | { type: 'UPDATE_REVIEW_REACTIONS'; payload: { reviewId: number; reacciones: { id: number; tipo: string; usuarioId?: number }[] } };

const reviewReducer = (state: ReviewState, action: ReviewAction): ReviewState => {
  switch (action.type) {
    case 'SET_REVIEWS':
      return { ...state, reseñas: action.payload };
    case 'SET_AVERAGE_RATING':
      return { ...state, averageRating: action.payload };
    case 'SET_LIKED_BY_USER':
      return { ...state, likedByUser: action.payload };
    case 'TOGGLE_EXPAND_REVIEW':
      return { ...state, expandedReviewIds: { ...state.expandedReviewIds, [action.payload]: !state.expandedReviewIds[action.payload] } };
    case 'TOGGLE_EXPAND_REPLIES':
      return { ...state, expandedReplies: { ...state.expandedReplies, [action.payload]: !state.expandedReplies[action.payload] } };
    case 'SET_REPLY_FORM':
      return { ...state, replyForms: { ...state.replyForms, [action.payload.reviewId]: action.payload.form } };
    case 'SET_SORT_ORDER':
      return { ...state, sortOrder: action.payload };
    case 'SET_REVIEWS_LOADING':
      return { ...state, reviewsLoading: action.payload };
    case 'UPDATE_REVIEW_REACTIONS':
      return {
        ...state,
        reseñas: state.reseñas.map(r =>
          r.id === action.payload.reviewId ? { ...r, reacciones: action.payload.reacciones } : r
        )
      };
    default:
      return state;
  }
};

// Componente para renderizar avatar
const UserAvatar: React.FC<{ usuario: { nombre?: string; username: string; avatar?: string }; size?: string }> = ({ usuario, size = "w-14 h-14" }) => {
  if (usuario.avatar) {
    return (
      <img
        src={`/assets/${usuario.avatar}.svg`}
        alt={`Avatar de ${usuario.username || usuario.nombre}`}
        className={`${size} rounded-full object-cover`}
      />
    );
  }
  return (
    <div className={`${size} rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-bold text-lg`}>
      {((usuario.nombre || usuario.username) || "?")
        .split(" ")
        .map(s => s[0].toUpperCase())
        .slice(0, 2)
        .join("")}
    </div>
  );
};

// Estado inicial para useReducer
const initialReviewState: ReviewState = {
  reseñas: [],
  averageRating: null,
  likedByUser: {},
  expandedReviewIds: {},
  expandedReplies: {},
  replyForms: {},
  sortOrder: 'mas_recientes',
  reviewsLoading: false,
};

const DetalleLibro: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const from = (location.state as any)?.from || "/libros";

  const [libro, setLibro] = useState<Libro | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [esFavorito, setEsFavorito] = useState<number | null>(null);
  const [mostrarSinopsis, setMostrarSinopsis] = useState(false);
  const [showListaDropdown, setShowListaDropdown] = useState(false);
  const [listas, setListas] = useState<Lista[]>([]);
  const [listasConLibro, setListasConLibro] = useState<Set<number>>(new Set());
  const [imageLoaded, setImageLoaded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Función para detectar si el texto contiene etiquetas HTML
  const hasHtmlTags = (text: string) => /<[^>]*>/.test(text);

  // Función para obtener la longitud del texto plano (sin etiquetas HTML)
  const plainTextLength = (text: string) => text.replace(/<[^>]*>/g, '').length;

  // Función para renderizar la sinopsis
  const renderSinopsis = (descripcion: string | null) => {
    if (!descripcion) return null;
    const isHtml = hasHtmlTags(descripcion);
    if (isHtml) {
      return <span dangerouslySetInnerHTML={{ __html: descripcion }} />;
    } else {
      return <span>{descripcion}</span>;
    }
  };

  const nombresDeListasFijas = ["Ver más tarde", "Pendiente", "Leídos"];

  // Filtra las listas del usuario para mostrar solo las que NO son fijas
  const listasPersonalizadas = listas.filter(l => !nombresDeListasFijas.includes(l.nombre));

  const handleToggleInList = async (lista: Lista) => {
    if (!libro) return;

    const yaEstaEnLista = listasConLibro.has(lista.id);
    const libroId = libro.id; // Ya sabemos que es un string

    // Snapshot for revert
    const prevListasConLibro = new Set(listasConLibro);

    try {
      if (yaEstaEnLista) {
        // Si ya está, lo quitamos
        await listaService.removeLibroDeLista(lista.id, libroId);
        // Actualizamos el estado local para desmarcar el checkbox
        setListasConLibro(prevSet => {
          const newSet = new Set(prevSet);
          newSet.delete(lista.id);
          return newSet;
        });
      } else {
        // Si no está, lo agregamos
        await listaService.addLibroALista(lista.id, libro);
        // Actualizamos el estado local para marcar el checkbox
        setListasConLibro(prevSet => {
          const newSet = new Set(prevSet);
          newSet.add(lista.id);
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error al actualizar la lista:", error);
      alert("No se pudo actualizar la lista. Inténtalo de nuevo.");
      // Revert on error
      setListasConLibro(prevListasConLibro);
    }
  };

  const [reviewState, dispatch] = useReducer(reviewReducer, initialReviewState);

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

        // ahora que tenemos data (si existe id/string), buscamos reseñas y rating usando el id que vino en "data" o en la respuesta
        const libroIdCandidate = data?.id ?? (data && data.id ? data.id : undefined);
        if (libroIdCandidate) {
          dispatch({ type: 'SET_REVIEWS_LOADING', payload: true });
          try {
            const reviewsData = await getResenasByLibro(libroIdCandidate);

            // Filtrar: mostrar todo excepto FLAGGED (rechazadas)
            const reviews = reviewsData?.reviews || [];
            const filtered = reviews.filter((r: Reseña) => r.estado !== "FLAGGED");

            dispatch({ type: 'SET_REVIEWS', payload: filtered });

            // Inicializar likedByUser si hay token
            const token = getToken();
            const userId = token ? getUserIdFromToken(token) : 0;
            const likedMap: Record<number, boolean> = {};
            filtered.forEach((r: Reseña) => {
              if (r.reacciones?.some((rec: { id: number; tipo: string; usuarioId?: number }) => rec.tipo === "like" && (rec.usuarioId ?? 0) === userId)) {
                likedMap[r.id] = true;
              }
            });
            dispatch({ type: 'SET_LIKED_BY_USER', payload: likedMap });

            // Calculate average rating from parent reviews only
            const calculatedAvg = filtered.length > 0
              ? filtered.reduce((sum: number, r: Reseña) => sum + r.estrellas, 0) / filtered.length
              : 0;
            dispatch({ type: 'SET_AVERAGE_RATING', payload: calculatedAvg });
          } catch (reviewError) {
            console.warn("Error fetching reviews:", reviewError);
            dispatch({ type: 'SET_REVIEWS', payload: [] });
            dispatch({ type: 'SET_AVERAGE_RATING', payload: 0 });
          } finally {
            dispatch({ type: 'SET_REVIEWS_LOADING', payload: false });
          }
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

  useEffect(() => {
    const fetchListas = async () => {
      if (!isAuthenticated()) return;
      try {
        const listasData = await listaService.getUserListas();
        setListas(listasData);
      } catch (error) {
        console.error("Error fetching listas:", error);
      }
    };
    fetchListas();
  }, []);

  useEffect(() => {
    const fetchFavoritoStatus = async () => {
      if (!isAuthenticated() || !libro) return;
      try {
        const favoritos = await obtenerFavoritos();
        // Ahora favoritos es un array de objetos { id, externalId, source }
        // Encontrar el favorito correspondiente al libro actual
        const fav = favoritos.find(fav => fav.externalId === libro.id && fav.source === libro.source);
        setEsFavorito(fav ? fav.id : null);
      } catch (error) {
        console.error("Error fetching favorito status:", error);
      }
    };
    fetchFavoritoStatus();
  }, [libro]);

  useEffect(() => {
    const fetchListasDelLibro = async () => {
      if (!libro?.id) return; // Si no hay libro, no hagas nada

      try {
        const ids = await listaService.getListasContainingBook(libro.id);
        setListasConLibro(new Set(ids)); // Guarda los IDs en el estado
      } catch (error) {
        console.error("Error al verificar las listas del libro:", error);
      }
    };

    fetchListasDelLibro();
  }, [libro]); // Se ejecuta cada vez que el libro cambie

  // useEffect para cerrar el dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowListaDropdown(false);
      }
    };

    if (showListaDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showListaDropdown]);

  const toggleFavorito = async () => {
    if (!isAuthenticated()) {
      alert("Debes iniciar sesión para gestionar favoritos.");
      return;
    }
    if (!libro) return;

    try {
      if (esFavorito) {
        await quitarFavorito(esFavorito);
        setEsFavorito(null);
      } else {
        const favoriteId = await agregarFavorito({
          id: libro.id,
          titulo: libro.titulo,
          descripcion: libro.descripcion,
          imagen: libro.imagen,
          enlace: libro.enlace,
          source: libro.source!,
        });
        setEsFavorito(favoriteId);
      }
    } catch (error) {
      console.error("Error toggling favorito:", error);
      alert("Error al actualizar favorito. Inténtalo de nuevo.");
    }
  };

  const handleAddToList = async (listaId: number) => {
    if (!libro) return;
    try {
      await listaService.addLibroALista(listaId, libro);
      alert("Libro agregado a la lista exitosamente");
      setShowListaDropdown(false);
    } catch (error) {
      console.error("Error adding book to list:", error);
      alert("Error al agregar el libro a la lista");
    }
  };

  const handleAddToListByName = async (nombre: string) => {
    if (!libro || !isAuthenticated()) return;

    const tipoMap: { [key: string]: 'read' | 'to_read' | 'pending' | 'custom' } = {
      "Ver más tarde": 'to_read',
      "Pendiente": 'pending',
      "Leído": 'read',
    };

    const tipo = tipoMap[nombre] || 'custom';

    try {
      // Buscar si la lista ya existe
      const listasUsuario = await listaService.getUserListas();
      let lista = listasUsuario.find(l => l.nombre === nombre);

      if (!lista) {
        // Crear la lista si no existe
        lista = await listaService.createLista(nombre, tipo);
        // Actualizar el estado de listas para incluir la nueva
        setListas(prev => [...prev, lista!]);
      }

      // Agregar el libro a la lista
      await listaService.addLibroALista(lista.id, libro);
      alert(`Libro agregado a "${nombre}" exitosamente`);
      setShowListaDropdown(false);
    } catch (error) {
      console.error("Error adding book to list by name:", error);
      alert("Error al agregar el libro a la lista");
    }
  };

  const refreshResenas = async () => {
    if (!libro) return;
    try {
      dispatch({ type: 'SET_REVIEWS_LOADING', payload: true });
      const reviewsData = await getResenasByLibro(libro.id);
      const reviews = reviewsData?.reviews || [];
      const filtered = reviews.filter((r: Reseña) => r.estado !== "FLAGGED");
      dispatch({ type: 'SET_REVIEWS', payload: filtered });
      // actualizar likedByUser tras refresh
      const token = getToken();
      const userId = token ? getUserIdFromToken(token) : 0;
      const likedMap: Record<number, boolean> = {};
      filtered.forEach((r: Reseña) => {
        if (r.reacciones?.some(rec => rec.tipo === "like" && (rec.usuarioId ?? 0) === userId)) {
          likedMap[r.id] = true;
        }
      });
      dispatch({ type: 'SET_LIKED_BY_USER', payload: likedMap });
      // Recalculate average rating from parent reviews only
      const calculatedAvg = filtered.length > 0
        ? filtered.reduce((sum: number, r: Reseña) => sum + r.estrellas, 0) / filtered.length
        : 0;
      dispatch({ type: 'SET_AVERAGE_RATING', payload: calculatedAvg });
    } catch (error) {
      console.warn("Error refreshing reviews:", error);
    } finally {
      dispatch({ type: 'SET_REVIEWS_LOADING', payload: false });
    }
  };

  const addResenaLocally = (r: Reseña) => {
    dispatch({ type: 'SET_REVIEWS', payload: [r, ...reviewState.reseñas] });
  };

  const renderStars = (rating: number, sizeClass = "w-4 h-4") =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${sizeClass} ${i < Math.round(rating) ? "text-amber-400 fill-current" : "text-gray-300"}`}
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
    const filtered = reviewState.reseñas;
    if (reviewState.sortOrder === "mas_recientes")
      return [...filtered].sort((a, b) => Number(new Date(b.fechaResena)) - Number(new Date(a.fechaResena)));
    return [...filtered].sort((a, b) => b.estrellas - a.estrellas);
  };

  // Calculate rating distribution
  const ratingDistribution = useMemo(() => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewState.reseñas.forEach(review => {
      if (review.estrellas >= 1 && review.estrellas <= 5) {
        distribution[review.estrellas as keyof typeof distribution]++;
      }
    });
    return distribution;
  }, [reviewState.reseñas]);

  const toggleExpand = (id: number) =>
    dispatch({ type: 'TOGGLE_EXPAND_REVIEW', payload: id });

  const toggleReplyForm = (reviewId: number) => {
    dispatch({ type: 'SET_REPLY_FORM', payload: { reviewId, form: reviewState.replyForms[reviewId] ? null : { comentario: "", submitting: false, error: null } } });
  };

  const handleReplySubmit = async (reviewId: number, comentario: string) => {
    if (!libro) return;
    if (!isAuthenticated()) {
      alert("Debes iniciar sesión para responder a una reseña.");
      return;
    }
    if (!comentario.trim()) {
      dispatch({ type: 'SET_REPLY_FORM', payload: { reviewId, form: { ...reviewState.replyForms[reviewId]!, error: "El comentario no puede estar vacío." } } });
      return;
    }

    dispatch({ type: 'SET_REPLY_FORM', payload: { reviewId, form: { ...reviewState.replyForms[reviewId]!, submitting: true, error: null } } });

    try {
      const result = await crearRespuesta(reviewId, comentario);

      if (!result || !result.resena) {
        throw new Error("Respuesta inesperada del servidor al crear la respuesta");
      }

      // Refresh reviews to show the new reply
      await refreshResenas();

      // Close the form and reset
      dispatch({ type: 'SET_REPLY_FORM', payload: { reviewId, form: null } });
    } catch (err: any) {
      console.error("Error creando respuesta:", err);
      dispatch({ type: 'SET_REPLY_FORM', payload: { reviewId, form: { ...reviewState.replyForms[reviewId]!, submitting: false, error: err.message || "No se pudo crear la respuesta" } } });
    }
  };

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
    const currentlyLiked = !!reviewState.likedByUser[reviewId];
    // snapshots para revertir en caso de error
    const prevResenas = reviewState.reseñas;
    const prevLiked = reviewState.likedByUser;
    // optimista: actualizar contador y estado liked
    dispatch({ type: 'SET_LIKED_BY_USER', payload: { ...reviewState.likedByUser, [reviewId]: !currentlyLiked } });
    const newReacciones = !currentlyLiked
      ? [...(prevResenas.find(r => r.id === reviewId)?.reacciones || []), { id: Date.now(), tipo: "like", usuarioId }]
      : (prevResenas.find(r => r.id === reviewId)?.reacciones?.filter(rec => !(rec.tipo === "like" && (rec.usuarioId ?? 0) === usuarioId)) ?? []);
    dispatch({ type: 'UPDATE_REVIEW_REACTIONS', payload: { reviewId, reacciones: newReacciones } });
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
      dispatch({ type: 'SET_LIKED_BY_USER', payload: prevLiked });
      dispatch({ type: 'SET_REVIEWS', payload: prevResenas });
      alert("No se pudo actualizar la reacción. Intentá de nuevo.");
    }
  };

  // Formulario inline para crear reseña (estrellas + textarea grande)
  const NewReviewForm: React.FC<{ libroId: string; onAdded?: () => void; onOptimisticAdd?: (r: Reseña) => void }> = ({ onAdded, onOptimisticAdd }) => {
    const [estrellas, setEstrellas] = useState<number>(5);
    const [comentario, setComentario] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);
    const [errorLocal, setErrorLocal] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!libro) return;
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
        estado: "PENDING", // optimista (coincide con backend)
        fechaResena: new Date().toISOString(),
        usuario: { id: 0, username: "Tú", nombre: undefined },
        reacciones: [],
      };

      try {
        // mostrar inmediatamente
        onOptimisticAdd?.(tempReview);

        // agregarReseña retorna body JSON { message, resena }
        const result = await agregarReseña(libro.id, comentario, estrellas, {
          id: libro.id,
          titulo: libro.titulo,
          autores: libro.autores,
          descripcion: libro.descripcion,
          imagen: libro.imagen,
          enlace: libro.enlace,
          source: libro.source,
        });

        if (!result || !result.resena) {
          throw new Error("Respuesta inesperada del servidor al crear la reseña");
        }

        // opcional: podrías insertar result.resena directamente en la lista en lugar de refrescar
        // pero para mantener consistencia con lo guardado en DB, hacemos refresh desde el servidor
        onAdded?.();
        setComentario("");
        setEstrellas(5);
      } catch (err: any) {
        console.error("Error creando reseña:", err);
        setErrorLocal(err.message || "No se pudo crear la reseña");
        // quitar el temporal pidiendo al padre refrescar (onAdded)
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <button
          onClick={() => navigate(from)}
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors duration-200 group mb-6"
          aria-label="Volver a la página anterior"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" /> Volver
        </button>

        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 justify-center">
          {/* Cover Section */}
          <div className="flex justify-center">
            <div className="relative group">
              <img
                src={libro.coverUrl || libro.imagen || "https://via.placeholder.com/400x600"}
                alt={`Portada del libro ${libro.titulo}`}
                onLoad={() => setImageLoaded(true)}
                className={`w-48 h-72 sm:w-56 sm:h-80 lg:w-64 lg:h-96 object-cover rounded-xl shadow-2xl transition-all duration-500 group-hover:shadow-3xl group-hover:scale-105 ${
                  imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6 text-center">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">{libro.titulo}</h1>

              <div className="flex flex-wrap gap-2 justify-center">
                {libro.autores.map((a, i) => (
                  <Link
                    key={i}
                    to={`/autores/${encodeURIComponent(a)}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md text-sm font-medium text-gray-700 hover:text-indigo-700 transition-all duration-200 border border-gray-100"
                  >
                    <User className="w-4 h-4" />
                    {a}
                  </Link>
                ))}
              </div>

              {libro.source && (
                <span className="inline-block text-sm text-gray-600 bg-gray-100/80 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-200">
                  Fuente: {libro.source === "hardcover" ? "Hardcover" : "Google Books"}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
              <button
                onClick={toggleFavorito}
                className={`p-3 rounded-full transition-all duration-200 shadow-sm hover:shadow-md ${
                  esFavorito
                    ? "bg-red-100 text-red-500 hover:bg-red-200"
                    : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
                }`}
                aria-label={esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
              >
                <Heart className={`w-6 h-6 ${esFavorito ? "fill-current" : ""}`} />
              </button>

              {isAuthenticated() && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowListaDropdown(!showListaDropdown)}
                    className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md bg-white text-gray-700 hover:bg-gray-50 hover:scale-105 border border-gray-200"
                    aria-label="Agregar a una lista"
                  >
                    <Plus className="w-5 h-5" />
                    Agregar a Lista
                  </button>

                  {showListaDropdown && (
                    <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48 text-left">
                      {/* Opciones predefinidas (siempre se muestran si estás logueado) */}
                      {nombresDeListasFijas.map((nombre) => {
                        const tipoMap: { [key: string]: 'read' | 'to_read' | 'pending' | 'custom' } = {
                          "Ver más tarde": 'to_read',
                          "Pendiente": 'pending',
                          "Leído": 'read',
                        };
                        const tipo = tipoMap[nombre];
                        const listaExistente = listas.find(l => l.nombre === nombre);
                        const estaEnLista = listaExistente ? listasConLibro.has(listaExistente.id) : false;
                        return (
                          <button
                            key={nombre}
                            onClick={() => {
                              if (listaExistente) {
                                handleToggleInList(listaExistente);
                              } else {
                                handleAddToListByName(nombre);
                              }
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                          >
                            <span>{nombre}</span>
                            {estaEnLista && <span className="text-green-500">✓</span>}
                          </button>
                        );
                      })}

                      {/* El separador y las listas personalizadas solo aparecen si existen y no duplican las fijas */}
                      {(() => {
                        const listasFiltradas = listas.filter(l => !nombresDeListasFijas.includes(l.nombre));
                        return listasFiltradas.length > 0 ? (
                          <>
                            <hr className="my-1" />
                            {listasFiltradas.map((lista) => {
                              const estaEnLista = listasConLibro.has(lista.id);
                              return (
                                <button
                                  key={lista.id}
                                  onClick={() => estaEnLista ? null : handleAddToList(lista.id)}
                                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between ${estaEnLista ? 'text-gray-500' : ''}`}
                                  disabled={estaEnLista}
                                >
                                  <span>{lista.nombre}</span>
                                  {estaEnLista && <span className="text-green-500">✓</span>}
                                </button>
                              );
                            })}
                          </>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
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
            {renderSinopsis(libro.descripcion)}
          </p>
          {libro.descripcion && plainTextLength(libro.descripcion) > 200 && (
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

      {/* Rating */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white/90 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            Rating
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-lg text-gray-600">
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1">{renderStars(reviewState.averageRating || 0, "w-6 h-6")}</div>
                <span className="ml-2 font-medium text-xl">{(reviewState.averageRating || 0).toFixed(1)}/5</span>
                {reviewState.reseñas.length === 0 && (
                  <span className="ml-2 text-gray-400 text-sm">Libro sin reseñas</span>
                )}
              </div>
              <div className="mt-2 font-semibold">{reviewState.reseñas.length} reseñas</div>
            </div>
          </div>

          {/* Rating Distribution */}
          {reviewState.reseñas.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Resumen de calificaciones</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingDistribution[star as keyof typeof ratingDistribution];
                  const percentage = reviewState.reseñas.length > 0 ? (count / reviewState.reseñas.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm font-medium">{star}</span>
                        <Star className="w-4 h-4 text-amber-400 fill-current" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-amber-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reseñas mejoradas */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-purple-600" /> Reseñas
          </h2>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 text-right">
              <div className="font-semibold">{reviewState.reseñas.length} reseñas</div>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-lg shadow px-3 py-2">
              <button
                onClick={() => dispatch({ type: 'SET_SORT_ORDER', payload: 'mas_recientes' })}
                className={`text-sm px-2 py-1 rounded ${reviewState.sortOrder === 'mas_recientes' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
              >
                Más recientes
              </button>
              <button
                onClick={() => dispatch({ type: 'SET_SORT_ORDER', payload: 'mejor_valoradas' })}
                className={`text-sm px-2 py-1 rounded ${reviewState.sortOrder === 'mejor_valoradas' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
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
              libroId={libro.id}
              onAdded={refreshResenas}
              onOptimisticAdd={(r) => addResenaLocally(r)}
            />
          </div>
        )}

        <div className="space-y-6">
          {reviewState.reviewsLoading ? (
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
                  <UserAvatar usuario={r.usuario} />

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg">{r.usuario.nombre || r.usuario.username}</h4>
                          {r.estado === "PENDING" && (
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
                      <p className={`${reviewState.expandedReviewIds[r.id] ? '' : 'line-clamp-5'} text-lg leading-relaxed`}>{r.comentario}</p>
                      {r.comentario && r.comentario.length > 300 && (
                        <button onClick={() => toggleExpand(r.id)} className="mt-2 text-sm text-indigo-600 hover:underline flex items-center gap-1">
                          {reviewState.expandedReviewIds[r.id] ? <><ChevronUp className="w-4 h-4"/> Ver menos</> : <><ChevronDown className="w-4 h-4"/> Ver más</>}
                        </button>
                      )}
                    </div>

                    <div className="flex gap-6 mt-4 text-sm items-center">
                      <button
                        onClick={() => handleToggleLike(r.id)}
                        className={`flex items-center gap-2 ${reviewState.likedByUser[r.id] ? "text-indigo-600" : "text-gray-600"} hover:text-indigo-600`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{r.reacciones?.length || 0}</span>
                      </button>

                      <button
                        onClick={() => toggleReplyForm(r.id)}
                        className="text-gray-600 hover:text-indigo-600"
                      >
                        Responder
                      </button>

                      {(r.respuestas && r.respuestas.length > 1) && (
                        <button
                          onClick={() => dispatch({ type: 'TOGGLE_EXPAND_REPLIES', payload: r.id.toString() })}
                          className="text-gray-600 hover:text-indigo-600 flex items-center gap-1"
                        >
                          {reviewState.expandedReplies[r.id.toString()] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          {reviewState.expandedReplies[r.id.toString()] ? "Ver menos" : `Ver más respuestas (${(r.respuestas ? r.respuestas.length - 1 : 0)})`}
                        </button>
                      )}

                      <span className="ml-auto text-xs text-gray-400">ID: {r.id}</span>
                    </div>

                    {reviewState.replyForms[r.id] && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tu respuesta</label>
                            <textarea
                              value={reviewState.replyForms[r.id]!.comentario}
                              onChange={(e) =>
                                dispatch({ type: 'SET_REPLY_FORM', payload: { reviewId: r.id, form: { ...reviewState.replyForms[r.id]!, comentario: e.target.value } } })
                              }
                              rows={3}
                              className="w-full resize-y rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="Escribe tu respuesta..."
                            />
                          </div>

                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => dispatch({ type: 'SET_REPLY_FORM', payload: { reviewId: r.id, form: null } })}
                              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleReplySubmit(
                                  r.id,
                                  reviewState.replyForms[r.id]!.comentario
                                )
                              }
                              disabled={reviewState.replyForms[r.id]!.submitting || !reviewState.replyForms[r.id]!.comentario.trim()}
                              className="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {reviewState.replyForms[r.id]!.submitting ? "Enviando..." : "Responder"}
                            </button>
                          </div>

                          {reviewState.replyForms[r.id]!.error && (
                            <p className="text-sm text-red-600">{reviewState.replyForms[r.id]!.error}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Display replies */}
                    {r.respuestas && r.respuestas.length > 0 && (
                      <div className="mt-6 space-y-4 border-l-2 border-gray-200 pl-6">
                        {/* Always show the first reply */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex gap-3">
                            {r.respuestas[0].usuario.avatar ? (
                              <img
                                src={`/assets/${r.respuestas[0].usuario.avatar}.svg`}
                                alt={`Avatar de ${r.respuestas[0].usuario.username || r.respuestas[0].usuario.nombre}`}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-bold text-sm">
                                {((r.respuestas[0].usuario.nombre || r.respuestas[0].usuario.username) || "?")
                                  .split(" ")
                                  .map(s => s[0].toUpperCase())
                                  .slice(0, 2)
                                  .join("")}
                              </div>
                            )}

                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-semibold text-base">{r.respuestas[0].usuario.nombre || r.respuestas[0].usuario.username}</h5>
                                    {r.respuestas[0].resenaPadre && (
                                      <span className="text-sm text-gray-500">
                                        respondiendo a {r.respuestas[0].resenaPadre.usuario.nombre || r.respuestas[0].resenaPadre.usuario.username}
                                      </span>
                                    )}
                                  </div>

                                </div>

                                <div className="text-xs text-gray-400 flex items-center gap-2">
                                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(r.respuestas[0].fechaResena)}</span>
                                </div>
                              </div>

                              <div className="mt-2 text-gray-700">
                                <p className="text-base leading-relaxed">{r.respuestas[0].comentario}</p>
                              </div>

                              <div className="flex gap-4 mt-3 text-sm items-center">
                                <button
                                  onClick={() => r.respuestas && r.respuestas[0] && handleToggleLike(r.respuestas[0].id)}
                                  className={`flex items-center gap-1 ${r.respuestas && r.respuestas[0] && reviewState.likedByUser[r.respuestas[0].id] ? "text-indigo-600" : "text-gray-600"} hover:text-indigo-600`}
                                  disabled={!r.respuestas || !r.respuestas[0]}
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                  <span>{r.respuestas && r.respuestas[0]?.reacciones?.length || 0}</span>
                                </button>

                                <span className="ml-auto text-xs text-gray-400">ID: {r.respuestas[0].id}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Show additional replies only if expanded */}
                        {reviewState.expandedReplies[r.id.toString()] && r.respuestas.slice(1).map((reply) => (
                          <div key={reply.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex gap-3">
                              {reply.usuario.avatar ? (
                                <img
                                  src={`/assets/${reply.usuario.avatar}.svg`}
                                  alt={`Avatar de ${reply.usuario.username || reply.usuario.nombre}`}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-bold text-sm">
                                  {((reply.usuario.nombre || reply.usuario.username) || "?")
                                    .split(" ")
                                    .map(s => s[0].toUpperCase())
                                    .slice(0, 2)
                                    .join("")}
                                </div>
                              )}

                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-semibold text-base">{reply.usuario.nombre || reply.usuario.username}</h5>
                                      {reply.resenaPadre && (
                                        <span className="text-sm text-gray-500">
                                          respondiendo a {reply.resenaPadre.usuario.nombre || reply.resenaPadre.usuario.username}
                                        </span>
                                      )}
                                    </div>

                                  </div>

                                  <div className="text-xs text-gray-400 flex items-center gap-2">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(reply.fechaResena)}</span>
                                  </div>
                                </div>

                                <div className="mt-2 text-gray-700">
                                  <p className="text-base leading-relaxed">{reply.comentario}</p>
                                </div>

                                <div className="flex gap-4 mt-3 text-sm items-center">
                                  <button
                                    onClick={() => handleToggleLike(reply.id)}
                                    className={`flex items-center gap-1 ${reviewState.likedByUser[reply.id] ? "text-indigo-600" : "text-gray-600"} hover:text-indigo-600`}
                                  >
                                    <ThumbsUp className="w-3 h-3" />
                                    <span>{reply.reacciones?.length || 0}</span>
                                  </button>

                                  <span className="ml-auto text-xs text-gray-400">ID: {reply.id}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
