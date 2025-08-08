import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Upload, Plus, X, Globe, Users, Calendar, FileText, Tag, Building } from 'lucide-react';

interface Idioma {
  codigo: string;
  nombre: string;
}

interface Editorial {
  id: number;
  nombre: string;
}

interface Categoria {
  id: number;
  nombre: string;
}

interface Saga {
  id: number;
  nombre: string;
}

// Mock data - replace with your database
const idiomasDisponibles: Idioma[] = [
  { codigo: 'es', nombre: 'Español' },
  { codigo: 'en', nombre: 'Inglés' },
  { codigo: 'fr', nombre: 'Francés' },
  { codigo: 'de', nombre: 'Alemán' },
  { codigo: 'it', nombre: 'Italiano' },
  { codigo: 'pt', nombre: 'Portugués' },
  { codigo: 'ru', nombre: 'Ruso' },
  { codigo: 'ja', nombre: 'Japonés' },
  { codigo: 'zh', nombre: 'Chino' },
  { codigo: 'ar', nombre: 'Árabe' }
];

const mockEditoriales: Editorial[] = [
  { id: 1, nombre: 'Penguin Random House' },
  { id: 2, nombre: 'Editorial Planeta' },
  { id: 3, nombre: 'Anagrama' },
  { id: 4, nombre: 'Alfaguara' }
];

const mockCategorias: Categoria[] = [
  { id: 1, nombre: 'Ficción' },
  { id: 2, nombre: 'Ciencia Ficción' },
  { id: 3, nombre: 'Romance' },
  { id: 4, nombre: 'Misterio' },
  { id: 5, nombre: 'Historia' }
];

const mockSagas: Saga[] = [
  { id: 1, nombre: 'Harry Potter' },
  { id: 2, nombre: 'El Señor de los Anillos' },
  { id: 3, nombre: 'Crónicas de Narnia' }
];

