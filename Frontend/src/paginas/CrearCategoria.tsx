import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Plus, Palette } from 'lucide-react';

const coloresDisponibles = [
  { nombre: 'Azul', clase: 'bg-blue-500', valor: '#3B82F6' },
  { nombre: 'Verde', clase: 'bg-green-500', valor: '#10B981' },
  { nombre: 'Púrpura', clase: 'bg-purple-500', valor: '#8B5CF6' },
  { nombre: 'Rosa', clase: 'bg-pink-500', valor: '#EC4899' },
  { nombre: 'Naranja', clase: 'bg-orange-500', valor: '#F97316' },
  { nombre: 'Rojo', clase: 'bg-red-500', valor: '#EF4444' },
  { nombre: 'Índigo', clase: 'bg-indigo-500', valor: '#6366F1' },
  { nombre: 'Amarillo', clase: 'bg-yellow-500', valor: '#EAB308' },
  { nombre: 'Gris', clase: 'bg-gray-500', valor: '#6B7280' },
  { nombre: 'Esmeralda', clase: 'bg-emerald-500', valor: '#059669' }
];

export const CrearCategoria: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [categoriaData, setCategoriaData] = useState({
    nombre: '',
    descripcion: '',
    color: coloresDisponibles[0].valor
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check user role (replace with actual auth check)
  const userRole = 'admin'; // Get from auth context

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCategoriaData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleColorSelect = (color: string) => {
    setCategoriaData(prev => ({
      ...prev,
      color
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!categoriaData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la categoría es requerido';
    }
    if (!categoriaData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/categorias', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${getToken()}`
      //   },
      //   body: JSON.stringify(categoriaData)
      // });

      // if (response.ok) {
      //   const nuevaCategoria = await response.json();
      //   navigate('/categorias');
      // } else {
      //   throw new Error('Error al crear la categoría');
      // }

      // Simulate API call
      setTimeout(() => {
        alert('Categoría creada exitosamente');
        navigate('/categorias');
      }, 1000);

    } catch (error) {
      console.error('Error al crear categoría:', error);
      alert('Error al crear la categoría');
    } finally {
      setLoading(false);
    }
  };

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">Solo los administradores pueden crear categorías.</p>
        </div>
      </div>
    );
  }

  const colorSeleccionado = coloresDisponibles.find(c => c.valor === categoriaData.color);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Tag className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Crear Nueva Categoría</h1>
          </div>
          <p className="text-gray-600">
            Crea una nueva categoría para organizar los libros en la plataforma
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Información de la Categoría</h2>
            
            {/* Nombre */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Categoría *
              </label>
              <input
                type="text"
                name="nombre"
                value={categoriaData.nombre}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Ciencia Ficción, Romance, Misterio..."
              />
              {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
            </div>

            {/* Descripción */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                name="descripcion"
                value={categoriaData.descripcion}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.descripcion ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe brevemente qué tipo de libros incluye esta categoría..."
              />
              {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Color de la Categoría
              </label>
              <div className="grid grid-cols-5 gap-3 mb-4">
                {coloresDisponibles.map((color) => (
                  <button
                    key={color.valor}
                    type="button"
                    onClick={() => handleColorSelect(color.valor)}
                    className={`relative w-12 h-12 rounded-lg ${color.clase} hover:scale-110 transition-transform duration-200 ${
                      categoriaData.color === color.valor ? 'ring-4 ring-gray-400' : ''
                    }`}
                    title={color.nombre}
                  >
                    {categoriaData.color === color.valor && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Color seleccionado: <span className="font-medium">{colorSeleccionado?.nombre}</span>
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Vista Previa</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-sm">
                <div 
                  className="h-32 flex items-center justify-center"
                  style={{ backgroundColor: categoriaData.color }}
                >
                  <Tag className="w-12 h-12 text-white" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {categoriaData.nombre || 'Nombre de la categoría'}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {categoriaData.descripcion || 'Descripción de la categoría'}
                  </p>
                  <div className="text-blue-600 font-medium text-sm">
                    0 libros
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/categorias')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Plus className="w-5 h-5" />
              )}
              <span>{loading ? 'Creando...' : 'Crear Categoría'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};