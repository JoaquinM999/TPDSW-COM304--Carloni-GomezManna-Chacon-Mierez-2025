/* import React from 'react'; */
import { Header } from './componentes/Header';
import { HeroSection } from './componentes/HeroSection';
import { FeaturedContent } from './componentes/FeaturedContent';
import { Footer } from './componentes/Footer';
import './index.css';


function App() {
  // Example of customization options
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

  return (
    <div className="min-h-screen bg-white">
      <Header 
        siteName="BookCode"
        showNotifications={true}
        userAuthenticated={false}
      />
      
      <main>
        <HeroSection />
        <FeaturedContent />
      </main>
      
      <Footer 
        siteName="BookCode"
        showSocialMedia={true}
        showNewsletter={true}
        customLinks={customFooterLinks}
      />
    </div>
  );
}

export default App;