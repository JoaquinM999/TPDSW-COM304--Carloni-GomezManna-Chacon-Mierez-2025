import React, { useState, useEffect, useRef } from 'react';
import { Search, Book, User, X, Loader2, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '../hooks/useDebounce';
import { searchBooksAutocomplete, GoogleBooksVolume } from '../services/googleBooksService';

interface SearchItem {
  id: string;
  title: string;
  type: 'book' | 'author' | 'saga';
  author?: string;
  books?: number;
  year?: number;
  image?: string;
}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  database?: SearchItem[];
  className?: string;
  disableSuggestions?: boolean;
}

const mockDatabase: SearchItem[] = [
  { id: '1', title: 'Cien años de soledad', type: 'book', author: 'Gabriel García Márquez', year: 1967 },
  { id: '2', title: 'Don Quijote de la Mancha', type: 'book', author: 'Miguel de Cervantes', year: 1605 },
  { id: '3', title: 'El amor en los tiempos del cólera', type: 'book', author: 'Gabriel García Márquez', year: 1985 },
  { id: '4', title: 'La casa de los espíritus', type: 'book', author: 'Isabel Allende', year: 1982 },
  { id: '5', title: 'Rayuela', type: 'book', author: 'Julio Cortázar', year: 1963 },
  { id: '6', title: 'Gabriel García Márquez', type: 'author', books: 15, year: 1927 },
  { id: '7', title: 'Isabel Allende', type: 'author', books: 23, year: 1942 },
  { id: '8', title: 'Julio Cortázar', type: 'author', books: 18, year: 1914 },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Buscar libros, autores...',
  onSearch,
  database = mockDatabase,
  className = '',
  disableSuggestions = false,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Debounce del query para evitar demasiadas llamadas a la API
  const debouncedQuery = useDebounce(query, 300);

  // Búsquedas populares/trending
  const trendingSearches = [
    'Cien años de soledad',
    'El principito',
    'Harry Potter',
    'Don Quijote',
  ];

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length > 2 && !disableSuggestions) {
        setIsLoading(true);
        try {
          // Buscar en Google Books API
          const results = await searchBooksAutocomplete(debouncedQuery, 6);
          
          const googleSuggestions: SearchItem[] = results.map((book: GoogleBooksVolume) => ({
            id: book.id,
            title: book.volumeInfo.title,
            type: 'book' as const,
            author: book.volumeInfo.authors?.[0] || 'Autor desconocido',
            year: book.volumeInfo.publishedDate ? new Date(book.volumeInfo.publishedDate).getFullYear() : undefined,
            image: book.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
          }));

          // Combinar con resultados locales si existen
          const localResults = database
            .filter(
              (item) =>
                (item.title?.toLowerCase() || '').includes(debouncedQuery.toLowerCase()) ||
                (item.author?.toLowerCase() || '').includes(debouncedQuery.toLowerCase())
            )
            .slice(0, 2);

          setSuggestions([...googleSuggestions, ...localResults].slice(0, 8));
          setIsOpen(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          // Fallback a búsqueda local
          const filtered = database
            .filter(
              (item) =>
                (item.title?.toLowerCase() || '').includes(debouncedQuery.toLowerCase()) ||
                (item.author?.toLowerCase() || '').includes(debouncedQuery.toLowerCase())
            )
            .slice(0, 8);
          setSuggestions(filtered);
          setIsOpen(filtered.length > 0);
        } finally {
          setIsLoading(false);
        }
      } else if (debouncedQuery.length === 0) {
        setSuggestions([]);
        setIsOpen(false);
      }
      setSelectedIndex(-1);
    };

    fetchSuggestions();
  }, [debouncedQuery, database, disableSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        handleSelect(suggestions[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (item: SearchItem) => {
    setQuery(item.title);
    setIsOpen(false);
    if (onSearch) onSearch(item.title);
    if (item.type === 'book') window.location.href = `/libro/${item.id}`;
  };

  const handleSearch = () => {
    if (onSearch) onSearch(query);
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div
      ref={searchRef}
      className={`relative w-full max-w-2xl mx-auto ${className}`}
    >
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg shadow-lg"
          placeholder={placeholder}
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
          {isLoading && (
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          )}
          {query && !isLoading && (
            <button
              onClick={clearSearch}
              aria-label="Borrar búsqueda"
              className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1 transition-colors"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {!disableSuggestions && isOpen && (
          <motion.div
            id="search-results"
            role="listbox"
            className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Header con contador */}
            {suggestions.length > 0 && (
              <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-b border-blue-100 dark:border-blue-800">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {suggestions.length} resultado{suggestions.length !== 1 ? 's' : ''} encontrado{suggestions.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Sugerencias */}
            <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {suggestions.length > 0 ? (
                suggestions.map((item, index) => (
                  <motion.div
                    key={item.id}
                    id={`suggestion-${index}`}
                    role="option"
                    aria-selected={selectedIndex === index}
                    onClick={() => handleSelect(item)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 flex items-center gap-3 transition-all duration-200 ${
                      selectedIndex === index 
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-l-blue-500' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 border-l-transparent'
                    }`}
                  >
                    {/* Imagen de portada o ícono */}
                    <div className="flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-16 object-cover rounded shadow-sm"
                          onError={(e) => {
                            // Fallback si la imagen falla
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={item.image ? 'hidden' : 'flex items-center justify-center w-12 h-16 rounded bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900'}>
                        {item.type === 'book' ? (
                          <Book className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        ) : item.type === 'author' ? (
                          <User className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : null}
                      </div>
                    </div>

                    {/* Información */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5">
                        {item.type === 'book' && item.author && `por ${item.author}`}
                        {item.type === 'author' && item.books && `${item.books} libros`}
                        {item.year && item.type !== 'saga' && ` • ${item.year}`}
                      </p>
                    </div>

                    {/* Badge de tipo */}
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.type === 'book' 
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' 
                        : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                    }`}>
                      {item.type === 'book' ? 'Libro' : 'Autor'}
                    </div>
                  </motion.div>
                ))
              ) : query.length > 0 && !isLoading ? (
                <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm">No se encontraron resultados</p>
                  <p className="text-xs mt-1">Intenta con otro término de búsqueda</p>
                </div>
              ) : null}
            </div>

            {/* Footer con búsquedas populares cuando no hay query */}
            {query.length === 0 && (
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Búsquedas populares
                </p>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setQuery(term);
                        inputRef.current?.focus();
                      }}
                      className="px-3 py-1 bg-white dark:bg-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 rounded-full text-xs text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
