// src/componentes/Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Menu, X, Star, Book, Bell, Search, Users, Settings, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  siteName?: string;
  showNotifications?: boolean;
  userAuthenticated?: boolean;
}

const StackedBooksIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <rect x="3" y="5" width="18" height="4" rx="1" ry="1" />
    <rect x="5" y="11" width="14" height="4" rx="1" ry="1" />
    <rect x="7" y="17" width="10" height="4" rx="1" ry="1" />
  </svg>
);

const categorias = [
  "Todas", "Ficción", "No Ficción", "Ciencia", "Historia",
  "Biografía", "Tecnología", "Fantasía", "Desarrollo Personal"
];

const dropdownItems = {
  Libros: [
    { name: "Nuevos lanzamientos", href: "/libros/nuevos" },
    { name: "Más populares", href: "/libros/populares" },
    { name: "Recomendados", href: "/libros/recomendados" },
  ],
  Autores: [
    { name: "Autores destacados", href: "/autores/destacados" },
    { name: "Nuevos autores", href: "/autores/nuevos" },
    { name: "Autores por género", href: "/autores/generos" },
  ],
  Categorías: categorias.map((cat) => ({
    name: cat,
    href: `/categorias/${cat.toLowerCase().replace(/\s+/g, "-")}`,
  })),
  Sagas: [
    { name: "Todas las sagas", href: "/sagas" },
    { name: "Sagas populares", href: "/sagas/populares" },
    { name: "Nuevas sagas", href: "/sagas/nuevas" },
  ],
  Configuración: [
    { name: "Preferencias", href: "/configuracion/preferencias" },
    { name: "Cuenta", href: "/configuracion/cuenta" },
    { name: "Privacidad", href: "/configuracion/privacidad" },
  ]
};

export const Header: React.FC<HeaderProps> = ({
  siteName = "BookCode",
  showNotifications = true,
  userAuthenticated = false,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const searchTimeoutRef = useRef<number | null>(null);

  const headerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setIsUserMenuOpen(false);
        setIsNotificationsOpen(false);
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigationItems = [
    { name: "Libros", href: "/libros", icon: Book },
    { name: "Autores", href: "/autores", icon: Users },
    { name: "Categorías", href: "/categorias", icon: Star },
    { name: "Sagas", href: "/sagas", icon: StackedBooksIcon },
    ...(userAuthenticated
      ? [{ name: "Configuración", href: "/configuracion", icon: Settings }]
      : []),
  ];

  const handleMouseEnterSearch = () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setShowSearch(true);
  };

  const handleMouseLeaveSearch = () => {
    if (!isSearchFocused) {
      searchTimeoutRef.current = window.setTimeout(() => setShowSearch(false), 300);
    }
  };

  return (
    <header ref={headerRef} className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Layout de tres áreas */}
        <div className="flex justify-between items-center h-16 relative">
          {/* Logo */}
          <div className="flex items-center z-10">
            <Link to="/">
              <h1 className="text-4xl font-bold text-green-600">{siteName}</h1>
            </Link>
          </div>

          {/* Navegación centrada */}
          <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 space-x-6">
            {navigationItems
              .filter(item => ["Libros", "Autores", "Categorías", "Sagas"].includes(item.name))
              .map((item) => (
                <div
                  key={item.name}
                  className="relative flex items-center px-2 py-2 cursor-pointer text-gray-700 hover:text-green-600"
                  onMouseEnter={() => setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link to={item.href} className="flex items-center space-x-1">
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span>{item.name}</span>
                  </Link>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {activeDropdown === item.name && dropdownItems[item.name as keyof typeof dropdownItems] && (
                      <motion.div
                        className="absolute top-full left-0 bg-white rounded shadow-md p-2 min-w-[180px] z-50"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {dropdownItems[item.name as keyof typeof dropdownItems].map((subitem) => (
                          <Link
                            key={subitem.name}
                            to={subitem.href}
                            className="block px-3 py-2 text-gray-700 rounded hover:bg-green-100 hover:text-green-700 transition-colors duration-200"
                          >
                            {subitem.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
          </nav>

          {/* Iconos derecha */}
          <div className="flex items-center space-x-4 z-10">
            {/* Search */}
            <div
              onMouseEnter={handleMouseEnterSearch}
              onMouseLeave={handleMouseLeaveSearch}
              className="relative w-[180px] flex items-center justify-end"
            >
              <AnimatePresence>
                {!showSearch && (
                  <motion.div
                    key="icon"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute right-0"
                  >
                    <Search className="w-5 h-5 text-gray-600 hover:text-green-600 transition-transform duration-200 hover:scale-110" />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showSearch && (
                  <motion.input
                    key="input"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 180, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    type="text"
                    placeholder="Buscar libros..."
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-9 px-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => { setIsSearchFocused(false); setShowSearch(false); }}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            {showNotifications && (
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-1 rounded-full hover:bg-gray-100 focus:outline-none"
                >
                  <motion.div
                    className="inline-block relative"
                    whileHover={{ rotate: [0, -10, 10, -7, 7, -5, 5, 0] }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  >
                    <Bell className="w-5 h-5 text-gray-600 hover:text-green-600 transition-transform duration-200" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-50"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="flex items-center gap-2 text-gray-500">
                        <AlertCircle className="w-5 h-5" />
                        <span>No hay notificaciones recientes</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* User Menu */}
            <div className="relative">
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="focus:outline-none">
                <motion.div
                  className="inline-block"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <User className="w-6 h-6 text-gray-600 hover:text-green-600 transition-transform duration-200" />
                </motion.div>
              </button>
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-40 bg-white rounded shadow-lg z-50"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Link to="/perfil" className="block px-4 py-2 hover:bg-green-100">Perfil</Link>
                    <Link to="/configuracion" className="block px-4 py-2 hover:bg-green-100">Configuración</Link>
                    <Link to="/logout" className="block px-4 py-2 hover:bg-green-100">Cerrar sesión</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden focus:outline-none">
              {isMobileMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            className="md:hidden bg-white border-t border-gray-200"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <ul className="flex flex-col px-4 py-2 space-y-2">
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-green-100 hover:text-green-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon && <item.icon className="w-5 h-5" />}
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded border border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Iniciar sesión
                </Link>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};
