import React from 'react';
import { BrowserRouter as Router, Routes, Route ,useLocation} from 'react-router-dom';
import { Header } from './componentes/Header';
import { HeroSection } from './componentes/HeroSection';
import { FeaturedContent } from './componentes/FeaturedContent';
import { Footer } from './componentes/Footer';

import LoginPage from './paginas/LoginPage';
import { CategoriasPage } from './paginas/CategoriasPage';
import { DetalleLibro } from './paginas/DetalleLibro';
import { FavoritosPage } from './paginas/FavoritosPage';
import { LibrosPage } from './paginas/LibrosPage';
import { PerfilUsuario } from './paginas/PerfilUsuario';
import { CrearLibro } from './paginas/CrearLibro';
import { CrearCategoria } from './paginas/CrearCategoria';
import { CrearEditorial } from './paginas/CrearEditorial';
import { CrearSaga } from './paginas/CrearSaga';
import PerfilPage from './paginas/PerfilPage';

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
  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Aquí puedes implementar la lógica de búsqueda
    // Por ejemplo, redirigir a una página de resultados o filtrar contenido
  };
  
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
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/categorias" element={<CategoriasPage />} />
          <Route path="/libro/:id" element={<DetalleLibro />} />
          <Route path="/favoritos" element={<FavoritosPage />} />
          <Route path="/libros" element={<LibrosPage />} />
          <Route path="/usuario/:id" element={<PerfilUsuario />} />
          <Route path="/crear-libro" element={<CrearLibro />} />
          <Route path="/crear-categoria" element={<CrearCategoria />} />
          <Route path="/crear-editorial" element={<CrearEditorial />} />
          <Route path="/crear-saga" element={<CrearSaga />} />
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
