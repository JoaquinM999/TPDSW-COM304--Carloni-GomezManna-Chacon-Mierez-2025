# TODO: Corregir errores de TypeScript en el frontend

## Errores encontrados:
- 27 errores en 12 archivos
- Principalmente imports no usados y variables no usadas
- Un error de tipo en AutorDetallePage.tsx

## Plan de corrección:
1. [x] Corregir error de tipo en AutorDetallePage.tsx (línea 25: 'id' es string | undefined pero esperado string)
2. Remover imports no usados en:
   - Dashboard.tsx: React
   - LibroCard.tsx: description (variable)
   - ResenaList.tsx: React
   - CategoriasPage.tsx: Filter
   - CrearCategoria.tsx: Palette
   - CrearLibro.tsx: X, Users, Calendar, FileText, Tag, Building
   - FavoritosPage.tsx: AnimatePresence, Bookmark, Plus, X, Edit, Trash2, mockLibrosFavoritos, loading
   - LibrosPage.tsx: React, useRef, imagenValida, totalPages
   - LibrosPorCategoria.tsx: React
   - PerfilUsuario.tsx: Mail
   - SagasPage.tsx: React

## Pasos:
- [x] Leer y corregir AutorDetallePage.tsx
- [x] Corregir Dashboard.tsx
- [x] Corregir LibroCard.tsx
- [x] Corregir ResenaList.tsx
- [x] Corregir CategoriasPage.tsx
- [x] Corregir CrearCategoria.tsx
- [x] Corregir CrearLibro.tsx
- [ ] Corregir FavoritosPage.tsx
- [ ] Corregir LibrosPage.tsx
- [ ] Corregir LibrosPorCategoria.tsx
- [ ] Corregir PerfilUsuario.tsx
- [ ] Corregir SagasPage.tsx
- [ ] Verificar que no hay errores corriendo tsc --noEmit --project tsconfig.app.json