export const CrearLibro: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [portadaPreview, setPortadaPreview] = useState<string>('');
  
  const [libroData, setLibroData] = useState({
    titulo: '',
    autor: '',
    isbn: '',
    sinopsis: '',
    año: new Date().getFullYear(),
    paginas: 0,
    editorialId: '',
    categoriaId: '',
    sagaId: '',
    numeroEnSaga: '',
    idiomas: [] as string[],
    portada: null as File | null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check user role (replace with actual auth check)
  const userRole = 'admin'; // or 'autor' - get from auth context

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLibroData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleIdiomaToggle = (codigoIdioma: string) => {
    setLibroData(prev => ({
      ...prev,
      idiomas: prev.idiomas.includes(codigoIdioma)
        ? prev.idiomas.filter(id => id !== codigoIdioma)
        : [...prev.idiomas, codigoIdioma]
    }));
  };

  const handlePortadaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLibroData(prev => ({ ...prev, portada: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPortadaPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!libroData.titulo.trim()) newErrors.titulo = 'El título es requerido';
    if (!libroData.autor.trim()) newErrors.autor = 'El autor es requerido';
    if (!libroData.isbn.trim()) newErrors.isbn = 'El ISBN es requerido';
    if (!libroData.sinopsis.trim()) newErrors.sinopsis = 'La sinopsis es requerida';
    if (!libroData.editorialId) newErrors.editorialId = 'La editorial es requerida';
    if (!libroData.categoriaId) newErrors.categoriaId = 'La categoría es requerida';
    if (libroData.paginas <= 0) newErrors.paginas = 'El número de páginas debe ser mayor a 0';
    if (libroData.idiomas.length === 0) newErrors.idiomas = 'Debe seleccionar al menos un idioma';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
  // TODO: Replace with actual API call
  const formData = new FormData();
  Object.entries(libroData).forEach(([key, value]) => {
    if (key === 'idiomas') {
      formData.append(key, JSON.stringify(value));
    } else if (key === 'portada' && value instanceof File) {
      formData.append(key, value);
    } else if (value !== null && value !== undefined) {
      formData.append(key, value.toString());
    }
  });

      // const response = await fetch('/api/libros', {
      //   method: 'POST',
      //   body: formData,
      //   headers: {
      //     'Authorization': `Bearer ${getToken()}`
      //   }
      // });

      // if (response.ok) {
      //   const nuevoLibro = await response.json();
      //   navigate(`/libro/${nuevoLibro.id}`);
      // } else {
      //   throw new Error('Error al crear el libro');
      // }

      // Simulate API call
      setTimeout(() => {
        alert('Libro creado exitosamente');
        navigate('/libros');
      }, 1000);

    } catch (error) {
      console.error('Error al crear libro:', error);
      alert('Error al crear el libro');
    } finally {
      setLoading(false);
    }
  };

  if (userRole !== 'admin' && userRole !== 'autor') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para crear libros.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Book className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Libro</h1>
          </div>
          <p className="text-gray-600">
            Completa la información del libro para agregarlo a la plataforma
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Información Básica</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Título */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={libroData.titulo}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.titulo ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa el título del libro"
                />
                {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>}
              </div>

              {/* Autor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Autor *
                </label>
                <input
                  type="text"
                  name="autor"
                  value={libroData.autor}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.autor ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nombre del autor"
                />
                {errors.autor && <p className="text-red-500 text-sm mt-1">{errors.autor}</p>}
              </div>

              {/* ISBN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ISBN *
                </label>
                <input
                  type="text"
                  name="isbn"
                  value={libroData.isbn}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.isbn ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="978-0-123456-78-9"
                />
                {errors.isbn && <p className="text-red-500 text-sm mt-1">{errors.isbn}</p>}
              </div>

              {/* Año */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Año de Publicación
                </label>
                <input
                  type="number"
                  name="año"
                  value={libroData.año}
                  onChange={handleInputChange}
                  min="1000"
                  max={new Date().getFullYear() + 5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Páginas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Páginas *
                </label>
                <input
                  type="number"
                  name="paginas"
                  value={libroData.paginas || ''}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.paginas ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Número de páginas"
                />
                {errors.paginas && <p className="text-red-500 text-sm mt-1">{errors.paginas}</p>}
              </div>
            </div>

            {/* Sinopsis */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sinopsis *
              </label>
              <textarea
                name="sinopsis"
                value={libroData.sinopsis}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.sinopsis ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe brevemente de qué trata el libro..."
              />
              {errors.sinopsis && <p className="text-red-500 text-sm mt-1">{errors.sinopsis}</p>}
            </div>
          </div>

          {/* Clasificación */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Clasificación</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Editorial */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Editorial *
                </label>
                <select
                  name="editorialId"
                  value={libroData.editorialId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.editorialId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecciona una editorial</option>
                  {mockEditoriales.map(editorial => (
                    <option key={editorial.id} value={editorial.id}>
                      {editorial.nombre}
                    </option>
                  ))}
                </select>
                {errors.editorialId && <p className="text-red-500 text-sm mt-1">{errors.editorialId}</p>}
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  name="categoriaId"
                  value={libroData.categoriaId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.categoriaId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecciona una categoría</option>
                  {mockCategorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
                {errors.categoriaId && <p className="text-red-500 text-sm mt-1">{errors.categoriaId}</p>}
              </div>

              {/* Saga (opcional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saga (opcional)
                </label>
                <select
                  name="sagaId"
                  value={libroData.sagaId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No pertenece a una saga</option>
                  {mockSagas.map(saga => (
                    <option key={saga.id} value={saga.id}>
                      {saga.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Número en saga */}
              {libroData.sagaId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número en la Saga
                  </label>
                  <input
                    type="number"
                    name="numeroEnSaga"
                    value={libroData.numeroEnSaga}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: 1, 2, 3..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Idiomas */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Idiomas Disponibles *</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {idiomasDisponibles.map(idioma => (
                <button
                  key={idioma.codigo}
                  type="button"
                  onClick={() => handleIdiomaToggle(idioma.codigo)}
                  className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-colors duration-200 ${
                    libroData.idiomas.includes(idioma.codigo)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">{idioma.nombre}</span>
                </button>
              ))}
            </div>
            {errors.idiomas && <p className="text-red-500 text-sm mt-2">{errors.idiomas}</p>}
          </div>

          {/* Portada */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Portada del Libro</h2>
            
            <div className="flex items-start space-x-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subir Imagen de Portada
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePortadaChange}
                    className="hidden"
                    id="portada-upload"
                  />
                  <label htmlFor="portada-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Haz clic para subir una imagen</p>
                    <p className="text-sm text-gray-500">PNG, JPG hasta 5MB</p>
                  </label>
                </div>
              </div>
              
              {portadaPreview && (
                <div className="flex-shrink-0">
                  <p className="text-sm font-medium text-gray-700 mb-2">Vista Previa</p>
                  <img
                    src={portadaPreview}
                    alt="Vista previa"
                    className="w-32 h-40 object-cover rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/libros')}
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
              <span>{loading ? 'Creando...' : 'Crear Libro'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};