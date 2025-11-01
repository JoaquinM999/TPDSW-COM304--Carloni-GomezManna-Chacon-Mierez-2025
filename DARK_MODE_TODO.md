# 🌙 TODO: Implementación Completa de Dark Mode

## Estado: 6/15 completadas ✅ (40% completado)

---

## ✅ COMPLETADO

1. [x] Configurar Tailwind CSS v4 con @theme para dark mode
2. [x] Crear ThemeContext con localStorage y detección de sistema
3. [x] Crear componente ThemeToggle animado con iconos
4. [x] Integrar ThemeProvider en App.tsx
5. [x] Aplicar dark mode en HeroSection (backgrounds, textos, cards)
6. [x] Aplicar dark mode completo en Header (nav, dropdowns, menús, búsqueda)

---

## 🔧 EN PROGRESO / PENDIENTE

### 🔴 CRÍTICO - Componentes Principales

7. [ ] **FIX: Verificar y corregir funcionamiento del ThemeToggle**
   - Problema reportado: el botón no funciona bien
   - Verificar import en Header
   - Testear toggle de clases en documentElement
   - Validar persistencia en localStorage

8. [ ] **FeaturedContent.tsx** - Carrusel de libros destacados
   - Background gradients
   - Cards de libros (fondo, bordes, sombras)
   - Textos (títulos, descripciones, autores)
   - Botones de navegación
   - Indicadores/thumbnails

9. [ ] **Footer.tsx** - Pie de página
   - Background
   - Enlaces y textos
   - Iconos sociales
   - Divisores

10. [ ] **SearchBar.tsx** - Barra de búsqueda principal
    - Input field
    - Sugerencias/dropdown
    - Iconos
    - Focus states

### 🟡 IMPORTANTE - Páginas Principales

11. [ ] **LibrosPage.tsx** - Página de listado de libros
    - Grid/lista de libros
    - Filtros y categorías
    - Cards individuales

12. [ ] **DetalleLibro.tsx** - Página de detalle del libro
    - Información del libro
    - Sección de reseñas
    - Botones de acción

13. [ ] **AutoresPage.tsx** - Página de autores
    - Grid de autores
    - Cards con avatares
    - Información de autor

14. [ ] **SagasPage.tsx** - Página de sagas
    - Listado de sagas
    - Cards de sagas
    - Detalles

15. [ ] **PerfilPage.tsx / PerfilUsuario.tsx** - Perfiles
    - Información del usuario
    - Estadísticas
    - Listas y favoritos

### 🟢 OPCIONAL - Componentes Secundarios

16. [ ] **LoginModal.tsx** - Modal de login
17. [ ] **Cards genéricas** - Componentes reutilizables
18. [ ] **Forms** - Formularios (crear libro, saga, etc.)
19. [ ] **Badges y Tags** - Etiquetas de categorías
20. [ ] **Tooltips y Popovers** - Elementos emergentes
21. [ ] **Modals generales** - Todos los modales

---

## 📋 CHECKLIST DE DARK MODE POR COMPONENTE

Para cada componente, verificar:
- [ ] Backgrounds (bg-*)
- [ ] Textos (text-*)
- [ ] Bordes (border-*)
- [ ] Sombras (shadow-*)
- [ ] Hover states
- [ ] Focus states
- [ ] Iconos (stroke/fill colors)
- [ ] Inputs y forms
- [ ] Transiciones suaves (transition-colors duration-200/300)

---

## 🎨 PALETA DE COLORES DARK MODE

### Backgrounds
- `bg-white` → `dark:bg-gray-900`
- `bg-gray-50` → `dark:bg-gray-800`
- `bg-gray-100` → `dark:bg-gray-700`
- `bg-white/80` → `dark:bg-gray-800/80`

### Textos
- `text-gray-900` → `dark:text-white`
- `text-gray-700` → `dark:text-gray-300`
- `text-gray-600` → `dark:text-gray-400`
- `text-gray-500` → `dark:text-gray-500`

### Bordes
- `border-gray-200` → `dark:border-gray-700`
- `border-gray-300` → `dark:border-gray-600`

### Acentos (mantener colores vibrantes)
- `text-blue-600` → `dark:text-blue-400`
- `text-green-600` → `dark:text-green-400`
- `text-purple-600` → `dark:text-purple-400`

### Hover States
- `hover:bg-gray-100` → `dark:hover:bg-gray-800`
- `hover:bg-blue-50` → `dark:hover:bg-blue-900/20`

---

## 🚀 PRIORIDAD DE IMPLEMENTACIÓN

1. **FASE 1 (CRÍTICO)** - Arreglar ThemeToggle ✋
2. **FASE 2 (ALTA)** - FeaturedContent, Footer, SearchBar
3. **FASE 3 (MEDIA)** - Páginas principales (Libros, Autores, Sagas, Perfil)
4. **FASE 4 (BAJA)** - Componentes secundarios y modals

---

## 📝 NOTAS TÉCNICAS

- Usar `transition-colors duration-300` para transiciones suaves
- Agregar `dark:` prefix a TODAS las utilidades de color
- Verificar contraste WCAG AA en ambos modos
- Testear en diferentes navegadores
- Validar que los iconos sean visibles en ambos modos
- Asegurar que las imágenes tengan buen contraste

---

## ⚠️ PROBLEMAS CONOCIDOS

1. **ThemeToggle no funciona correctamente** - Prioridad ALTA
   - Verificar si se está aplicando la clase al HTML element
   - Revisar console para errores
   - Validar que el Context está disponible

---

## 🎯 OBJETIVO FINAL

Tener toda la aplicación con soporte completo de dark mode:
- ✅ Toggle funcional y persistente
- ✅ Todos los componentes adaptados
- ✅ Transiciones suaves
- ✅ Contraste adecuado
- ✅ Experiencia de usuario consistente
