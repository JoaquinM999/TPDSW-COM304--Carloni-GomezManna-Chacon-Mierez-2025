import React from 'react';

interface LibroCardProps {
  title: string;
  authors?: string[];
  image: string | null;
  description?: string;
  extraInfo?: string;
}

const LibroCard: React.FC<LibroCardProps> = ({ title, authors, image, description, extraInfo }) => {
  const imagenValida = (img: string | null | undefined) =>
    !!img &&
    typeof img === "string" &&
    !img.toLowerCase().includes("image_not_available") &&
    !img.toLowerCase().includes("no_image") &&
    !img.toLowerCase().includes("nophoto");

  return (
    <article className="bg-white rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden transform hover:-translate-y-2 hover:scale-105 transition-all duration-500 flex flex-col border border-gray-100 h-full">
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
          <p className="text-sm text-gray-500 mb-4">{extraInfo}</p>
        )}
      </div>
    </article>
  );
};

export default LibroCard;
