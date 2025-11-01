import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, MapPin, Calendar, Award } from 'lucide-react';
import { fetchAuthorWithCache, WikipediaAuthorData, WikidataAuthorData } from '../services/wikipediaService';
import { getAuthorStatistics } from '../services/googleBooksService';

interface AutorCardProps {
  id: string;
  name: string;
  photo?: string;
  showEnrichedData?: boolean;
  index?: number;
}

const AutorCard: React.FC<AutorCardProps> = ({ 
  id, 
  name, 
  photo, 
  showEnrichedData = true,
  index = 0 
}) => {
  const [enrichedData, setEnrichedData] = useState<(WikipediaAuthorData & WikidataAuthorData) | null>(null);
  const [statistics, setStatistics] = useState<{
    totalBooks: number;
    averageRating: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBio, setShowBio] = useState(false);

  useEffect(() => {
    if (!showEnrichedData) return;

    const loadEnrichedData = async () => {
      setLoading(true);
      try {
        const [wikiData, stats] = await Promise.all([
          fetchAuthorWithCache(name),
          getAuthorStatistics(name)
        ]);
        
        setEnrichedData(wikiData);
        setStatistics({
          totalBooks: stats.totalBooks,
          averageRating: stats.averageRating
        });
      } catch (error) {
        console.error('Error loading enriched data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEnrichedData();
  }, [name, showEnrichedData]);

  // Formatear fechas para mostrar época
  const getLifeSpan = () => {
    if (!enrichedData) return null;
    
    const birth = enrichedData.birthDate?.split('-')[0];
    const death = enrichedData.deathDate?.split('-')[0];
    
    if (birth && death) {
      return `${birth} - ${death}`;
    } else if (birth) {
      return `${birth} - presente`;
    }
    return null;
  };

  const lifeSpan = getLifeSpan();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 group relative"
      onMouseEnter={() => setShowBio(true)}
      onMouseLeave={() => setShowBio(false)}
    >
      {/* Badge de caché */}
      {enrichedData && (
        <div className="absolute top-3 right-3 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <span>📦</span> Enriquecido
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex items-start gap-4">
        {/* Foto del autor */}
        <div className="relative flex-shrink-0">
          <img
            src={
              enrichedData?.thumbnail?.source || 
              photo || 
              `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=80&background=0ea5e9&color=fff&format=png`
            }
            alt={name}
            className="w-20 h-20 rounded-full object-cover shadow-md group-hover:ring-4 group-hover:ring-cyan-200 transition-all duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=80&background=0ea5e9&color=fff&format=png`;
            }}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-full">
              <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Información */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-800 group-hover:text-cyan-600 transition-colors mb-2 truncate">
            {name}
          </h2>

          {/* Badges de información */}
          <div className="flex flex-wrap gap-2 mb-3">
            {enrichedData?.nationality && (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                <MapPin className="w-3 h-3" />
                {enrichedData.nationality}
              </span>
            )}

            {lifeSpan && (
              <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                <Calendar className="w-3 h-3" />
                {lifeSpan}
              </span>
            )}

            {enrichedData?.genres && enrichedData.genres.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs bg-pink-50 text-pink-700 px-2 py-1 rounded-full">
                <Award className="w-3 h-3" />
                {enrichedData.genres[0]}
              </span>
            )}
          </div>

          {/* Estadísticas de Google Books */}
          {statistics && statistics.totalBooks > 0 && (
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <strong>{statistics.totalBooks}</strong> {statistics.totalBooks === 1 ? 'libro' : 'libros'}
              </span>
              {statistics.averageRating > 0 && (
                <span className="flex items-center gap-1">
                  ⭐ <strong>{statistics.averageRating}</strong>
                </span>
              )}
            </div>
          )}

          {/* Mini biografía (aparece en hover) */}
          {showBio && enrichedData?.extract && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 mb-3 italic"
            >
              {enrichedData.extract.split('.')[0]}.
            </motion.p>
          )}

          {/* Botón de acción */}
          <Link
            to={`/autores/${id}`}
            className="inline-flex items-center text-cyan-600 hover:text-cyan-800 font-medium transition-colors group-hover:translate-x-1 transform duration-200 text-sm"
          >
            Ver detalles
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Skeleton loader overlay */}
      {loading && !enrichedData && (
        <div className="absolute inset-0 bg-white bg-opacity-90 rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Enriqueciendo datos...</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AutorCard;
