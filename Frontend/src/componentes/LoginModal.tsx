import React, { useState } from 'react';
import { Eye, EyeOff, Book, Mail, Lock, ArrowRight, X } from 'lucide-react';
import { saveTokens } from '../services/authService';
import axios from 'axios';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const getErrorMessage = (err: unknown): string => {
    if (axios.isAxiosError(err) && err.response?.data) {
      const data = err.response.data as any;
      return data.error || data.message || JSON.stringify(data);
    }
    if (err instanceof Error) return err.message;
    return String(err);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!loginData.email || !loginData.password) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email: loginData.email,
        password: loginData.password,
      });

      const { token, refreshToken, message } = response.data || {};
      if (token && refreshToken) saveTokens(token, refreshToken);

      setSuccess(message || 'Login exitoso');
      setError('');
      setLoading(false);

      // Cerrar modal y notificar éxito
      onLoginSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
      setSuccess('');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-8 max-w-md w-full mx-4 relative border border-white/20">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Cerrar modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 text-2xl font-bold text-blue-600 mb-4">
            <Book className="w-8 h-8" />
            <span>BookCode</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">Tu sesión ha expirado</h2>
          <p className="mt-2 text-sm text-gray-600">
            Por favor, inicia sesión nuevamente para continuar.
          </p>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="text-red-600 mb-4 text-center font-semibold" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-600 mb-4 text-center font-semibold" role="alert">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="email-modal" className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email-modal"
                name="email"
                type="email"
                required
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password-modal" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password-modal"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="Tu contraseña"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <span>Cargando...</span>
            ) : (
              <>
                <span>Iniciar sesión</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
