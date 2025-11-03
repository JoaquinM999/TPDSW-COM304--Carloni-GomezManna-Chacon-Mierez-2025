# 🎯 Guía: Cómo Usar la Búsqueda Híbrida de Autores

## ✅ Cambios Realizados

### Frontend (`AutoresPageMejorada.tsx`):
1. ✅ **Activada búsqueda híbrida** con APIs externas
2. ✅ **Toggle visible** para activar búsqueda en Google Books y OpenLibrary
3. ✅ **Mapeo correcto** de campos del backend al frontend
4. ✅ **Logs de debugging** para ver qué tipo de búsqueda se usa

---

## 🚀 Cómo Probar

### Paso 1: Asegúrate de que el Backend esté corriendo
```powershell
cd Backend
npm run dev
```

Deberías ver:
```
🚀 Servidor en puerto 3000
```

### Paso 2: Asegúrate de que el Frontend esté corriendo
```powershell
cd Frontend
npm run dev
```

### Paso 3: Abre la página de autores
```
http://localhost:5173/autores
```

---

## 📋 Escenarios de Prueba

### Escenario 1: Base de Datos Vacía + Búsqueda Local
**Acción:** Buscar "rowling" SIN activar el checkbox  
**Resultado esperado:**
- ✅ No muestra autores (BD vacía)
- ✅ En los logs del backend verás: `✅ Encontrados 0 autores totales`

---

### Escenario 2: Base de Datos Vacía + Búsqueda Híbrida ⭐
**Acción:**
1. Buscar "rowling"
2. **Activar el checkbox** "Buscar en Google Books y OpenLibrary"

**Resultado esperado:**
- ✅ Muestra autores de Google Books y OpenLibrary
- ✅ Los autores se **guardan automáticamente en tu BD**
- ✅ En los logs del backend verás:
  ```
  🔍 searchAutores - Query recibida: rowling
  📚 Buscando en BDD local...
  ✅ Encontrados 0 autores locales
  🌐 Buscando en APIs externas...
  📖 Buscando en Google Books API: rowling
  ✅ Encontrados X autores únicos en Google Books
  📚 Buscando en OpenLibrary API: rowling
  ✅ Encontrados Y autores en OpenLibrary
  ✅ Total combinado: Z autores
  ```

---

### Escenario 3: Después de la Primera Búsqueda
**Acción:** Buscar "rowling" de nuevo (con o sin checkbox)

**Resultado esperado:**
- ✅ Ahora muestra autores de la BD local (los que se guardaron antes)
- ✅ Si activas el checkbox, puede encontrar más autores y agregarlos
- ✅ **No hay duplicados** (gracias a la reconciliación)

---

## 🔍 En la Consola del Navegador

### Búsqueda Local:
```
📚 Búsqueda local: rowling
```

### Búsqueda Híbrida:
```
🌐 Búsqueda híbrida con APIs externas: rowling
```

---

## 🎨 Interfaz de Usuario

### Toggle de Búsqueda Externa:
```
┌─────────────────────────────────────────────┐
│  🔍 [    rowling    ]  🌐 Buscar en Google  │
│                           Books y OpenLibrary│
│                           ☑                  │
└─────────────────────────────────────────────┘
```

**En escritorio:** Texto completo "Buscar en Google Books y OpenLibrary"  
**En móvil:** Solo icono 🌐

---

## 📊 Comportamiento Esperado

| BD Local | Checkbox | Resultado |
|----------|----------|-----------|
| Vacía | ❌ | No muestra nada |
| Vacía | ✅ | Muestra autores de APIs y los guarda |
| Con datos | ❌ | Muestra solo autores locales |
| Con datos | ✅ | Muestra locales + nuevos de APIs |

---

## 🐛 Si No Funciona

### 1. Verifica la consola del navegador (F12)
Busca errores de red o JavaScript

### 2. Verifica logs del backend
Deberías ver logs con emojis (🔍📚🌐✅❌)

### 3. Verifica la URL del endpoint
El frontend debe llamar a:
- **Local:** `http://localhost:3000/api/autores?search=...`
- **Híbrida:** `http://localhost:3000/api/autores/search?q=...&includeExternal=true`

### 4. Verifica que el puerto sea correcto
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173` (o el que use Vite)

---

## ✨ Funcionalidades Implementadas

### ✅ Búsqueda Local
- Busca solo en tu base de datos MySQL
- Paginación automática
- Resultados instantáneos

### ✅ Búsqueda Híbrida
- Busca en BD local + Google Books + OpenLibrary
- Guarda autores nuevos automáticamente
- Evita duplicados con reconciliación inteligente
- Enriquece con biografías y fotos

### ✅ Reconciliación Inteligente
- Busca primero por IDs externos (googleBooksId, openLibraryKey)
- Si no existe, busca por nombre completo
- Si existe por nombre, actualiza con ID externo
- Si no existe, crea nuevo autor

---

## 🎯 Autores Sugeridos para Probar

### Autores muy populares (muchos resultados):
- "Rowling" (J.K. Rowling - Harry Potter)
- "García Márquez" (Gabriel García Márquez)
- "Stephen King"
- "Isabel Allende"

### Autores menos conocidos:
- "Smith" (varios autores)
- "Johnson"

---

**¡La búsqueda híbrida está completamente funcional!** 🚀

**Fecha:** 3 de noviembre de 2025  
**Estado:** ✅ Activada y Lista para Usar
