import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listaService, Lista, ContenidoLista } from '../services/listaService';
import toast, { Toaster } from 'react-hot-toast';
import { LoadingSkeleton, ListHeaderSkeleton, ToolbarSkeleton } from '../componentes/LoadingSkeleton';
import { 
  BookOpen, 
  Grid3x3, 
  List, 
  Search, 
  Filter, 
  SortAsc, 
  Star, 
  BookMarked,
  Clock,
  Check,
  ArrowLeft,
  X,
  GripVertical,
  Maximize2
} from 'lucide-react';

type OrderBy = 'alfabetico' | 'fecha' | 'rating' | 'personalizado';
type ViewMode = 'grid' | 'list';

export default function DetalleLista() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const listaId = id ? parseInt(id) : 0;

  const [lista, setLista] = useState<Lista | null>(null);
  const [contenidos, setContenidos] = useState<ContenidoLista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros y visualización
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [orderBy, setOrderBy] = useState<OrderBy>('fecha');
  const [search, setSearch] = useState('');
  const [filterAutor, setFilterAutor] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterRating, setFilterRating] = useState<number | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    cargarLista();
  }, [listaId, orderBy, filterAutor, filterCategoria, filterRating, search]);

  const cargarLista = async () => {
    try {
      setLoading(true);
      setError(null);

      const filtros = {
        orderBy,
        filterAutor: filterAutor || undefined,
        filterCategoria: filterCategoria || undefined,
        filterRating: filterRating,
        search: search || undefined,
      };

      const data = await listaService.getListaDetallada(listaId, filtros);
      setLista(data);
      setContenidos(data.contenidos || []);
    } catch (err) {
      setError('Error al cargar la lista');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLibro = async (libroId: number) => {
    // Toast de confirmación interactivo
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-gray-900">¿Eliminar este libro de la lista?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              
              // Toast promise para mostrar progreso
              await toast.promise(
                listaService.removeLibroDeLista(listaId, libroId.toString()),
                {
                  loading: 'Eliminando libro...',
                  success: '¡Libro eliminado correctamente!',
                  error: 'Error al eliminar el libro',
                }
              );
              
              // Actualizar lista después de éxito
              setContenidos(contenidos.filter(c => c.libro.id !== libroId));
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Eliminar
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
    });
  };

  const limpiarFiltros = () => {
    setFilterAutor('');
    setFilterCategoria('');
    setFilterRating(undefined);
    setSearch('');
    setOrderBy('fecha');
  };

  const getListaIcon = (tipo: string) => {
    switch (tipo) {
      case 'read':
        return <Check className="w-6 h-6 text-green-600" />;
      case 'to_read':
        return <Clock className="w-6 h-6 text-blue-600" />;
      case 'pending':
        return <BookMarked className="w-6 h-6 text-yellow-600" />;
      default:
        return <BookOpen className="w-6 h-6 text-purple-600" />;
    }
  };

  const getListaColor = (tipo: string) => {
    switch (tipo) {
      case 'read':
        return 'bg-green-100 border-green-300';
      case 'to_read':
        return 'bg-blue-100 border-blue-300';
      case 'pending':
        return 'bg-yellow-100 border-yellow-300';
      default:
        return 'bg-purple-100 border-purple-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Toaster position="top-center" />
        <ListHeaderSkeleton />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <ToolbarSkeleton />
          <LoadingSkeleton count={10} viewMode={viewMode} />
        </div>
      </div>
    );
  }

  if (error || !lista) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <Toaster position="top-center" />
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{error || 'Lista no encontrada'}</p>
          <button
            onClick={() => navigate('/mis-listas')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Volver a Mis Listas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>

          <div className={`p-6 rounded-xl shadow-lg border-2 ${getListaColor(lista.tipo)}`}>
            <div className="flex items-center gap-4">
              {getListaIcon(lista.tipo)}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{lista.nombre}</h1>
                <p className="text-gray-600 mt-1">
                  {contenidos.length} {contenidos.length === 1 ? 'libro' : 'libros'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Búsqueda */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar en la lista..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Ordenamiento */}
            <div className="flex items-center gap-2">
              <SortAsc className="w-5 h-5 text-gray-600" />
              <select
                value={orderBy}
                onChange={(e) => setOrderBy(e.target.value as OrderBy)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="fecha">Más recientes</option>
                <option value="alfabetico">Alfabético</option>
                <option value="rating">Mejor valorados</option>
                <option value="personalizado">Orden personalizado</option>
              </select>
            </div>

            {/* Toggle Vista */}
            <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'}`}
                title="Vista grid"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'}`}
                title="Vista lista"
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Botón Filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                showFilters ? 'bg-purple-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filtros
            </button>
          </div>

          {/* Panel de Filtros */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                  <input
                    type="text"
                    placeholder="Filtrar por autor..."
                    value={filterAutor}
                    onChange={(e) => setFilterAutor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <input
                    type="text"
                    placeholder="Filtrar por categoría..."
                    value={filterCategoria}
                    onChange={(e) => setFilterCategoria(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating mínimo</label>
                  <select
                    value={filterRating || ''}
                    onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Todos</option>
                    <option value="4">4★ o más</option>
                    <option value="3">3★ o más</option>
                    <option value="2">2★ o más</option>
                    <option value="1">1★ o más</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={limpiarFiltros}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Contenido */}
        {contenidos.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No hay libros en esta lista</p>
            <p className="text-gray-500 mt-2">
              {search || filterAutor || filterCategoria || filterRating
                ? 'Intenta ajustar los filtros'
                : 'Empieza a agregar libros desde la página de detalle de cada libro'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {contenidos.map((contenido) => (
              <div
                key={contenido.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/libro/${contenido.libro.id}`)}
              >
                <div className="relative aspect-[2/3]">
                  {contenido.libro.imagen ? (
                    <img
                      src={contenido.libro.imagen}
                      alt={contenido.libro.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-gray-400" />
                    </div>
                  )}

                  {/* Botón eliminar */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveLibro(contenido.libro.id);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Eliminar de la lista"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Rating */}
                  {contenido.libro.ratingLibro && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {contenido.libro.ratingLibro.avgRating.toFixed(1)}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900 line-clamp-2 text-lg mb-1">
                    {contenido.libro.nombre}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {contenido.libro.autores?.[0] || 'Autor desconocido'}
                  </p>
                  {contenido.libro.categoria && (
                    <p className="text-xs text-purple-600 mt-2 font-medium">
                      {contenido.libro.categoria.nombre}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {contenidos.map((contenido) => (
              <div
                key={contenido.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 flex gap-4 group cursor-pointer"
                onClick={() => navigate(`/libro/${contenido.libro.id}`)}
              >
                {/* Imagen */}
                <div className="flex-shrink-0">
                  {contenido.libro.imagen ? (
                    <img
                      src={contenido.libro.imagen}
                      alt={contenido.libro.nombre}
                      className="w-24 h-36 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-24 h-36 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Información */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {contenido.libro.nombre}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    por {contenido.libro.autores?.[0] || 'Autor desconocido'}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-3">
                    {contenido.libro.categoria && (
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {contenido.libro.categoria.nombre}
                      </span>
                    )}
                    
                    {contenido.libro.ratingLibro && (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-semibold">{contenido.libro.ratingLibro.avgRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botón eliminar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveLibro(contenido.libro.id);
                  }}
                  className="flex-shrink-0 p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar de la lista"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
