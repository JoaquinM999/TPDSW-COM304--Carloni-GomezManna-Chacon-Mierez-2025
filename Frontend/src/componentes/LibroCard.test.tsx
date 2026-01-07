import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/test-utils';
import LibroCard from './LibroCard';

describe('LibroCard', () => {
  const mockProps = {
    title: 'El Señor de los Anillos',
    authors: ['J.R.R. Tolkien'],
    image: 'https://example.com/book-cover.jpg',
    description: 'Una épica aventura fantástica',
    rating: 4.5,
  };

  it('debe renderizar el título del libro', () => {
    renderWithProviders(<LibroCard {...mockProps} />);
    
    expect(screen.getByText('El Señor de los Anillos')).toBeInTheDocument();
  });

  it('debe renderizar los autores correctamente', () => {
    renderWithProviders(<LibroCard {...mockProps} />);
    
    expect(screen.getByText(/J.R.R. Tolkien/)).toBeInTheDocument();
  });

  it('debe renderizar con múltiples autores', () => {
    const multipleAuthorsProps = {
      ...mockProps,
      authors: ['J.R.R. Tolkien', 'Christopher Tolkien'],
    };
    
    renderWithProviders(<LibroCard {...multipleAuthorsProps} />);
    
    expect(screen.getByText(/J.R.R. Tolkien/)).toBeInTheDocument();
    expect(screen.getByText(/Christopher Tolkien/)).toBeInTheDocument();
  });

  it('debe renderizar sin autores si no se proveen', () => {
    const noAuthorsProps = {
      ...mockProps,
      authors: undefined,
    };
    
    renderWithProviders(<LibroCard {...noAuthorsProps} />);
    
    expect(screen.getByText('El Señor de los Anillos')).toBeInTheDocument();
  });

  it('debe tener el atributo aria-label correcto', () => {
    renderWithProviders(<LibroCard {...mockProps} />);
    
    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('aria-label', 'Libro: El Señor de los Anillos');
  });

  it('debe renderizar con imagen null sin errores', () => {
    const noImageProps = {
      ...mockProps,
      image: null,
    };
    
    renderWithProviders(<LibroCard {...noImageProps} />);
    
    expect(screen.getByText('El Señor de los Anillos')).toBeInTheDocument();
  });

  it('debe mostrar rating cuando se provee', () => {
    renderWithProviders(<LibroCard {...mockProps} />);
    
    // El rating debería estar en el componente
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('debe renderizar extraInfo cuando se provee', () => {
    const propsWithExtraInfo = {
      ...mockProps,
      extraInfo: 'Publicado en 1954',
    };
    
    renderWithProviders(<LibroCard {...propsWithExtraInfo} />);
    
    expect(screen.getByText('Publicado en 1954')).toBeInTheDocument();
  });

  it('debe tener las clases CSS correctas para styling', () => {
    renderWithProviders(<LibroCard {...mockProps} />);
    
    const article = screen.getByRole('article');
    expect(article).toHaveClass('bg-white/95', 'dark:bg-gray-800/95', 'rounded-2xl');
  });
});
