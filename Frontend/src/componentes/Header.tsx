import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, Menu, X, Star, Book, Film, Bell } from 'lucide-react';

interface HeaderProps {
  siteName?: string;
  showNotifications?: boolean;
  userAuthenticated?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  siteName = "BookCode", 
  showNotifications = true,
  userAuthenticated = false 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Libros', href: '#', icon: Book },
    { name: 'Autores', href: '#', icon: User },
    { name: 'Categorías', href: '/categorias', icon: Star },
    { name: 'Sagas', href: '#' },
    { name: 'Mis Listas', href: '#' },
  ];

  return (
    <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                  {siteName}
                </h1>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            {showNotifications && (
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200">
                <Bell className="w-5 h-5" />
              </button>
            )}

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                <User className="w-5 h-5" />
                {userAuthenticated && <span className="hidden sm:block text-sm">Mi Perfil</span>}
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link to="loginPage" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    {userAuthenticated ? 'Mi Perfil' : 'Iniciar Sesión'}
                  </Link>
                  <Link to="/favoritos" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    {userAuthenticated ? 'Mis Favoritos' : 'Registrarse'}
                  </Link>
                  <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    {userAuthenticated ? 'Mis Reseñas' : 'Registrarse'}
                  </Link>
                  {userAuthenticated && (
                    <>
                      <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Configuración
                      </Link>
                      <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Cerrar Sesión
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 rounded-lg mt-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
