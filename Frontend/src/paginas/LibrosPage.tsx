import { useState } from "react";
import {
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  Grid,
  List,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Biblioteca() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [sortBy, setSortBy] = useState("rating-desc");
  const [yearRange, setYearRange] = useState([1900, new Date().getFullYear()]);
  const [minRating, setMinRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const categorias = [
    "Todas",
    "Ficción",
    "No Ficción",
    "Ciencia",
    "Historia",
    "Biografía",
    "Tecnología",
    "Fantasía",
    "Desarrollo Personal",
  ];

  const libros = [
    {
      id: 1,
      titulo: "El Principito",
      autor: "Antoine de Saint-Exupéry",
      categoria: "Ficción",
      anio: 1943,
      rating: 4.8,
      imagen:
        "https://tienda.planetadelibros.com.ar/cdn/shop/products/portada_el-principito_antoine-de-saint-exupery_201507152131.jpg?v=1684356025",
    },
    {
      id: 2,
      titulo: "Sapiens",
      autor: "Yuval Noah Harari",
      categoria: "Historia",
      anio: 2011,
      rating: 4.7,
      imagen:
        "https://images-na.ssl-images-amazon.com/images/I/713jIoMO3UL.jpg",
    },
    {
      id: 3,
      titulo: "Breves Respuestas a las Grandes Preguntas",
      autor: "Stephen Hawking",
      categoria: "Ciencia",
      anio: 2018,
      rating: 4.5,
      imagen:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsYcDCoIMTykyUyKyKY-Z3HPl1Xm00ByfWvA&s",
    },
    {
      id: 4,
      titulo: "Steve Jobs",
      autor: "Walter Isaacson",
      categoria: "Biografía",
      anio: 2011,
      rating: 4.6,
      imagen:
        "https://images-na.ssl-images-amazon.com/images/I/81VStYnDGrL.jpg",
    },
    {
      id: 5,
      titulo: "1984",
      autor: "George Orwell",
      categoria: "Ficción",
      anio: 1949,
      rating: 4.9,
      imagen:
        "https://images-na.ssl-images-amazon.com/images/I/71kxa1-0mfL.jpg",
    },
    {
      id: 6,
      titulo: "Cien Años de Soledad",
      autor: "Gabriel García Márquez",
      categoria: "Ficción",
      anio: 1967,
      rating: 4.8,
      imagen:
        "https://images.cdn3.buscalibre.com/fit-in/360x360/61/8d/618d227e8967274cd9589a549adff52d.jpg",
    },
    {
      id: 7,
      titulo: "La Historia del Tiempo",
      autor: "Stephen Hawking",
      categoria: "Ciencia",
      anio: 1988,
      rating: 4.6,
      imagen:
        "https://images.cdn3.buscalibre.com/fit-in/360x360/c1/d5/c1d562eb8d27c7af22c9f981f4de04f1.jpg",
    },
    {
      id: 8,
      titulo: "Hábitos Atómicos",
      autor: "James Clear",
      categoria: "Desarrollo Personal",
      anio: 2018,
      rating: 4.9,
      imagen:
        "https://images-na.ssl-images-amazon.com/images/I/81YkqyaFVEL.jpg",
    },
    {
      id: 9,
      titulo: "El Código Da Vinci",
      autor: "Dan Brown",
      categoria: "Ficción",
      anio: 2003,
      rating: 4.4,
      imagen:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwjO6w_kC-7SoZVFeb6b28WFizkWKClBotHw&s",
    },
    {
      id: 10,
      titulo: "El Poder del Ahora",
      autor: "Eckhart Tolle",
      categoria: "Desarrollo Personal",
      anio: 1997,
      rating: 4.8,
      imagen:
        "https://i.scdn.co/image/ab67656300005f1f09bca073f33481c28c6f4f7e",
    },
    {
      id: 11,
      titulo: "El Señor de los Anillos",
      autor: "J.R.R. Tolkien",
      categoria: "Fantasía",
      anio: 1954,
      rating: 4.9,
      imagen:
        "https://http2.mlstatic.com/D_NQ_NP_688188-MLM52351332358_112022-O.webp",
    },
    {
      id: 12,
      titulo: "Harry Potter y la Piedra Filosofal",
      autor: "J.K. Rowling",
      categoria: "Fantasía",
      anio: 1997,
      rating: 4.9,
      imagen:
        "https://images-na.ssl-images-amazon.com/images/I/81YOuOGFCJL.jpg",
    },
    {
      id: 13,
      titulo: "El Hombre en Busca de Sentido",
      autor: "Viktor Frankl",
      categoria: "No Ficción",
      anio: 1946,
      rating: 4.8,
      imagen:
        "https://images-na.ssl-images-amazon.com/images/I/81l3rZK4lnL.jpg",
    },
    {
      id: 14,
      titulo: "La Inteligencia Emocional",
      autor: "Daniel Goleman",
      categoria: "No Ficción",
      anio: 1995,
      rating: 4.7,
      imagen:
        "https://sbslibreria.vtexassets.com/arquivos/ids/5071627/CXVD5XAKQvVkrdcXyhLmeglXjr8-.jpg?v=638854119389800000",
    },
    {
      id: 15,
      titulo: "Clean Code",
      autor: "Robert C. Martin",
      categoria: "Tecnología",
      anio: 2008,
      rating: 4.9,
      imagen:
        "https://images-na.ssl-images-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg",
    },
    {
      id: 16,
      titulo: "El Arte de la Guerra",
      autor: "Sun Tzu",
      categoria: "Historia",
      anio: -500,
      rating: 4.7,
      imagen:
        "https://images-na.ssl-images-amazon.com/images/I/81UOcmRGbGL.jpg",
    },
    {
      id: 17,
      titulo: "Los Pilares de la Tierra",
      autor: "Ken Follett",
      categoria: "Ficción",
      anio: 1989,
      rating: 4.8,
      imagen:
        "https://images.cdn2.buscalibre.com/fit-in/360x360/77/c4/77c49fa72ff4ce2e0ee6239e77d1c25b.jpg",
    },
    {
      id: 18,
      titulo: "Fundación",
      autor: "Isaac Asimov",
      categoria: "Ciencia",
      anio: 1951,
      rating: 4.8,
      imagen:
        "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1170429948i/53687.jpg",
    },
    {
      id: 19,
      titulo: "La Sombra del Viento",
      autor: "Carlos Ruiz Zafón",
      categoria: "Ficción",
      anio: 2001,
      rating: 4.9,
      imagen:
        "https://images.cdn3.buscalibre.com/fit-in/360x360/aa/d8/aad8db0b27a7bfcefafc4e13a66ddac6.jpg",
    },
    {
      id: 20,
      titulo: "El Juego de Ender",
      autor: "Orson Scott Card",
      categoria: "Ciencia",
      anio: 1985,
      rating: 4.7,
      imagen:
        "https://libros-prohibidos.com/wp-content/uploads/2017/12/juego-de-ender-Libros-Prohibidos-1.jpg",
    },
    {
      id: 21,
      titulo: "El Alquimista",
      autor: "Paulo Coelho",
      categoria: "Ficción",
      anio: 1988,
      rating: 4.3,
      imagen:
        "https://images-na.ssl-images-amazon.com/images/I/71aFt4+OTOL.jpg",
    },
    {
      id: 22,
      titulo: "Mindset",
      autor: "Carol S. Dweck",
      categoria: "Desarrollo Personal",
      anio: 2006,
      rating: 4.6,
      imagen:
        "https://http2.mlstatic.com/D_NQ_NP_616868-MLA82932685767_032025-O.webp",
    },
    {
      id: 24,
      titulo: "Moby Dick",
      autor: "Herman Melville",
      categoria: "Ficción",
      anio: 1851,
      rating: 4.1,
      imagen:
        "https://images-na.ssl-images-amazon.com/images/I/81c9xwF0SoL.jpg",
    },
    {
      id: 25,
      titulo: "Pensar rápido, pensar despacio",
      autor: "Daniel Kahneman",
      categoria: "No Ficción",
      anio: 2011,
      rating: 4.5,
      imagen:
        "https://acdn-us.mitiendanube.com/stores/004/088/117/products/552128-69703ff82cc3979a2d17275389497024-1024-1024.jpg",
    },
    {
      id: 26,
      titulo: "La rebelión de Atlas",
      autor: "Ayn Rand",
      categoria: "Ficción",
      anio: 1957,
      rating: 4.2,
      imagen:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcbXy8zSzSABg1pS5Q3VhByV6Qt1Ea1oTtPQ&s",
    },
    {
      id: 27,
      titulo: "El monje que vendió su Ferrari",
      autor: "Robin Sharma",
      categoria: "Desarrollo Personal",
      anio: 1997,
      rating: 4.4,
      imagen:
        "https://acdn-us.mitiendanube.com/stores/004/088/117/products/508491-1169b6ea9d966db6e917401963839218-1024-1024.jpg",
    },
    {
      id: 28,
      titulo: "Crónica de una muerte anunciada",
      autor: "Gabriel García Márquez",
      categoria: "Ficción",
      anio: 1981,
      rating: 4.6,
      imagen:
        "https://images.cdn2.buscalibre.com/fit-in/360x360/13/97/1397a4f28df5ed21f99177884f3276bd.jpg",
    },
    {
      id: 29,
      titulo: "Thinking in Systems",
      autor: "Donella Meadows",
      categoria: "No Ficción",
      anio: 2008,
      rating: 4.5,
      imagen:
        "https://m.media-amazon.com/images/I/71+QmpkC0aL._UF1000,1000_QL80_.jpg",
    },
    {
      id: 30,
      titulo: "La Metamorfosis",
      autor: "Franz Kafka",
      categoria: "Ficción",
      anio: 1915,
      rating: 4.3,
      imagen:
        "https://acdn-us.mitiendanube.com/stores/001/029/689/products/la-metamorfosis-d8f83bea7935778bce17213973938658-1024-1024.jpg",
    },
    {
      id: 31,
      titulo: "The Pragmatic Programmer",
      autor: "Andrew Hunt, David Thomas",
      categoria: "Tecnología",
      anio: 1999,
      rating: 4.7,
      imagen: "https://images-na.ssl-images-amazon.com/images/I/41as+WafrFL._SX258_BO1,204,203,200_.jpg",
    },
    {
      id: 32,
      titulo: "Introduction to Algorithms",
      autor: "Thomas H. Cormen",
      categoria: "Tecnología",
      anio: 2009,
      rating: 4.5,
      imagen: "https://elsolucionario.net/wp-content/archivos/2014/02/introduccion-a-los-algoritmos-thomas-h-cormen.jpg",
    },
    {
      id: 33,
      titulo: "Clean Architecture",
      autor: "Robert C. Martin",
      categoria: "Tecnología",
      anio: 2017,
      rating: 4.8,
      imagen: "https://images-na.ssl-images-amazon.com/images/I/51-nXsSRfZL._SX379_BO1,204,203,200_.jpg",
    },
  
    // Libros de Romance
    {
      id: 34,
      titulo: "Orgullo y prejuicio",
      autor: "Jane Austen",
      categoria: "Romance",
      anio: 1813,
      rating: 4.6,
      imagen: "https://images-na.ssl-images-amazon.com/images/I/81OthjkJBuL.jpg",
    },
    {
      id: 35,
      titulo: "Bajo la misma estrella",
      autor: "John Green",
      categoria: "Romance",
      anio: 2012,
      rating: 4.7,
      imagen: "https://images-na.ssl-images-amazon.com/images/I/81WojUxbbFL.jpg",
    },
    {
      id: 36,
      titulo: "El cuaderno de Noah",
      autor: "Nicholas Sparks",
      categoria: "Romance",
      anio: 1996,
      rating: 4.5,
      imagen: "https://www.penguinlibros.com/ar/3416180/el-cuaderno-de-noah.jpg",
    },
    {
      id: 37,
      titulo: "It",
      autor: "Stephen King",
      categoria: "Terror",
      anio: 1986,
      rating: 4.6,
      imagen: "https://upload.wikimedia.org/wikipedia/commons/1/1a/It_%281986%29_front_cover%2C_first_edition.jpg",
    },
    {
      id: 38,
      titulo: "El resplandor",
      autor: "Stephen King",
      categoria: "Terror",
      anio: 1977,
      rating: 4.7,
      imagen: "https://www.penguinlibros.com/ar/3005382/el-resplandor.jpg",
    },
    {
      id: 39,
      titulo: "Drácula",
      autor: "Bram Stoker",
      categoria: "Terror",
      anio: 1897,
      rating: 4.4,
      imagen: "https://images-na.ssl-images-amazon.com/images/I/81WcnNQ-TBL.jpg",
    },
    {
      id: 40,
      titulo: "La Comunidad del Anillo",
      autor: "J.R.R. Tolkien",
      categoria: "Fantasía",
      anio: 1954,
      rating: 4.9,
      imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1TGoFWd8Pkv8qQ-CttwTB_YnHsJGha5GoPg&s",
      saga: { nombre: "El Señor de los Anillos", numero: 1 },
    },
    {
      id: 41,
      titulo: "Las Dos Torres",
      autor: "J.R.R. Tolkien",
      categoria: "Fantasía",
      anio: 1954,
      rating: 4.8,
      imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNqKWtGIqn13Weug8OxD6zcU0Y8ezG6fcBSw&s",
      saga: { nombre: "El Señor de los Anillos", numero: 2 },
    },
    {
      id: 42,
      titulo: "El Retorno del Rey",
      autor: "J.R.R. Tolkien",
      categoria: "Fantasía",
      anio: 1955,
      rating: 4.9,
      imagen: "https://acdn-us.mitiendanube.com/stores/001/184/069/products/senor-de-los-anillos-a28792c63659ac768617198586219037-1024-1024.jpg",
      saga: { nombre: "El Señor de los Anillos", numero: 3 },
    },
  
    // Harry Potter (Saga)
    {
      id: 43,
      titulo: "Harry Potter y la Cámara Secreta",
      autor: "J.K. Rowling",
      categoria: "Fantasía",
      anio: 1998,
      rating: 4.8,
      imagen: "https://acdn-us.mitiendanube.com/stores/004/088/117/products/719012-eb30482cc3dfa7dec017275732849314-640-0.jpg",
      saga: { nombre: "Harry Potter", numero: 2 },
    },
    {
      id: 44,
      titulo: "Harry Potter y el Prisionero de Azkaban",
      autor: "J.K. Rowling",
      categoria: "Fantasía",
      anio: 1999,
      rating: 4.9,
      imagen: "https://acdn-us.mitiendanube.com/stores/001/542/126/products/9789878000121-63518e7630046fa93816944480609674-1024-1024.jpg",
      saga: { nombre: "Harry Potter", numero: 3 },
    },
  
    // Canción de Hielo y Fuego (Juego de Tronos)
    {
      id: 45,
      titulo: "Juego de Tronos",
      autor: "George R.R. Martin",
      categoria: "Fantasía",
      anio: 1996,
      rating: 4.7,
      imagen: "https://images-na.ssl-images-amazon.com/images/I/91dSMhdIzTL.jpg",
      saga: { nombre: "Canción de Hielo y Fuego", numero: 1 },
    },
    {
      id: 46,
      titulo: "Choque de Reyes",
      autor: "George R.R. Martin",
      categoria: "Fantasía",
      anio: 1998,
      rating: 4.7,
      imagen: "https://images.cdn2.buscalibre.com/fit-in/360x360/49/40/49404e2a40a96b171803e04eedc25b8d.jpg",
      saga: { nombre: "Canción de Hielo y Fuego", numero: 2 },
    },
    {
      id: 47,
      titulo: "Tormenta de Espadas",
      autor: "George R.R. Martin",
      categoria: "Fantasía",
      anio: 2000,
      rating: 4.8,
      imagen: "https://images.cdn2.buscalibre.com/fit-in/360x360/2e/6c/2e6cbfe069df51a98c027273be8c13fe.jpg",
      saga: { nombre: "Canción de Hielo y Fuego", numero: 3 },
    },
  
    // Divergente (Saga)
    {
      id: 48,
      titulo: "Divergente",
      autor: "Veronica Roth",
      categoria: "Ficción",
      anio: 2011,
      rating: 4.4,
      imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRC9JiJmi1SSFkG1mt1TD7DyD1Vw5yGE9nLKQ&s",
      saga: { nombre: "Divergente", numero: 1 },
    },
    {
      id: 49,
      titulo: "Insurgente",
      autor: "Veronica Roth",
      categoria: "Ficción",
      anio: 2012,
      rating: 4.2,
      imagen: "https://images.cdn2.buscalibre.com/fit-in/360x360/0c/fc/0cfcc9a03fd81106ec9ff9428ac6bf71.jpg",
      saga: { nombre: "Divergente", numero: 2 },
    },
    {
      id: 50,
      titulo: "Leal",
      autor: "Veronica Roth",
      categoria: "Ficción",
      anio: 2013,
      rating: 4.1,
      imagen: "https://beta-content.tap-commerce.com.ar/cover/large/9789878120089_1.jpg?id_com=1102",
      saga: { nombre: "Divergente", numero: 3 },
    },
  
    // Crónica del Asesino de Reyes (Patrick Rothfuss)
    {
      id: 51,
      titulo: "El Nombre del Viento",
      autor: "Patrick Rothfuss",
      categoria: "Fantasía",
      anio: 2007,
      rating: 4.8,
      imagen: "https://images-na.ssl-images-amazon.com/images/I/91bYsX41DVL.jpg",
      saga: { nombre: "Crónica del Asesino de Reyes", numero: 1 },
    },
    {
      id: 52,
      titulo: "El Temor de un Hombre Sabio",
      autor: "Patrick Rothfuss",
      categoria: "Fantasía",
      anio: 2011,
      rating: 4.7,
      imagen: "https://www.edicontinente.com.ar/image/titulos/9788499899619.jpg",
      saga: { nombre: "Crónica del Asesino de Reyes", numero: 2 },
    },
    // The Hunger Games (Los Juegos del Hambre)
    {
      id: 53,
      titulo: "Los Juegos del Hambre",
      autor: "Suzanne Collins",
      categoria: "Ficción",
      anio: 2008,
      rating: 4.7,
      imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQK0s2-lkDLtQTyBCsZ54a5ZCT75R3B-20xyw&s",
      saga: { nombre: "Los Juegos del Hambre", numero: 1 },
    },
    {
      id: 54,
      titulo: "En Llamas",
      autor: "Suzanne Collins",
      categoria: "Ficción",
      anio: 2009,
      rating: 4.5,
      imagen: "https://acdn-us.mitiendanube.com/stores/004/088/117/products/688009-6e44a959c3e6b194ba17277408455416-1024-1024.jpg",
      saga: { nombre: "Los Juegos del Hambre", numero: 2 },
    },
    {
      id: 55,
      titulo: "Sinsajo",
      autor: "Suzanne Collins",
      categoria: "Ficción",
      anio: 2010,
      rating: 4.4,
      imagen: "https://acdn-us.mitiendanube.com/stores/001/542/126/products/9789878120225-0ebf08a99059c2029516944494604272-480-0.jpg",
      saga: { nombre: "Los Juegos del Hambre", numero: 3 },
    },
  ];
  const librosFiltrados = libros
    .filter(
      (libro) =>
        libro.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        libro.autor.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((libro) => selectedCategory === "Todas" || libro.categoria === selectedCategory)
    .filter((libro) => libro.anio >= yearRange[0] && libro.anio <= yearRange[1])
    .filter((libro) => libro.rating >= minRating)
    .sort((a, b) => {
      switch (sortBy) {
        case "rating-desc":
          return b.rating - a.rating;
        case "rating-asc":
          return a.rating - b.rating;
        case "year-desc":
          return b.anio - a.anio;
        case "year-asc":
          return a.anio - b.anio;
        case "title-asc":
          return a.titulo.localeCompare(b.titulo);
        case "title-desc":
          return b.titulo.localeCompare(a.titulo);
        default:
          return 0;
      }
    });

  // PAGINACIÓN
  const librosPorPagina = 8;
  const totalPaginas = Math.ceil(librosFiltrados.length / librosPorPagina);
  const librosPaginaActual = librosFiltrados.slice(
    (currentPage - 1) * librosPorPagina,
    currentPage * librosPorPagina
  );

  const irAPagina = (num: number) => {
    if (num < 1) num = 1;
    else if (num > totalPaginas) num = totalPaginas;
    setCurrentPage(num);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Variants para animación
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.42, 0, 0.58, 1],
      },
    },
    exit: {
      opacity: 0,
      y: -30,
      scale: 0.95,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-white to-blue-100 text-blue-900 font-sans p-6 max-w-7xl mx-auto select-none">
      {/* Header y búsqueda */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-blue-700 tracking-wide drop-shadow-sm select-text">
            Biblioteca
          </h1>
          <p className="text-blue-700 mt-1 font-medium select-text">
            Explora nuestra colección completa de libros
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white rounded-3xl shadow-md px-5 py-3 flex-grow max-w-xl border border-blue-200 focus-within:ring-4 focus-within:ring-blue-300 transition">
          <Search className="text-blue-400" />
          <input
            type="search"
            placeholder="Buscar por título o autor..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-blue-900 placeholder-blue-300 text-lg font-medium outline-none bg-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-blue-400 hover:text-blue-600 transition"
              aria-label="Limpiar búsqueda"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <motion.button
          onClick={() => setShowFilters(!showFilters)}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-blue-600 text-white font-semibold rounded-3xl px-6 py-3 shadow-md hover:bg-blue-700 transition cursor-pointer select-none"
          aria-expanded={showFilters}
          aria-controls="filter-panel"
        >
          <Filter size={24} />
          <span>{showFilters ? "Cerrar filtros" : "Filtros"}</span>
          {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </motion.button>
      </div>

      {/* Botones para cambiar vista */}
      <div className="flex justify-end gap-4 mb-4 select-none">
        <button
          onClick={() => setViewMode("grid")}
          aria-label="Vista en cuadrícula"
          className={`p-2 rounded-lg ${
            viewMode === "grid"
              ? "bg-blue-600 text-white"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          <Grid size={20} />
        </button>
        <button
          onClick={() => setViewMode("list")}
          aria-label="Vista en lista"
          className={`p-2 rounded-lg ${
            viewMode === "list"
              ? "bg-blue-600 text-white"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          <List size={20} />
        </button>
      </div>

      {/* Panel de filtros lateral */}
      <AnimatePresence exitBeforeEnter>
        {showFilters && (
          <motion.aside
            id="filter-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="fixed top-0 right-0 h-full w-72 bg-white shadow-lg border-l border-blue-200 p-6 flex flex-col z-50 rounded-l-3xl"
          >
            <h2 className="text-xl font-bold mb-6 text-blue-700 select-text">Filtros Avanzados</h2>

            <label className="block mb-4 font-semibold text-blue-600 select-text">
              Categoría
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="mt-1 w-full rounded-lg border border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              >
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>

            <label className="block mb-4 font-semibold text-blue-600 select-text">
              Ordenar por
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="mt-1 w-full rounded-lg border border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              >
                <option value="rating-desc">Mejor Valorados</option>
                <option value="rating-asc">Peor Valorados</option>
                <option value="year-desc">Más Nuevos</option>
                <option value="year-asc">Más Antiguos</option>
                <option value="title-asc">Título A-Z</option>
                <option value="title-desc">Título Z-A</option>
              </select>
            </label>

            <label className="block mb-4 font-semibold text-blue-600 select-text">
              Año mínimo
              <input
                type="number"
                value={yearRange[0]}
                onChange={(e) => {
                  setYearRange([Number(e.target.value), yearRange[1]]);
                  setCurrentPage(1);
                }}
                className="mt-1 w-full rounded-lg border border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                min={-1000}
                max={new Date().getFullYear()}
              />
            </label>

            <label className="block mb-4 font-semibold text-blue-600 select-text">
              Año máximo
              <input
                type="number"
                value={yearRange[1]}
                onChange={(e) => {
                  setYearRange([yearRange[0], Number(e.target.value)]);
                  setCurrentPage(1);
                }}
                className="mt-1 w-full rounded-lg border border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                min={-1000}
                max={new Date().getFullYear()}
              />
            </label>

            <label className="block mb-4 font-semibold text-blue-600 select-text">
              Rating mínimo
              <input
                type="number"
                value={minRating}
                min={0}
                max={5}
                step={0.1}
                onChange={(e) => {
                  setMinRating(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="mt-1 w-full rounded-lg border border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </label>

            <motion.button
              onClick={() => setShowFilters(false)}
              whileTap={{ scale: 0.95 }}
              className="mt-auto self-center bg-blue-600 text-white font-semibold px-8 py-3 rounded-full shadow-md hover:bg-blue-700 transition"
              aria-label="Cerrar panel de filtros"
            >
              Cerrar
            </motion.button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay para cerrar filtro */}
      <AnimatePresence exitBeforeEnter>
        {showFilters && (
          <motion.div
            onClick={() => setShowFilters(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40 cursor-pointer"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Lista o cuadrícula de libros */}
      <motion.section
        layout
        className={`grid gap-6 ${
          viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"
        }`}
      >
        <AnimatePresence>
          {librosPaginaActual.length > 0 ? (
            librosPaginaActual.map((libro) => (
              <motion.article
                key={libro.id}
                layout
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={cardVariants}
                className={`bg-white rounded-2xl shadow-md p-4 flex ${
                  viewMode === "list" ? "gap-6" : "flex-col"
                } cursor-pointer hover:shadow-xl transition select-text`}
                aria-label={`${libro.titulo} por ${libro.autor}`}
              >
                <img
                  src={libro.imagen}
                  alt={`Portada del libro ${libro.titulo}`}
                  className={`rounded-xl object-cover ${
                    viewMode === "list" ? "w-32 h-48 flex-shrink-0" : "w-full h-56"
                  }`}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/150x220?text=Imagen+no+disponible";
                  }}
                />
                <div className={`${viewMode === "list" ? "flex-grow" : "mt-3"}`}>
                  <h3 className="text-lg font-bold text-blue-800">{libro.titulo}</h3>
                  <p className="text-blue-600 font-semibold mt-1">{libro.autor}</p>
                  <p className="text-sm text-blue-500 mt-1">
                    {libro.categoria} &middot; {libro.anio > 0 ? libro.anio : `${Math.abs(libro.anio)} A.C.`}
                  </p>
                  <div className="flex items-center mt-2">
                    <Star className="text-yellow-400" />
                    <span className="ml-1 font-semibold text-blue-700">{libro.rating.toFixed(1)}</span>
                  </div>
                </div>
              </motion.article>
            ))
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center text-blue-600 font-semibold mt-20"
            >
              No se encontraron libros que coincidan con la búsqueda y filtros.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <nav
          aria-label="Paginación de libros"
          className="flex justify-center items-center gap-3 mt-12 select-none"
        >
          <button
            onClick={() => irAPagina(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-md border border-blue-300 ${
              currentPage === 1
                ? "text-blue-300 cursor-not-allowed"
                : "text-blue-600 hover:bg-blue-100"
            }`}
            aria-disabled={currentPage === 1}
            aria-label="Página anterior"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Mostrar botones de páginas */}
          {Array.from({ length: totalPaginas }, (_, i) => i + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === totalPaginas ||
                (page >= currentPage - 2 && page <= currentPage + 2)
            )
            .map((page, i, arr) => {
              if (i > 0 && page - arr[i - 1] > 1) {
                return (
                  <span
                    key={`dots-${page}`}
                    className="px-2 text-blue-400 select-none"
                    aria-hidden="true"
                  >
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={page}
                  onClick={() => irAPagina(page)}
                  aria-current={page === currentPage ? "page" : undefined}
                  className={`px-4 py-2 rounded-md border ${
                    page === currentPage
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-blue-300 text-blue-600 hover:bg-blue-100"
                  } font-semibold`}
                  aria-label={`Página ${page}`}
                >
                  {page}
                </button>
              );
            })}

          <button
            onClick={() => irAPagina(currentPage + 1)}
            disabled={currentPage === totalPaginas}
            className={`p-2 rounded-md border border-blue-300 ${
              currentPage === totalPaginas
                ? "text-blue-300 cursor-not-allowed"
                : "text-blue-600 hover:bg-blue-100"
            }`}
            aria-disabled={currentPage === totalPaginas}
            aria-label="Página siguiente"
          >
            <ChevronRight size={20} />
          </button>
        </nav>
      )}
    </div>
  );
}
