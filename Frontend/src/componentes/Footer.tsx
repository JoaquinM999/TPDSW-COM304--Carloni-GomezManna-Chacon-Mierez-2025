import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Book, User, Users, Star, Heart, BookOpen } from 'lucide-react';

interface FooterProps {
  siteName?: string;
  showSocialMedia?: boolean;
  showNewsletter?: boolean;
  customLinks?: Array<{ title: string; links: Array<{ name: string; href: string }> }>;
}

export const Footer: React.FC<FooterProps> = ({
  siteName = "BookCode",
  showSocialMedia = true,
  showNewsletter = true,
  customLinks = []
}) => {
  const defaultLinks = [
    {
      title: 'Explorar',
      links: [
        { name: 'Libros Populares', href: '#' },
        { name: 'Nuevos Lanzamientos', href: '#' },
        { name: 'Autores Destacados', href: '#' },
        { name: 'Sagas Populares', href: '#' },
        { name: 'Listas de Lectura', href: '#' },
      ]
    },
    {
      title: 'Comunidad',
      links: [
        { name: 'Foro de Discusión', href: '#' },
        { name: 'Grupos de Lectura', href: '#' },
        { name: 'Mis Listas', href: '#' },
        { name: 'Libros Favoritos', href: '#' },
        { name: 'Eventos', href: '#' },
        { name: 'Reseñadores Destacados', href: '#' }
      ]
    },
    {
      title: 'Ayuda',
      links: [
        { name: 'Centro de Ayuda', href: '#' },
        { name: 'Contacto', href: '#' },
        { name: 'Términos de Uso', href: '#' },
        { name: 'Política de Privacidad', href: '#' },
        { name: 'Preguntas Frecuentes', href: '#' }
      ]
    }
  ];

  const linksToShow = customLinks.length > 0 ? customLinks : defaultLinks;

  const socialMedia = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' }
  ];

  const features = [
    { icon: Book, title: 'Biblioteca Infinita', description: 'Acceso a millones de libros y reseñas' },
    { icon: User, title: 'Autores y Sagas', description: 'Descubre nuevos autores y series de libros' },
    { icon: Heart, title: 'Favoritos', description: 'Guarda tus libros favoritos' },
    { icon: Users, title: 'Comunidad Activa', description: 'Conecta con otros lectores' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      {showNewsletter && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Mantente al día con las últimas reseñas</h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Recibe recomendaciones de libros, nuevos lanzamientos de tus autores favoritos y contenido exclusivo directamente en tu inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Tu email"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200">
                  Suscribirse
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="py-12 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <feature.icon className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">{feature.title}</h4>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                {siteName}
              </h2>
              <p className="text-gray-400 mb-6 max-w-md">
                La plataforma definitiva para descubrir, reseñar y discutir libros. 
                Conecta con una comunidad apasionada por la lectura y descubre tu próximo libro favorito.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3 text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span>contacto@bookcode.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>+34 900 123 456</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>Madrid, España</span>
                </div>
              </div>

              {/* Social Media */}
              {showSocialMedia && (
                <div className="flex space-x-4">
                  {socialMedia.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      aria-label={social.label}
                      className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Links Sections */}
            {linksToShow.map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 {siteName}. Plataforma dedicada a los amantes de la lectura.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Política de Cookies
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Accesibilidad
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};