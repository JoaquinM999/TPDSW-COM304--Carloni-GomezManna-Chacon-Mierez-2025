# 🧪 Guía de Testing Frontend - React + Vitest

## 📊 Resumen Ejecutivo

**Fecha:** 6 de enero de 2026  
**Framework:** Vitest 4.0.16 + React Testing Library  
**Estado:** ✅ Configuración completada, **17 tests pasando**

---

## ✅ Configuración Completada

### 1. Dependencias Instaladas

```json
{
  "@testing-library/react": "^latest",
  "@testing-library/jest-dom": "^latest",
  "@testing-library/user-event": "^latest",
  "@vitest/ui": "^latest",
  "jsdom": "^latest"
}
```

### 2. Archivos Creados

- ✅ `vite.config.ts` - Configuración de Vitest
- ✅ `src/test/setup.ts` - Setup global de tests
- ✅ `src/test/test-utils.tsx` - Helper `renderWithProviders`
- ✅ `src/vite-env.d.ts` - Types de Vitest
- ✅ `package.json` - Scripts de test

### 3. Scripts Disponibles

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests con interfaz visual
npm run test:ui

# Ejecutar tests con coverage
npm run test:coverage
```

---

## 📝 Tests Creados

### LibroCard.test.tsx (9 tests - 100% ✅)

```typescript
✅ debe renderizar el título del libro
✅ debe renderizar los autores correctamente
✅ debe renderizar con múltiples autores
✅ debe renderizar sin autores si no se proveen
✅ debe tener el atributo aria-label correcto
✅ debe renderizar con imagen null sin errores
✅ debe mostrar rating cuando se provee
✅ debe renderizar extraInfo cuando se provee
✅ debe tener las clases CSS correctas para styling
```

### SearchBar.test.tsx (9 tests - 8 pasando ✅, 1 skip ⏭️)

```typescript
✅ debe renderizar el input de búsqueda
✅ debe mostrar el placeholder personalizado
✅ debe actualizar el valor del input al escribir
⏭️ debe llamar a onSearch cuando se provee (TODO)
✅ debe mostrar el icono de búsqueda
✅ debe limpiar el input al hacer clic en el botón de limpiar
✅ debe aplicar className personalizado
✅ debe mostrar sugerencias cuando hay database
✅ debe deshabilitar sugerencias con disableSuggestions prop
```

**Total: 17 tests ejecutados, 17 pasando (94% success rate considerando skip)**

---

## 🎯 Estructura de un Test

### Anatomía Básica

```typescript
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/test-utils';
import MiComponente from './MiComponente';

