// src/componentes/ReseñaList.tsx
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface Resena {
  id: number;
  comentario: string;
  estrellas: number;
  moderationScore?: number;
  autoModerated?: boolean;
  usuario?: {
    username?: string;
    nombre?: string;
  };
}

const ReseñaList = ({ reseñas }: { reseñas: Resena[] }) => {
  if (reseñas.length === 0) return <p className="text-gray-500 text-center py-4">No hay reseñas aún.</p>;

  const getModerationIcon = (score?: number) => {
    if (score === undefined) return null;
    
    if (score >= 80) return <CheckCircle className="w-3 h-3 text-green-600" aria-label="Contenido de calidad" />;
    if (score >= 40) return <AlertTriangle className="w-3 h-3 text-yellow-600" aria-label="Requiere revisión" />;
    return <Shield className="w-3 h-3 text-red-600" aria-label="Contenido problemático" />;
  };

  return (
    <ul className="space-y-3">
      {reseñas.map((res) => (
        <li key={res.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <strong className="text-gray-900">
                  {res.usuario?.username || res.usuario?.nombre || 'Anónimo'}
                </strong>
                <span className="text-yellow-500 text-sm">{'⭐'.repeat(res.estrellas)}</span>
                {getModerationIcon(res.moderationScore)}
                {res.autoModerated && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Auto</span>
                )}
              </div>
              <p className="text-gray-700 text-sm">{res.comentario}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ReseñaList;
