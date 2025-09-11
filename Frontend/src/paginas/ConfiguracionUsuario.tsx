import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { User, Mail, AtSign, MapPin, BookOpen, Settings, Save, ArrowLeft, CheckCircle, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

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
        const response = await axios.get('http://localhost:3000/api/usuarios/me');
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
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        if (err.response?.status === 401) {
          setError('Sesión expirada. Redirigiendo al inicio de sesión...');
          setTimeout(() => {
            window.location.href = '/LoginPage';
          }, 2000);
        } else {
          setError(err.response?.data?.error || 'Error al cargar configuración de usuario');
        }
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
      await axios.put(`http://localhost:3000/api/usuarios/me`, formData);
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
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/perfil"
              className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/30 hover:scale-105 transition-all duration-300 border border-white/40 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Perfil
            </Link>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold tracking-tight">Configuración de Usuario</h1>
            <p className="text-base text-blue-100 mt-2 opacity-90">
              Personaliza tu perfil y preferencias
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 rounded-3xl shadow-2xl shadow-blue-500/10 border border-gray-100 overflow-hidden animate-in fade-in duration-500 hover:shadow-3xl hover:shadow-blue-500/20 transition-shadow duration-500">

          <form onSubmit={handleSubmit} className="p-6 space-y-8">

            {/* Basic Information Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center group cursor-pointer">
                <User className="w-6 h-6 mr-2 text-blue-600 group-hover:text-blue-700 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                Información Básica
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3" htmlFor="nombre">
                    Nombre Completo
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    className={`w-full border-2 rounded-xl px-4 py-4 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-md ${
                      errors.nombre ? 'border-red-400 bg-red-50 focus:ring-red-500/20' : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="Tu nombre completo"
                  />
                  {errors.nombre && (
                    <p className="mt-2 text-sm text-red-600 flex items-center animate-in slide-in-from-left duration-200">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {errors.nombre}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-800" htmlFor="username">
                      Nombre de Usuario *
                    </label>
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help transition-colors" />
                      <div className="absolute right-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 shadow-lg">
                        Tu nombre de usuario debe tener al menos 3 caracteres y puede contener letras, números y guiones bajos.
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <AtSign className="absolute left-4 top-4 w-5 h-5 text-gray-400 transition-colors" />
                    <input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className={`w-full pl-12 border-2 rounded-xl px-4 py-4 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-md ${
                        errors.username ? 'border-red-400 bg-red-50 focus:ring-red-500/20' : 'border-gray-200 focus:border-blue-500'
                      }`}
                      placeholder="tu_usuario"
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-2 text-sm text-red-600 flex items-center animate-in slide-in-from-left duration-200">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {errors.username}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-800" htmlFor="email">
                      Correo Electrónico *
                    </label>
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help transition-colors" />
                      <div className="absolute right-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 shadow-lg">
                        Ingresa un correo electrónico válido. Este será usado para notificaciones y recuperación de contraseña.
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400 transition-colors" />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-12 border-2 rounded-xl px-4 py-4 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-md ${
                        errors.email ? 'border-red-400 bg-red-50 focus:ring-red-500/20' : 'border-gray-200 focus:border-blue-500'
                      }`}
                      placeholder="tu@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center animate-in slide-in-from-left duration-200">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3" htmlFor="ubicacion">
                    Ubicación
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400 transition-colors" />
                    <input
                      id="ubicacion"
                      type="text"
                      value={formData.ubicacion}
                      onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                      className="w-full pl-12 border-2 border-gray-200 rounded-xl px-4 py-4 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="Ciudad, País"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <label className="block text-sm font-semibold text-gray-800 mb-3" htmlFor="genero">
                  Género
                </label>
                <select
                  id="genero"
                  value={formData.genero}
                  onChange={(e) => handleInputChange('genero', e.target.value as 'masculino' | 'femenino' | 'otro')}
                  className="w-full md:w-1/2 border-2 border-gray-200 rounded-xl px-4 py-4 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-md bg-white"
                >
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>

            {/* Biography Section */}
            <div className="border-t pt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center group cursor-pointer">
                <BookOpen className="w-6 h-6 mr-2 text-blue-600 group-hover:text-blue-700 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300" />
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
                  className={`w-full border-2 rounded-xl px-4 py-4 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-md ${
                    errors.biografia ? 'border-red-400 bg-red-50 focus:ring-red-500/20' : 'border-gray-200 focus:border-blue-500'
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

                {/* Biography character count progress bar */}
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full transition-all duration-300 ${
                      formData.biografia.length > 450 ? 'bg-red-500' :
                      formData.biografia.length > 400 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${(formData.biografia.length / 500) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t pt-8 flex flex-col sm:flex-row gap-6 justify-end">
              <Link
                to="/perfil"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 hover:scale-105 transition-all duration-300 font-semibold shadow-sm hover:shadow-md"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={!hasChanges || saving}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl ${
                  hasChanges && !saving
                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600 hover:scale-105 focus:ring-4 focus:ring-blue-500/30'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-3" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Success/Error Messages */}
        {(message || error) && (
          <div className="mt-8 animate-in slide-in-from-bottom duration-500">
            {message && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-2xl shadow-lg border border-green-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-green-500 animate-in zoom-in duration-300" />
                  </div>
                  <div className="ml-4">
                    <p className="text-green-800 font-semibold text-lg">{message}</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-6 rounded-2xl shadow-lg border border-red-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <XCircle className="w-6 h-6 text-red-500 animate-in zoom-in duration-300" />
                  </div>
                  <div className="ml-4">
                    <p className="text-red-800 font-semibold text-lg">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfiguracionUsuario;