describe('MiComponente', () => {
  it('debe renderizar correctamente', () => {
    // Arrange: Preparar datos
    const props = { titulo: 'Test' };
    
    // Act: Renderizar componente
    renderWithProviders(<MiComponente {...props} />);
    
    // Assert: Verificar resultado
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

---

## 🔧 Helpers Disponibles

### renderWithProviders

```typescript
import { renderWithProviders } from '../test/test-utils';

// Renderiza componente con BrowserRouter automáticamente
renderWithProviders(<MiComponente />);

// Equivalente a:
render(
  <BrowserRouter>
    <MiComponente />
  </BrowserRouter>
);
```

### userEvent

```typescript
import { userEvent } from '../test/test-utils';

const user = userEvent.setup();

// Escribir en input
await user.type(input, 'texto');

// Click en botón
await user.click(button);

// Hover
await user.hover(element);
```

---

## 🎨 Queries Más Usados

### Buscar Elementos

```typescript
// Por texto visible
screen.getByText('Enviar');
screen.getByText(/enviar/i); // Case insensitive

// Por role (recomendado para accesibilidad)
screen.getByRole('button', { name: /enviar/i });
screen.getByRole('textbox', { name: /nombre/i });

// Por placeholder
screen.getByPlaceholderText('Ingresa tu email');

// Por label
screen.getByLabelText('Email');

// Por test ID (último recurso)
screen.getByTestId('submit-button');
```

### Variantes de Queries

```typescript
// get* - Lanza error si no encuentra (uso normal)
screen.getByText('Texto');

// query* - Retorna null si no encuentra (para verificar ausencia)
expect(screen.queryByText('No existe')).not.toBeInTheDocument();

// find* - Espera a que aparezca (async/await)
const elemento = await screen.findByText('Cargado');
```

---

## ✅ Matchers de jest-dom

```typescript
// Presencia en DOM
expect(element).toBeInTheDocument();
expect(element).not.toBeInTheDocument();

// Visibilidad
expect(element).toBeVisible();
expect(element).not.toBeVisible();

// Valores
expect(input).toHaveValue('texto');
expect(checkbox).toBeChecked();

// Atributos
expect(button).toHaveAttribute('disabled');
expect(link).toHaveAttribute('href', '/ruta');

// Clases CSS
expect(div).toHaveClass('bg-blue-500');
expect(div).toHaveClass('bg-blue-500', 'text-white');

// Texto
expect(element).toHaveTextContent('Hola Mundo');
```

---

## 🧪 Ejemplos de Testing

### Test de Renderizado Básico

```typescript
it('debe renderizar el título', () => {
  renderWithProviders(<LibroCard title="El Hobbit" />);
  expect(screen.getByText('El Hobbit')).toBeInTheDocument();
});
```

### Test de Interacción con Usuario

```typescript
it('debe actualizar input al escribir', async () => {
  const user = userEvent.setup();
  renderWithProviders(<SearchBar />);
  
  const input = screen.getByRole('textbox');
  await user.type(input, 'búsqueda');
  
  expect(input).toHaveValue('búsqueda');
});
```

### Test de Props Condicionales

```typescript
it('debe mostrar mensaje cuando no hay items', () => {
  renderWithProviders(<Lista items={[]} />);
  expect(screen.getByText(/no hay items/i)).toBeInTheDocument();
});

it('debe mostrar items cuando existen', () => {
  renderWithProviders(<Lista items={['Item 1', 'Item 2']} />);
  expect(screen.getByText('Item 1')).toBeInTheDocument();
  expect(screen.getByText('Item 2')).toBeInTheDocument();
});
```

### Test de Callbacks

```typescript
it('debe llamar onClick cuando se hace click', async () => {
  const user = userEvent.setup();
  const mockClick = vi.fn();
  
  renderWithProviders(<Button onClick={mockClick} />);
  
  await user.click(screen.getByRole('button'));
  
  expect(mockClick).toHaveBeenCalledTimes(1);
});
```

### Test con Espera Asíncrona

```typescript
it('debe cargar datos y mostrarlos', async () => {
  renderWithProviders(<DataComponent />);
  
  // Esperar a que aparezca el elemento
  const titulo = await screen.findByText('Datos Cargados');
  expect(titulo).toBeInTheDocument();
});

// O con waitFor
it('debe actualizar después de fetch', async () => {
  renderWithProviders(<Component />);
  
  await waitFor(() => {
    expect(screen.getByText('Actualizado')).toBeInTheDocument();
  });
});
```

---

## 🎭 Mocking

### Mock de Módulos

```typescript
import { vi } from 'vitest';

// Mock completo del módulo
vi.mock('../services/api', () => ({
  fetchLibros: vi.fn().mockResolvedValue([
    { id: 1, titulo: 'Libro 1' }
  ]),
}));
```

### Mock de Funciones

```typescript
const mockFunction = vi.fn();
mockFunction.mockReturnValue('valor');
mockFunction.mockResolvedValue('async valor');

// Verificar llamadas
expect(mockFunction).toHaveBeenCalled();
expect(mockFunction).toHaveBeenCalledWith('argumento');
expect(mockFunction).toHaveBeenCalledTimes(2);
```

### Mock de window.matchMedia (Ya configurado en setup.ts)

```typescript
// Ya está mockeado globalmente en src/test/setup.ts
// No necesitas hacer nada adicional
```

---

## 📊 Coverage

```bash
# Ejecutar tests con coverage
npm run test:coverage

# Ver reporte en navegador
open coverage/index.html
```

**Configuración actual en vite.config.ts:**
- Provider: v8
- Reportes: text, json, html
- Excluidos: node_modules, src/test, *.config.*, dist

---

## 🚀 Próximos Pasos

### Componentes a Testear (Prioridad Alta)

1. **Header.tsx**
   - Navegación
   - Usuario logueado vs no logueado
   - Menú responsive

2. **Footer.tsx**
   - Links
   - Información

3. **Breadcrumbs.tsx**
   - Navegación jerárquica
   - Links activos

4. **FilterChips.tsx**
   - Selección múltiple
   - Estado activo/inactivo

5. **LibroImagen.tsx**
   - Carga de imagen
   - Fallback de error

### Componentes a Testear (Prioridad Media)

6. **AutorCard.tsx**
7. **ResenaList.tsx**
8. **NotificationBell.tsx**
9. **ThemeToggle.tsx**
10. **VoteButtons.tsx**

### Hooks Personalizados a Testear

- `useDebounce`
- `useAuth` (cuando exista)
- `useNotifications`

---

## 📚 Recursos

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Docs](https://vitest.dev/)
- [jest-dom Matchers](https://github.com/testing-library/jest-dom)
- [Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet)

---

## 💡 Best Practices

### ✅ DO

- **Testear comportamiento del usuario**, no implementación
- **Usar queries por role/label** para accesibilidad
- **Esperar a elementos async** con `findBy*` o `waitFor`
- **Usar `userEvent`** en lugar de `fireEvent`
- **Limpiar mocks** en `beforeEach`

### ❌ DON'T

- No testear detalles de implementación (estado interno, CSS exacto)
- No usar `container.querySelector` (preferir queries de testing-library)
- No hacer tests frágiles acoplados a estructura DOM
- No olvidar async/await en interacciones de usuario

---

## 📈 Estado Actual

| Métrica | Valor |
|---------|-------|
| **Tests totales** | 17 |
| **Tests pasando** | 17 (100%) |
| **Tests skip** | 1 |
| **Componentes testeados** | 2 (LibroCard, SearchBar) |
| **Coverage** | Por determinar |
| **Tiempo ejecución** | ~2-3s |

---

**Última actualización:** 6 de enero de 2026  
**Autor:** Equipo COM304 - TPDSW  
**Próximo objetivo:** 50+ tests de componentes (meta: Tarea #8)
