import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-14 h-8 bg-gray-200 dark:bg-gray-700 rounded-full p-1 cursor-pointer transition-colors duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
    >
      {/* Background animado */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 dark:from-indigo-600 dark:to-purple-700 rounded-full"
        initial={false}
        animate={{
          opacity: isDark ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Iconos */}
      <div className="relative flex items-center justify-between w-full px-1">
        <Sun 
          className={`w-4 h-4 transition-colors duration-300 ${
            isDark ? 'text-gray-400' : 'text-yellow-500'
          }`}
        />
        <Moon 
          className={`w-4 h-4 transition-colors duration-300 ${
            isDark ? 'text-yellow-200' : 'text-gray-400'
          }`}
        />
      </div>

      {/* Toggle circular */}
      <motion.div
        className="absolute w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
        initial={false}
        animate={{
          x: isDark ? 22 : 2,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-indigo-600" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-yellow-600" />
        )}
      </motion.div>
    </motion.button>
  );
};
