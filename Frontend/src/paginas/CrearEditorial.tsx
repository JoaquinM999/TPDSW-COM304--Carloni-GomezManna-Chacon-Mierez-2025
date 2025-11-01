import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Plus, Globe, MapPin, Phone, Mail } from 'lucide-react';

export const CrearEditorial: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [editorialData, setEditorialData] = useState({
    nombre: '',
    descripcion: '',
    sitioWeb: '',
    pais: '',
    ciudad: '',
    telefono: '',
    email: '',
    añoFundacion: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check user role (replace with actual auth check)
  const userRole = 'admin'; // Get from auth context

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditorialData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!editorialData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la editorial es requerido';
    }
    if (!editorialData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }
    if (editorialData.email && !/\S+@\S+\.\S+/.test(editorialData.email)) {
      newErrors.email = 'El email no es válido';
    }
    if (editorialData.sitioWeb && !editorialData.sitioWeb.startsWith('http')) {
      newErrors.sitioWeb = 'El sitio web debe comenzar con http:// o https://';
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
      // const response = await fetch('/api/editoriales', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${getToken()}`
      //   },
      //   body: JSON.stringify(editorialData)
      // });

      // if (response.ok) {
      //   const nuevaEditorial = await response.json();
      //   navigate('/admin/editoriales');
      // } else {
      //   throw new Error('Error al crear la editorial');
      // }

      // Simulate API call
      setTimeout(() => {
        alert('Editorial creada exitosamente');
        navigate('/admin/editoriales');
      }, 1000);

    } catch (error) {
      console.error('Error al crear editorial:', error);
      alert('Error al crear la editorial');
    } finally {
      setLoading(false);
    }
  };

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 dark:text-gray-400">Solo los administradores pueden crear editoriales.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Building className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Crear Nueva Editorial</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Registra una nueva editorial en la plataforma
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información Básica */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Información Básica</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre de la Editorial *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={editorialData.nombre}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Penguin Random House, Editorial Planeta..."
                />
                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
              </div>

              {/* Año de Fundación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Año de Fundación
                </label>
                <input
                  type="number"
                  name="añoFundacion"
                  value={editorialData.añoFundacion}
                  onChange={handleInputChange}
                  min="1400"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="Ej: 1927"
                />
              </div>

              {/* Sitio Web */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sitio Web
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    name="sitioWeb"
                    value={editorialData.sitioWeb}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.sitioWeb ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="https://www.editorial.com"
                  />
                </div>
                {errors.sitioWeb && <p className="text-red-500 text-sm mt-1">{errors.sitioWeb}</p>}
              </div>
            </div>

            {/* Descripción */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción *
              </label>
              <textarea
                name="descripcion"
                value={editorialData.descripcion}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.descripcion ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe la editorial, su historia, especialidades..."
              />
              {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Información de Contacto</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* País */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  País
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="pais"
                    value={editorialData.pais}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="Ej: España, Argentina, México..."
                  />
                </div>
              </div>

              {/* Ciudad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  name="ciudad"
                  value={editorialData.ciudad}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="Ej: Madrid, Buenos Aires, Ciudad de México..."
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="telefono"
                    value={editorialData.telefono}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="+34 900 123 456"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email de Contacto
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={editorialData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="contacto@editorial.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/editoriales')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
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
              <span>{loading ? 'Creando...' : 'Crear Editorial'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};