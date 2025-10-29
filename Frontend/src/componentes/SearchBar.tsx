import React, { useState, useEffect, useRef } from 'react';
import { Search, Book, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length > 1) {
      const filtered = database
        .filter(
          (item) =>
            (item.title?.toLowerCase() || '').includes(query.toLowerCase()) ||
            (item.author?.toLowerCase() || '').includes(query.toLowerCase())
        )
        .slice(0, 8);
      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
    setSelectedIndex(-1);
  }, [query, database]);

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
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg shadow-lg"
          placeholder={placeholder}
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        />
        {query && (
          <button
            onClick={clearSearch}
            aria-label="Borrar búsqueda"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {!disableSuggestions && isOpen && suggestions.length > 0 && (
          <motion.div
            id="search-results"
            role="listbox"
            className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {suggestions.map((item, index) => (
              <div
                key={item.id}
                id={`suggestion-${index}`}
                role="option"
                aria-selected={selectedIndex === index}
                onClick={() => handleSelect(item)}
                className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center space-x-3 hover:bg-blue-50 focus:bg-blue-50 ${
                  selectedIndex === index ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex-shrink-0">
                  {item.type === 'book' ? (
                    <Book className="w-5 h-5 text-blue-600" />
                  ) : item.type === 'author' ? (
                    <User className="w-5 h-5 text-green-600" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.title}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {item.type === 'book' && `por ${item.author}`}
                    {item.type === 'author' && `${item.books} libros`}
                    {item.year && item.type !== 'saga' && ` (${item.year})`}
                  </p>
                </div>
                <div className="text-xs text-gray-400 capitalize">{item.type}</div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
