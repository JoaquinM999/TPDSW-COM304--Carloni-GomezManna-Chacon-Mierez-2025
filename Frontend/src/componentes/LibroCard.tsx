import React, { useState, useEffect, useRef } from 'react';

interface LibroCardProps {
  title: string;
  authors?: string[];
  image: string | null;
  description?: string;
  extraInfo?: string | React.ReactNode;
  rating?: number | null;
}

const LibroCard: React.FC<LibroCardProps> = ({ title, authors, image, extraInfo, rating }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [shouldLoadImage, setShouldLoadImage] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Lazy loading con Intersection Observer
  useEffect(() => {
    if (!cardRef.current || !image) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoadImage(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' } // Cargar cuando esté a 50px de ser visible
    );

    observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, [image]);

  return (
    <article 
      ref={cardRef}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transform hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 ease-out flex flex-col border border-gray-200 h-full group relative animate-fadeIn focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2"
      role="article"
      aria-label={`Libro: ${title}`}
    >
      {/* Contenedor de imagen mejorado */}
      <div className="relative w-full h-72 bg-gray-100 overflow-hidden flex-shrink-0">
        {image && !imageError && shouldLoadImage ? (
          <>
            {/* Skeleton loader mientras carga la imagen */}
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]" aria-label="Cargando imagen"></div>
            )}
            <img 
              src={image} 
              alt={`Portada de ${title}`}
              loading="lazy"
              className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ease-out ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ objectPosition: 'center top' }}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            {/* Efecto de brillo al hacer hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-transparent group-hover:via-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" aria-hidden="true"></div>
          </>
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 group-hover:from-purple-100 group-hover:via-pink-100 group-hover:to-blue-100 transition-all duration-500"
            role="img"
            aria-label="Imagen no disponible"
          >
            <div className="text-center p-8 transform group-hover:scale-105 transition-transform duration-500">
              <svg 
                className="w-20 h-20 mx-auto mb-3 text-gray-300 group-hover:text-gray-400 transition-colors duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-xs text-gray-400 font-medium">Sin portada</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow relative z-10 bg-white min-h-[140px]">
        <h3 
          className="text-sm font-black mb-1.5 line-clamp-2 text-gray-900 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-700 group-hover:to-pink-700 transition-all duration-300 break-words" 
          style={{ fontWeight: 900, overflowWrap: 'break-word', wordBreak: 'break-word' }}
          title={title}
        >
          {title}
        </h3>
        <p 
          className="text-xs text-gray-600 mb-2 line-clamp-1 font-medium group-hover:text-gray-800 transition-colors duration-300"
          title={authors?.length ? authors.join(", ") : "Autor desconocido"}
        >
          {authors?.length ? authors.join(", ") : "Autor desconocido"}
        </p>
        {extraInfo && (
          <div className="text-xs text-gray-600 mt-auto">
            {typeof extraInfo === 'string' ? <p>{extraInfo}</p> : extraInfo}
          </div>
        )}
      </div>

      {/* Badge de rating con animación mejorada */}
      {rating !== undefined && rating !== null && rating > 0 && (
        <div 
          className="absolute top-3 right-3 z-20 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
          role="status"
          aria-label={`Calificación: ${rating.toFixed(1)} de 5 estrellas`}
        >
          <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-sm border-2 border-white group-hover:shadow-xl animate-pulse-subtle">
            <svg 
              className="w-4 h-4 animate-spin-slow" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-bold text-sm">{rating.toFixed(1)}</span>
          </div>
        </div>
      )}

      {/* Efecto de resplandor inferior al hacer hover */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" aria-hidden="true"></div>
    </article>
  );
};

export default LibroCard;
