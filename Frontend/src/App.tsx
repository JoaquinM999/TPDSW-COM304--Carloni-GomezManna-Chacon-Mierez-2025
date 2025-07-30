import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './componentes/Header';
import { HeroSection } from './componentes/HeroSection';
import { FeaturedContent } from './componentes/FeaturedContent';
import { Footer } from './componentes/Footer';

// Importar tu página de login
import LoginPage from './paginas/LoginPage';

// Importar las nuevas páginas
import { CategoriasPage } from './paginas/CategoriasPage';
import { DetalleLibro } from './paginas/DetalleLibro';
import { FavoritosPage } from './paginas/FavoritosPage';
import { LibrosPage } from './paginas/LibrosPage';
import { PerfilUsuario } from './paginas/PerfilUsuario';

function Layout() {
  const location = useLocation();

  const customFooterLinks = [
    {
      title: 'Contenido',
      links: [
        { name: 'Libros Bestsellers', href: '#' },
        { name: 'Sagas Populares', href: '#' },
        { name: 'Autores Destacados', href: '#' },
        { name: 'Críticas Profesionales', href: '#' },
        { name: 'Próximos Lanzamientos', href: '#' }
      ]
    },
    {
      title: 'Herramientas',
      links: [
        { name: 'Crear Lista', href: '#' },
        { name: 'Comparar Libros', href: '#' },
        { name: 'Calculadora de Lectura', href: '#' },
        { name: 'Recomendador IA', href: '#' },
        { name: 'Mis Favoritos', href: '#' },
        { name: 'Estadísticas', href: '#' }
      ]
    },
    {
      title: 'Soporte',
      links: [
        { name: 'Guía de Usuario', href: '#' },
        { name: 'API Developers', href: '#' },
        { name: 'Status del Sistema', href: '#' },
        { name: 'Reportar Bug', href: '#' },
        { name: 'Solicitar Función', href: '#' }
      ]
    }
  ];

  // Ocultar layout en la página de login
  const hideLayout = location.pathname === './paginas/LoginPage';

  return (
    <div className="min-h-screen bg-white">
      {!hideLayout && (
        <Header
          siteName="BookCode"
          showNotifications={true}
          userAuthenticated={false}
        />
      )}

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroSection />
                <FeaturedContent />
              </>
            }
          />
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route path="/categorias" element={<CategoriasPage />} />
          <Route path="/libro/:id" element={<DetalleLibro />} />
          <Route path="/favoritos" element={<FavoritosPage />} />
          <Route path="/libros" element={<LibrosPage />} />
          <Route path="/usuario/:id" element={<PerfilUsuario />} />
        </Routes>
      </main>

      {!hideLayout && (
        <Footer
          siteName="BookCode"
          showSocialMedia={true}
          showNewsletter={true}
          customLinks={customFooterLinks}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
