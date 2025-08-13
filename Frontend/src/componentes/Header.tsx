// src/componentes/Header.tsx
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, Menu, X, Star, Book, Bell, Search, Users } from 'lucide-react';
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

// Categorías
const categorias = ["Todas","Ficción","No Ficción","Ciencia","Historia","Biografía","Tecnología","Fantasía","Desarrollo Personal"];

// Dropdown items
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
};

const dropdownItemVariants = {
  hover: {
    scale: 1.05,
    backgroundColor: "#d1fae5",
    color: "#065f46",
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

export const Header: React.FC<HeaderProps> = ({
  siteName = "BookCode",
  showNotifications = true,
  userAuthenticated = false,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const searchTimeoutRef = useRef<number | null>(null);

  const navigationItems = [
    { name: "Libros", href: "/libros", icon: Book },
    { name: "Autores", href: "/autores", icon: Users },
    { name: "Categorías", href: "/categorias", icon: Star },
    { name: "Sagas", href: "/sagas", icon: StackedBooksIcon },
  ];

  const handleMouseEnterSearch = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    setShowSearch(true);
  };

  const handleMouseLeaveSearch = () => {
    searchTimeoutRef.current = window.setTimeout(() => {
      setShowSearch(false);
    }, 300);
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <h1 className="text-4xl font-bold text-green-600">{siteName}</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 relative">
            {navigationItems.map((item) => (
              <div
                key={item.name}
                className="relative flex items-center space-x-1 px-3 py-2 cursor-pointer text-gray-700 hover:text-green-600"
                onMouseEnter={() => setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link to={item.href} className="flex items-center space-x-1">
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.name}</span>
                </Link>

                <AnimatePresence>
                  {activeDropdown === item.name && dropdownItems[item.name as keyof typeof dropdownItems] && (
                    <motion.div
                      className="absolute top-full left-0 bg-white rounded shadow-md p-2 min-w-[180px] z-50"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {dropdownItems[item.name as keyof typeof dropdownItems].map((subitem) => (
                        <motion.div key={subitem.name} variants={dropdownItemVariants} whileHover="hover">
                          <Link to={subitem.href} className="block px-3 py-2 text-gray-700 rounded hover:bg-green-100">
                            {subitem.name}
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <div
              onMouseEnter={handleMouseEnterSearch}
              onMouseLeave={handleMouseLeaveSearch}
              className="relative cursor-pointer"
            >
              <Search className="w-5 h-5 text-gray-600 hover:text-green-600" />
              <AnimatePresence>
                {showSearch && (
                  <motion.input
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 150, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    type="text"
                    placeholder="Buscar libros..."
                    className="absolute right-0 top-0 h-8 px-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Notification Bell */}
            {showNotifications && (
              <div className="relative cursor-pointer">
                <Bell className="w-5 h-5 text-gray-600 hover:text-green-600" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </div>
            )}

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="focus:outline-none"
              >
                <User className="w-6 h-6 text-gray-600 hover:text-green-600" />
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

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden focus:outline-none"
            >
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
