import React from 'react';

interface LibroCardProps {
  title: string;
  authors?: string[];
  image: string | null;
  description?: string;
  extraInfo?: string | React.ReactNode;
  rating?: number | null;
}

const LibroCard: React.FC<LibroCardProps> = ({ title, authors, image, extraInfo, rating }) => {
  const imagenValida = (img: string | null | undefined) =>
    !!img &&
    typeof img === "string" &&
    !img.toLowerCase().includes("image_not_available") &&
    !img.toLowerCase().includes("no_image") &&
    !img.toLowerCase().includes("nophoto");

  return (
    <article className="bg-white rounded-2xl shadow-md hover:shadow-2xl overflow-hidden transform hover:-translate-y-1 transition-all duration-300 flex flex-col border border-gray-200 h-full group relative">
      {/* Contenedor de imagen mejorado */}
      <div className="relative w-full h-80 bg-gradient-to-br from-gray-100 via-gray-50 to-white overflow-hidden">
        {imagenValida(image) ? (
          <img 
            src={image ?? undefined} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            style={{ objectPosition: 'center top' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="text-center p-8">
              <svg className="w-20 h-20 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-xs text-gray-400 font-medium">Sin portada</p>
            </div>
          </div>
        )}
        
        {/* Gradiente sutil en la parte inferior para transición */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold mb-2 line-clamp-2 text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">{title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-1 font-medium">
          {authors?.length ? authors.join(", ") : "Autor desconocido"}
        </p>
        {extraInfo && (
          <div className="text-sm text-gray-500 mb-3">
            {typeof extraInfo === 'string' ? <p>{extraInfo}</p> : extraInfo}
          </div>
        )}
      </div>

      {/* Badge de rating siempre visible en la esquina superior derecha */}
      {rating !== undefined && rating !== null && rating > 0 && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-sm border-2 border-white">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-bold text-sm">{rating.toFixed(1)}</span>
          </div>
        </div>
      )}
    </article>
  );
};

export default LibroCard;
