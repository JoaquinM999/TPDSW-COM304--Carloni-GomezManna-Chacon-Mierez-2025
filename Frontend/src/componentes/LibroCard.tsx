import React from 'react';

interface LibroCardProps {
  title: string;
  authors?: string[];
  image: string | null;
  description?: string;
  extraInfo?: string | React.ReactNode;
  rating?: number | null;
}

const LibroCard: React.FC<LibroCardProps> = ({ title, authors, image, description, extraInfo, rating }) => {
  const imagenValida = (img: string | null | undefined) =>
    !!img &&
    typeof img === "string" &&
    !img.toLowerCase().includes("image_not_available") &&
    !img.toLowerCase().includes("no_image") &&
    !img.toLowerCase().includes("nophoto");

  return (
    <article className="bg-white rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden transform hover:-translate-y-2 hover:scale-105 transition-all duration-500 flex flex-col border border-gray-100 h-full group relative">
      <div className="w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        {imagenValida(image) ? (
          <img src={image ?? undefined} alt={title} className="max-h-full max-w-full object-contain rounded-2xl shadow-md" />
        ) : (
          <img src="/placeholder-cover.png" alt="Sin portada" className="max-h-full max-w-full object-contain opacity-60 rounded-2xl" />
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-bold mb-2 line-clamp-2 text-gray-800 leading-tight">{title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-1 font-medium">
          {authors?.length ? authors.join(", ") : "Autor desconocido"}
        </p>
        {extraInfo && (
          <div className="text-sm text-gray-500 mb-4">
            {typeof extraInfo === 'string' ? <p>{extraInfo}</p> : extraInfo}
          </div>
        )}
      </div>

      {/* Overlay con degradado sutil */}
      <div className="absolute inset-0 flex flex-col justify-end rounded-3xl overflow-hidden group-hover:opacity-100 opacity-0 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

        {/* Rating flotante */}
        <div className="relative z-10 flex justify-center pb-4">
          <div className="bg-black/60 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-md backdrop-blur-sm border border-white/10">
            {rating !== undefined && rating !== null && rating > 0 ? (
              <>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(rating)
                          ? "text-yellow-400"
                          : "text-gray-400"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="font-semibold text-sm">{rating.toFixed(1)}/5</span>
              </>
            ) : (
              <span className="text-white font-medium text-sm">Sin reseñas</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default LibroCard;
