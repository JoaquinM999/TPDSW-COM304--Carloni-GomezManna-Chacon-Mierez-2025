import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { User, Mail, AtSign, MapPin, BookOpen, Settings, Save, ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ConfiguracionUsuarioProps {}

const ConfiguracionUsuario: React.FC<ConfiguracionUsuarioProps> = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    biografia: '',
    ubicacion: '',
    genero: 'otro' as 'masculino' | 'femenino' | 'otro',
    email: '',
    username: ''
  });
  const [originalData, setOriginalData] = useState(formData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get('http://localhost:3000/api/usuarios/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;
        const profileData = {
          nombre: data.nombre || '',
          biografia: data.biografia || '',
          ubicacion: data.ubicacion || '',
          genero: data.genero || 'otro',
          email: data.email || '',
          username: data.username || ''
        };
        setFormData(profileData);
        setOriginalData(profileData);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar configuración de usuario');
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    if (formData.nombre && formData.nombre.length > 100) {
      newErrors.nombre = 'El nombre no puede exceder 100 caracteres';
    }

    if (formData.biografia && formData.biografia.length > 500) {
      newErrors.biografia = 'La biografía no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `http://localhost:3000/api/usuarios/me`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOriginalData(formData);
      setMessage('Configuración actualizada correctamente');
      setTimeout(() => setMessage(''), 5000);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('El email o nombre de usuario ya están en uso');
      } else {
        setError('Error al actualizar configuración');
      }
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center space-x-4">
            <Link
              to="/perfil"
              className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/30"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al Perfil
            </Link>
          </div>
          <div className="mt-6">
            <h1 className="text-3xl font-bold">Configuración de Usuario</h1>
            <p className="text-xl text-blue-100 mt-2">
              Personaliza tu perfil y preferencias
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* Success/Error Messages */}
          {message && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 m-6 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                <p className="text-green-700">{message}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 m-6 rounded-lg">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-400 mr-3" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-8">

            {/* Basic Information Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <User className="w-6 h-6 mr-2 text-blue-600" />
                Información Básica
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="nombre">
                    Nombre Completo
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.nombre ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Tu nombre completo"
                  />
                  {errors.nombre && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.nombre}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="username">
                    Nombre de Usuario *
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className={`w-full pl-10 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="tu_usuario"
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-10 border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="tu@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="ubicacion">
                    Ubicación
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      id="ubicacion"
                      type="text"
                      value={formData.ubicacion}
                      onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                      className="w-full pl-10 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Ciudad, País"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="genero">
                  Género
                </label>
                <select
                  id="genero"
                  value={formData.genero}
                  onChange={(e) => handleInputChange('genero', e.target.value as 'masculino' | 'femenino' | 'otro')}
                  className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>

            {/* Biography Section */}
            <div className="border-t pt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
                Acerca de Ti
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="biografia">
                  Biografía
                </label>
                <textarea
                  id="biografia"
                  value={formData.biografia}
                  onChange={(e) => handleInputChange('biografia', e.target.value)}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.biografia ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  rows={4}
                  placeholder="Cuéntanos un poco sobre ti..."
                />
                <div className="flex justify-between items-center mt-2">
                  {errors.biografia && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.biografia}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 ml-auto">
                    {formData.biografia.length}/500 caracteres
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t pt-8 flex flex-col sm:flex-row gap-4 justify-end">
              <Link
                to="/perfil"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={!hasChanges || saving}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                  hasChanges && !saving
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionUsuario;
