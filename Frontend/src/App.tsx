import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './componentes/Header';
import { HeroSection } from './componentes/HeroSection';
import { FeaturedContent } from './componentes/FeaturedContent';
import { Footer } from './componentes/Footer';
import { ScrollToTop } from './componentes/ScrollToTop';
import LoginModal from './componentes/LoginModal';
import axios from 'axios';
import { setupAxiosInterceptors } from './services/authService';
import { ThemeProvider } from './contexts/ThemeContext';

import LoginPage from './paginas/LoginPage';
import RegistrationPage from './paginas/RegistrationPage';
import { CategoriasPage } from './paginas/CategoriasPage';
import { DetalleLibro } from './paginas/DetalleLibro';
import { FavoritosPage } from './paginas/FavoritosPage';
import LibrosPage from './paginas/LibrosPage';
import { PerfilUsuario } from './paginas/PerfilUsuario';
import { CrearLibro } from './paginas/CrearLibro';
// de crear libro hay /crear-libro dentro de perfilpage
import { CrearCategoria } from './paginas/CrearCategoria';
import { CrearEditorial } from './paginas/CrearEditorial';
import { CrearSaga } from './paginas/CrearSaga';
import CrearSagaAdmin from './paginas/CrearSagaAdmin';
import PerfilPage from './paginas/PerfilPage';
import { motion } from 'framer-motion';
import AutoresPage from './paginas/AutoresPageMejorada';
import DetalleAutor from './paginas/DetalleAutor';
import SagasPage from './paginas/SagasPage';
import SagaDetallePage from './paginas/SagaDetallePage';

// 📌 Nuevas páginas
import NuevosLanzamientos from './paginas/NuevosLanzamientos';
import LibrosRecomendados from './paginas/LibrosRecomendados';
import LibrosPopulares from './paginas/LibrosPopulares';
import DetalleLista from './paginas/DetalleListaMejorada';

import ConfiguracionUsuario from './paginas/ConfiguracionUsuario';
import AdminModerationPage from './paginas/AdminModerationPage';
import AdminActividadPage from './paginas/AdminActividadPage';
import AdminRatingLibroPage from './paginas/AdminRatingLibroPage';
import AdminPermisoPage from './paginas/AdminPermisoPage';
import { ModerationDashboard } from './paginas/Admin/ModerationDashboard';
import SiguiendoPage from './paginas/SiguiendoPage';
import FeedActividadPage from './paginas/FeedActividadPage';


interface FooterLink {
  name: string;
  href: string;
}

interface FooterCategory {
  title: string;
  links: FooterLink[];
}

interface LayoutProps {
  showLoginModal: boolean;
  setShowLoginModal: React.Dispatch<React.SetStateAction<boolean>>;
}

function Layout({ showLoginModal, setShowLoginModal }: LayoutProps) {
  const location = useLocation();

  const customFooterLinks: FooterCategory[] = [
    {
      title: 'Contenido',
      links: [
        { name: 'Libros Bestsellers', href: '#' },
        { name: 'Sagas Populares', href: '#' },
        { name: 'Autores Destacados', href: '#' },
        { name: 'Críticas Profesionales', href: '#' },
        { name: 'Próximos Lanzamientos', href: '#' },
      ],
    },
    {
      title: 'Herramientas',
      links: [
        { name: 'Crear Lista', href: '#' },
        { name: 'Comparar Libros', href: '#' },
        { name: 'Calculadora de Lectura', href: '#' },
        { name: 'Recomendador IA', href: '#' },
        { name: 'Mis Favoritos', href: '#' },
        { name: 'Estadísticas', href: '#' },
      ],
    },
    {
      title: 'Soporte',
      links: [
        { name: 'Guía de Usuario', href: '#' },
        { name: 'API Developers', href: '#' },
        { name: 'Status del Sistema', href: '#' },
        { name: 'Reportar Bug', href: '#' },
        { name: 'Solicitar Función', href: '#' },
      ],
    },
  ];

  const hideLayout = location.pathname === '/LoginPage' || location.pathname === '/registro';

  // Hide newsletter and features section on /perfil and /configuracion
  const hideNewsletterAndFeatures = location.pathname === '/perfil' || location.pathname === '/configuracion';

  const handleLoginSuccess = () => {
    // Aquí puedes agregar lógica adicional si es necesario después del login
    console.log('Usuario ha iniciado sesión exitosamente');
  };

  return (
    <div className="min-h-screen bg-white">
      <ScrollToTop />
      {!hideLayout && (
        <Header siteName="BookCode" showNotifications={true} userAuthenticated={false} />
      )}

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                {!hideNewsletterAndFeatures && (
                  <>
                    <HeroSection />
                    <FeaturedContent />
                  </>
                )}
              </motion.div>
            }
          />

          {/* Autores */}
          <Route path="/autores" element={<AutoresPage />} />
          <Route path="/autores/:id" element={<DetalleAutor />} />

          {/* Sagas */}
          <Route path="/sagas" element={<SagasPage />} />
          <Route path="/sagas/:id" element={<SagaDetallePage />} />

          {/* Nuevas rutas */}
          <Route path="/libros/nuevos" element={<NuevosLanzamientos />} />
          <Route path="/libros/recomendados" element={<LibrosRecomendados />} />
          <Route path="/libros/populares" element={<LibrosPopulares />} />

          {/* Listas */}
          <Route path="/lista/:id" element={<DetalleLista />} />

          {/* Rutas originales */}
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route path="/registro" element={<RegistrationPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/configuracion" element={<ConfiguracionUsuario />} />
          <Route path="/categorias" element={<CategoriasPage />} />
          <Route path="/libro/:slug" element={<DetalleLibro />} />
          <Route path="/favoritos" element={<FavoritosPage />} />
          <Route path="/libros" element={<LibrosPage />} />
          <Route path="/usuario/:id" element={<PerfilUsuario />} />
          <Route path="/crear-libro" element={<CrearLibro />} />
          <Route path="/crear-categoria" element={<CrearCategoria />} />
          <Route path="/crear-editorial" element={<CrearEditorial />} />
          <Route path="/crear-saga" element={<CrearSaga />} />
          <Route path="/admin/crear-saga" element={<CrearSagaAdmin />} />
          <Route path="/admin/moderation" element={<AdminModerationPage />} />
          <Route path="/admin/moderation/stats" element={<ModerationDashboard />} />
          <Route path="/admin/actividad" element={<AdminActividadPage />} />
          <Route path="/admin/ratingLibro" element={<AdminRatingLibroPage />} />
          <Route path="/admin/permiso" element={<AdminPermisoPage />} />
          <Route path="/siguiendo" element={<SiguiendoPage />} />
          <Route path="/feed" element={<FeedActividadPage />} />
        </Routes>
      </main>

      {!hideLayout && (
        <Footer
          siteName="BookCode"
          showSocialMedia={true}
          showNewsletter={!hideNewsletterAndFeatures}
          showFeatures={!hideNewsletterAndFeatures}
          customLinks={customFooterLinks}
        />
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Setup axios interceptors for automatic token refresh
  React.useEffect(() => {
    setupAxiosInterceptors(axios, () => setShowLoginModal(true));

    // Listen for session expired events from fetchWithRefresh
    const handleSessionExpired = () => setShowLoginModal(true);
    window.addEventListener('sessionExpired', handleSessionExpired);

    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpired);
    };
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <Layout showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal} />
      </Router>
    </ThemeProvider>
  );
}

export default App;
