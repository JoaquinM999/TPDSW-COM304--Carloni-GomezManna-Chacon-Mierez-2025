import React, { useEffect, useMemo, useState } from "react";
import {
  obtenerResenasPendientes,
  aprobarResena,
  rechazarResena,
} from "../services/resenaService";
import { getAccessToken } from "../utils/tokenUtil";
import {
  Search,
  Star,
  RefreshCw,
  LogIn,
  Mail,
  Home,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";

/* ---------------------------
   Types
   --------------------------- */
interface Resena {
  id: number;
  comentario: string;
  estrellas: number;
  fechaResena: string;
  estado?: 'pending' | 'approved' | 'flagged';
  moderationScore?: number;
  moderationReasons?: string; // JSON string
  autoModerated?: boolean;
  usuario: {
    id: number;
    nombre: string;
    email: string;
  };
  libro: {
    id: number;
    titulo: string;
    slug?: string;
  };
}

/* ---------------------------
   Constantes
   --------------------------- */
const PAGE_SIZE = 6;
const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString() : "");



/* ---------------------------
   Componente Score de Moderación
   --------------------------- */
const ModerationBadge: React.FC<{ score?: number; autoModerated?: boolean }> = ({ score, autoModerated }) => {
  if (score === undefined) return null;

  let bgColor = "bg-gray-100";
  let textColor = "text-gray-700";
  let icon = <Info className="w-4 h-4" />;
  let label = "Sin analizar";

  if (score >= 80) {
    bgColor = "bg-green-100";
    textColor = "text-green-700";
    icon = <CheckCircle className="w-4 h-4" />;
    label = "Calidad alta";
  } else if (score >= 40) {
    bgColor = "bg-yellow-100";
    textColor = "text-yellow-700";
    icon = <AlertTriangle className="w-4 h-4" />;
    label = "Requiere revisión";
  } else {
    bgColor = "bg-red-100";
    textColor = "text-red-700";
    icon = <Shield className="w-4 h-4" />;
    label = "Contenido problemático";
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${bgColor} ${textColor} text-xs font-medium`}>
      {icon}
      <span>{label}: {score}/100</span>
      {autoModerated && <span className="ml-1 opacity-70">(Auto)</span>}
    </div>
  );
};

/* ---------------------------
   Componente Razones de Moderación
   --------------------------- */
const ModerationReasons: React.FC<{ reasons?: string }> = ({ reasons }) => {
  if (!reasons) return null;

  let parsed: any;
  try {
    parsed = JSON.parse(reasons);
  } catch {
    return null;
  }

  const items: string[] = [];
  if (parsed.sentiment) items.push(`Sentimiento: ${parsed.sentiment}`);
  if (parsed.profanity) items.push(`Lenguaje: ${parsed.profanity}`);
  if (parsed.spam) items.push(`Spam: ${parsed.spam}`);
  if (parsed.toxicity !== undefined) items.push(`Toxicidad: ${parsed.toxicity}%`);

  if (items.length === 0) return null;

  return (
    <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-800">
          <div className="font-semibold mb-1">Análisis automático:</div>
          <ul className="space-y-1">
            {items.map((item, idx) => (
              <li key={idx}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------
   Notificación flotante
   --------------------------- */
const Notice: React.FC<{ type: "success" | "error"; text: string; onClose?: () => void }> = ({
  type,
  text,
  onClose,
}) => {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed right-6 bottom-6 z-50 max-w-xs shadow-lg rounded-lg px-4 py-3 ${
        type === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          {type === "success" ? (
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600">!</div>
          )}
        </div>
        <div className="text-sm text-gray-800 flex-1">{text}</div>
        <button aria-label="Cerrar notificación" onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>
    </div>
  );
};

/* ---------------------------
   Componente principal
   --------------------------- */
const AdminModerationPage: React.FC = () => {
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null); // null = checking

  // UI state
  const [query, setQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [moderationFilter, setModerationFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [sortBy, setSortBy] = useState<"fecha_desc" | "fecha_asc" | "estrellas_desc" | "estrellas_asc">(
    "fecha_desc"
  );
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [actionLoadingIds, setActionLoadingIds] = useState<Record<number, boolean>>({});
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [confirmReject, setConfirmReject] = useState<{ ids: number[]; comentario?: string } | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    cargarResenasPendientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarResenasPendientes = async () => {
    setLoading(true);
    setGlobalError(null);
    setHasPermission(null);
    try {
      const token = getAccessToken();
      if (!token) {
        setHasPermission(false);
        setResenas([]);
        return;
      }
      const data = await obtenerResenasPendientes(token);
      setResenas(Array.isArray(data) ? data : []);
      setHasPermission(true);
    } catch (err: any) {
      // intenta detectar 401/403 en varios formatos
      const status = err?.response?.status ?? err?.status ?? (typeof err === "number" ? err : undefined);
      if (status === 401 || status === 403) {
        setHasPermission(false);
        setResenas([]);
      } else {
        console.error(err);
        setGlobalError("Ocurrió un problema al cargar las reseñas pendientes. Intentá recargar.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------- utilidades UI ---------- */
  const toggleSelect = (id: number) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectAllOnPage = (itemsOnPage: Resena[]) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = itemsOnPage.length > 0 && itemsOnPage.every((it) => next.has(it.id));
      if (allSelected) itemsOnPage.forEach((it) => next.delete(it.id));
      else itemsOnPage.forEach((it) => next.add(it.id));
      return next;
    });

  const clearSelection = () => setSelectedIds(new Set());
  const toggleExpand = (id: number) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  /* ---------- filtrado, orden y paginado ---------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = resenas.filter((r) => {
      // Filtro por rating
      if (ratingFilter !== "all" && r.estrellas !== ratingFilter) return false;
      
      // Filtro por score de moderación
      if (moderationFilter !== "all") {
        const score = r.moderationScore ?? 0;
        if (moderationFilter === "high" && score < 80) return false;
        if (moderationFilter === "medium" && (score < 40 || score >= 80)) return false;
        if (moderationFilter === "low" && score >= 40) return false;
      }
      
      // Filtro por texto
      if (!q) return true;
      return (
        r.comentario.toLowerCase().includes(q) ||
        r.usuario.nombre.toLowerCase().includes(q) ||
        r.usuario.email.toLowerCase().includes(q) ||
        r.libro.titulo.toLowerCase().includes(q)
      );
    });

    switch (sortBy) {
      case "fecha_asc":
        arr = arr.sort((a, b) => new Date(a.fechaResena).getTime() - new Date(b.fechaResena).getTime());
        break;
      case "fecha_desc":
        arr = arr.sort((a, b) => new Date(b.fechaResena).getTime() - new Date(a.fechaResena).getTime());
        break;
      case "estrellas_asc":
        arr = arr.sort((a, b) => a.estrellas - b.estrellas);
        break;
      case "estrellas_desc":
        arr = arr.sort((a, b) => b.estrellas - a.estrellas);
        break;
    }

    return arr;
  }, [resenas, query, ratingFilter, moderationFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const setLoadingFor = (id: number, loading: boolean) =>
    setActionLoadingIds((prev) => ({ ...prev, [id]: loading }));

  /* ---------- acciones (optimistic UI) ---------- */
  const handleAprobar = async (id: number) => {
    const token = getAccessToken();
    if (!token) return setNotice({ type: "error", text: "No autorizado." });
    setLoadingFor(id, true);
    const original = resenas;
    try {
      setResenas((prev) => prev.filter((r) => r.id !== id));
      await aprobarResena(id, token);
      setNotice({ type: "success", text: "Reseña aprobada." });
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      console.error(err);
      setResenas(original);
      setNotice({ type: "error", text: "Error al aprobar la reseña." });
    } finally {
      setLoadingFor(id, false);
    }
  };

  const requestReject = (ids: number[]) => setConfirmReject({ ids, comentario: "" });

  const performReject = async (ids: number[], comentario?: string) => {
    const token = getAccessToken();
    if (!token) return setNotice({ type: "error", text: "No autorizado." });
    const original = resenas;
    ids.forEach((id) => setLoadingFor(id, true));
    try {
      setResenas((prev) => prev.filter((r) => !ids.includes(r.id)));
      for (const id of ids) {
        // Pass comentario to rechazarResena if supported, otherwise just use it here to avoid unused variable error
        await rechazarResena(id, token /*, comentario */);
      }
      if (comentario) {
        // Optionally log or handle the comentario if not used in API
        console.log("Comentario de rechazo:", comentario);
      }
      setNotice({ type: "success", text: `Se rechazaron ${ids.length} reseña(s).` });
      setSelectedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((i) => next.delete(i));
        return next;
      });
    } catch (err) {
      console.error(err);
      setResenas(original);
      setNotice({ type: "error", text: "Error al rechazar reseñas." });
    } finally {
      ids.forEach((id) => setLoadingFor(id, false));
      setConfirmReject(null);
    }
  };

  const handleAprobarMasivo = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return setNotice({ type: "error", text: "No seleccionaste reseñas." });
    const token = getAccessToken();
    if (!token) return setNotice({ type: "error", text: "No autorizado." });
    const original = resenas;
    ids.forEach((id) => setLoadingFor(id, true));
    try {
      setResenas((prev) => prev.filter((r) => !ids.includes(r.id)));
      for (const id of ids) {
        await aprobarResena(id, token);
      }
      setNotice({ type: "success", text: `Aprobadas ${ids.length} reseña(s).` });
      clearSelection();
    } catch (err) {
      console.error(err);
      setResenas(original);
      setNotice({ type: "error", text: "Error al aprobar reseñas." });
    } finally {
      ids.forEach((id) => setLoadingFor(id, false));
    }
  };

  /* ---------- utilidades de navegación ---------- */
  const goToLogin = () => (window.location.href = "/LoginPage");
  const goHome = () => (window.location.href = "/");
  const contactSupport = () =>
    (window.location.href = "mailto:soporte@tuapp.com?subject=Acceso%20Moderaci%C3%B3n%20Rese%C3%B1as");

  /* ---------- helpers UI ---------- */

  /* ---------- RENDER ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">Moderación de Reseñas</h1>
            <p className="text-sm text-gray-500 mt-1">Revisá, aprobá o rechazá reseñas pendientes.</p>
          </div>

          {hasPermission !== false && (
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600 hidden md:block">
                Pendientes: <span className="font-medium">{resenas.length}</span>
              </div>

              <button
                onClick={cargarResenasPendientes}
                className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg shadow-sm hover:shadow-md transition"
                aria-label="Actualizar reseñas"
              >
                <RefreshCw className="w-4 h-4" /> <span className="hidden sm:inline">Actualizar</span>
              </button>
            </div>
          )}
        </div>

        {/* ---------- SIN PERMISO ---------- */}
        {hasPermission === false && (
          <section className="grid place-items-center py-12">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex gap-6 items-center">
                <div className="w-28 h-28 rounded-xl bg-gradient-to-br from-red-100 to-orange-50 flex items-center justify-center">
                  {/* ilustración simple */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-red-600" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10.29 3.86l-8 14A1 1 0 003.14 19h17.72a1 1 0 00.86-1.5l-8-14a1 1 0 00-1.72 0z" stroke="currentColor" strokeWidth="0" fill="currentColor" opacity="0.06"/>
                  </svg>
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-900">Acceso denegado</h2>
                  <p className="mt-2 text-gray-600">
                    No tenés permisos para moderar reseñas desde esta cuenta. Si creés que es un error, podés iniciar sesión con otra cuenta o pedir acceso al equipo.
                  </p>

                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <button onClick={goToLogin} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow">
                      <LogIn className="w-6 h-6" /> Iniciar sesión
                    </button>
                    <button onClick={contactSupport} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                      <Mail className="w-4 h-4" /> Solicitar acceso
                    </button>
                    <button onClick={goHome} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
                      <Home className="w-4 h-4" /> Volver al inicio
                    </button>
                  </div>

                  <div className="mt-4 text-xs text-gray-400">
                    Consejo: Si te conectaste con una cuenta personal y deberías tener permisos, pedile al administrador que te asigne el rol de moderador.
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ---------- ERROR GLOBAL ---------- */}
        {hasPermission !== false && globalError && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">
            {globalError}
          </div>
        )}

        {/* ---------- SKELETON LOADING ---------- */}
        {hasPermission !== false && loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg p-4 shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-6 bg-gray-200 rounded w-48" />
                  <div className="h-6 bg-gray-200 rounded w-16" />
                </div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
              </div>
            ))}
          </div>
        )}

        {/* ---------- UI PRINCIPAL ---------- */}
        {hasPermission !== false && !loading && !globalError && (
          <>
            {/* controles */}
            <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-1">
                <div className="absolute left-3 top-2.5 pointer-events-none">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-11 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-200"
                  placeholder="Buscar comentario, usuario o título..."
                  aria-label="Buscar reseñas"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={ratingFilter}
                  onChange={(e) => {
                    const v = e.target.value;
                    setRatingFilter(v === "all" ? "all" : Number(v));
                    setPage(1);
                  }}
                  className="border rounded-lg px-3 py-2 text-sm"
                  aria-label="Filtrar por valoración"
                >
                  <option value="all">Todas las valoraciones</option>
                  <option value="5">5 ★</option>
                  <option value="4">4 ★</option>
                  <option value="3">3 ★</option>
                  <option value="2">2 ★</option>
                  <option value="1">1 ★</option>
                </select>

                <select
                  value={moderationFilter}
                  onChange={(e) => {
                    setModerationFilter(e.target.value as any);
                    setPage(1);
                  }}
                  className="border rounded-lg px-3 py-2 text-sm bg-white"
                  aria-label="Filtrar por calidad de moderación"
                >
                  <option value="all">Todas las calidades</option>
                  <option value="high">✓ Alta calidad (80+)</option>
                  <option value="medium">⚠ Requiere revisión (40-79)</option>
                  <option value="low">⛔ Problemático (&lt;40)</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border rounded-lg px-3 py-2 text-sm"
                  aria-label="Ordenar reseñas"
                >
                  <option value="fecha_desc">Fecha: recientes</option>
                  <option value="fecha_asc">Fecha: antiguas</option>
                  <option value="estrellas_desc">Estrellas: mayor</option>
                  <option value="estrellas_asc">Estrellas: menor</option>
                </select>
              </div>
            </div>

            {/* acciones en lote */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">
                  Seleccionadas: <span className="font-medium">{selectedIds.size}</span>
                </div>
                <button
                  onClick={() => selectAllOnPage(paginated)}
                  className="px-3 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50"
                >
                  Seleccionar/Desmarcar página
                </button>
                <button onClick={clearSelection} className="px-3 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50">
                  Limpiar selección
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAprobarMasivo}
                  disabled={selectedIds.size === 0}
                  className={`px-4 py-2 rounded-lg text-white font-medium ${selectedIds.size === 0 ? "bg-green-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 shadow"}`}
                >
                  Aprobar seleccionadas
                </button>
                <button
                  onClick={() => requestReject(Array.from(selectedIds))}
                  disabled={selectedIds.size === 0}
                  className={`px-4 py-2 rounded-lg text-white font-medium ${selectedIds.size === 0 ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 shadow"}`}
                >
                  Rechazar seleccionadas
                </button>
              </div>
            </div>

            {/* lista */}
            {paginated.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">No hay reseñas pendientes.</div>
            ) : (
              <div className="space-y-4">
                {paginated.map((resena) => {
                  const isLoading = !!actionLoadingIds[resena.id];
                  const isSelected = selectedIds.has(resena.id);
                  const isExpanded = expandedIds.has(resena.id);
                  return (
                    <article key={resena.id} className="bg-white rounded-xl shadow p-4 flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center font-semibold">
                          {resena.usuario.nombre
                            .split(" ")
                            .map((s) => s[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                      </div>

                      <div className="flex-1">
                        <header className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{resena.usuario.nombre}</h3>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Libro:</span> {(resena.libro as any).nombre || resena.libro.titulo} · <span className="text-gray-500">{resena.usuario.email}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">Fecha: {formatDate(resena.fechaResena)}</div>
                            
                            {/* Badge de moderación */}
                            <div className="mt-2">
                              <ModerationBadge score={resena.moderationScore} autoModerated={resena.autoModerated} />
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0 ml-4">
                            <div className="text-sm font-semibold text-yellow-500 flex items-center justify-end">
                              <Star className="w-4 h-4" /> {resena.estrellas}/5
                            </div>

                            <label className="mt-2 inline-flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelect(resena.id)}
                                className="w-4 h-4"
                                aria-label={`Seleccionar reseña ${resena.id}`}
                              />
                              <span className="text-xs text-gray-500">Seleccionar</span>
                            </label>
                          </div>
                        </header>

                        <div className="mt-3 bg-gray-50 rounded-lg p-3">
                          <p className="text-gray-800">
                            {isExpanded ? resena.comentario : resena.comentario.slice(0, 300)}
                            {resena.comentario.length > 300 && (
                              <>
                                {!isExpanded ? "..." : ""}
                                <button onClick={() => toggleExpand(resena.id)} className="ml-2 text-sm text-sky-600 hover:underline">
                                  {isExpanded ? "Mostrar menos" : "Mostrar más"}
                                </button>
                              </>
                            )}
                          </p>
                        </div>

                        {/* Razones de moderación */}
                        <ModerationReasons reasons={resena.moderationReasons} />

                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleAprobar(resena.id)}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-lg text-white font-medium ${isLoading ? "bg-green-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 shadow"}`}
                          >
                            {isLoading ? "Procesando..." : "Aprobar"}
                          </button>

                          <button
                            onClick={() => requestReject([resena.id])}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-lg text-white font-medium ${isLoading ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 shadow"}`}
                          >
                            Rechazar
                          </button>

                          <a
                            href={`/libros/${resena.libro.slug ?? resena.libro.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            Ver libro ↗
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* paginación */}
            {filtered.length > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Mostrando <span className="font-medium">{(currentPage - 1) * PAGE_SIZE + 1}</span> - <span className="font-medium">{Math.min(currentPage * PAGE_SIZE, filtered.length)}</span> de <span className="font-medium">{filtered.length}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded-lg"
                  >
                    ◀ Anterior
                  </button>

                  <div className="text-sm text-gray-700">Página {currentPage} / {totalPages}</div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded-lg"
                  >
                    Siguiente ▶
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* modal confirmar rechazo */}
      {confirmReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold mb-2">Confirmar rechazo</h3>
            <p className="text-sm text-gray-600 mb-4">Vas a rechazar {confirmReject.ids.length} reseña(s). Podés agregar un comentario opcional que se registre con el rechazo.</p>

            <textarea
              value={confirmReject.comentario}
              onChange={(e) => setConfirmReject({ ...confirmReject, comentario: e.target.value })}
              placeholder="Comentario opcional..."
              className="w-full border rounded-md p-2 mb-4 min-h-[90px]"
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmReject(null)} className="px-4 py-2 border rounded-lg">Cancelar</button>
              <button onClick={() => performReject(confirmReject.ids, confirmReject.comentario)} className="px-4 py-2 bg-red-600 text-white rounded-lg">Confirmar rechazo</button>
            </div>
          </div>
        </div>
      )}

      {/* notificación */}
      {notice && <Notice type={notice.type} text={notice.text} onClose={() => setNotice(null)} />}
    </div>
  );
};

export default AdminModerationPage;
