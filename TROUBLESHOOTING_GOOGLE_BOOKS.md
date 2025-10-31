# 🔧 Guía de Troubleshooting - Google Books API

## ✅ Verificación de Funcionamiento

### 1. Página de Prueba

He creado una página HTML de prueba que puedes abrir en tu navegador:

```
http://localhost:5174/test-google-books.html
```

**¿Qué hace esta página?**
- ✅ Busca autores en Google Books API
- ✅ Muestra fotos de Wikipedia
- ✅ Muestra hasta 40 libros con portadas
- ✅ Permite limpiar el caché
- ✅ Muestra estadísticas en tiempo real

**Cómo usarla:**
1. Abre la URL en tu navegador
2. Ingresa un nombre de autor (ej: "Gabriel García Márquez")
3. Haz clic en "Buscar Autor"
4. Deberías ver los libros aparecer

---

## 🔍 Verificación Manual con curl

Puedes probar la API directamente desde la terminal:

```bash
curl "https://www.googleapis.com/books/v1/volumes?q=inauthor:Gabriel&maxResults=5&key=AIzaSyDv1Nti5ax3FCGI-GXKzyj3S1OTK29retI"
```

**Respuesta esperada:** JSON con libros del autor

---

## 🎯 Cómo Probar en la Aplicación Real

### Paso 1: Ir a la página de autores
```
http://localhost:5174/autores
```

### Paso 2: Hacer clic en cualquier autor
Por ejemplo, si tienes un autor con ID 1:
```
http://localhost:5174/autor/1
```

### Paso 3: Esperar a que cargue
La página debería mostrar:
1. **Foto del autor** (si está en Wikipedia) o avatar
2. **Estadísticas** con total de libros (BD + Google Books)
3. **Libros de la BD local** (los que ya tenías)
4. **Sección "Más Libros en Google Books"** (nueva sección con libros adicionales)

---

## 🐛 Problemas Comunes y Soluciones

### Problema 1: "No se ven los libros de Google Books"

**Posibles causas:**
1. El autor no tiene libros en Google Books
2. El nombre del autor no coincide exactamente
3. Hay un error de red

**Soluciones:**
```typescript
// Abre la consola del navegador (F12) y busca estos mensajes:
🔍 Consultando Google Books API para: [nombre del autor]
✅ Datos de Google Books desde cache para: [nombre del autor]
```

Si no ves estos mensajes, el servicio no se está ejecutando.

**Verifica en la consola:**
```javascript
// Pega esto en la consola del navegador
localStorage.getItem('google_books_autor_gabriel_garcia_marquez')
```

Si devuelve `null`, significa que no hay datos en caché.

### Problema 2: "Error de CORS"

**Solución:** Google Books API permite CORS, pero si ves un error:
- Verifica que estés usando `https://` en la URL
- La API Key es correcta

### Problema 3: "El autor no tiene libros"

**Solución:**
Prueba con estos autores que seguro tienen muchos libros:
- Gabriel García Márquez
- J.K. Rowling
- Stephen King
- Isabel Allende
- Paulo Coelho
- Jorge Luis Borges

### Problema 4: "Tarda mucho en cargar"

**Es normal la primera vez:**
- Primera carga: 2-4 segundos (consulta a API)
- Cargas siguientes: < 500ms (desde caché)

**Caché:**
Los datos se guardan por 7 días en `localStorage`.

---

## 🔍 Debugging Paso a Paso

### 1. Verifica que el servicio existe

```bash
ls -la Frontend/src/services/googleBooksAutorService.ts
```

Debería existir el archivo.

### 2. Verifica que el componente lo importa

```bash
grep -n "googleBooksAutorService" Frontend/src/paginas/DetalleAutor.tsx
```

Deberías ver las importaciones.

### 3. Abre la consola del navegador

1. Ve a la página del autor
2. Presiona F12 (o Cmd+Option+I en Mac)
3. Ve a la pestaña "Console"
4. Busca mensajes que empiecen con:
   - `🔍 Consultando Google Books API`
   - `✅ Datos de Google Books desde cache`
   - `❌` (errores)

### 4. Verifica el Network

1. En las DevTools, ve a la pestaña "Network"
2. Filtra por "googleapis.com"
3. Deberías ver requests a:
   ```
   https://www.googleapis.com/books/v1/volumes?q=inauthor:...
   ```
4. Si el status es 200, la API funciona
5. Si es 403, hay problema con la API Key
6. Si es 429, excediste el límite de requests

### 5. Verifica localStorage

En la consola del navegador:
```javascript
// Ver todas las claves
Object.keys(localStorage).filter(k => k.startsWith('google_books_'))

// Ver datos de un autor específico
JSON.parse(localStorage.getItem('google_books_autor_gabriel_garcia_marquez'))
```

---

## 📊 Estados de Carga

La página tiene diferentes estados:

### Estado 1: Cargando
```
⏳ Cargando información del autor...
```

### Estado 2: Datos de BD cargados
- Foto del autor (o avatar)
- Estadísticas
- Libros de la BD local

### Estado 3: Datos de Google Books cargando
- Skeletons animados en la sección de libros adicionales

### Estado 4: Todo cargado
- Foto real (si está disponible)
- Estadísticas completas
- Libros de BD
- **Sección "Más Libros en Google Books"** (si hay libros adicionales)

---

## 🎨 Cómo Se Ve Cuando Funciona

### Sección de Libros Adicionales

Deberías ver una nueva sección con:
- **Fondo degradado azul-púrpura**
- **Título:** "Más Libros en Google Books"
- **Subtítulo:** "Encontramos X libros adicionales..."
- **Grid de libros** con portadas
- **Hover effects** al pasar el mouse
- **Icono de enlace externo** (🔗)
- Al hacer clic, abre Google Books en nueva pestaña

### Estadísticas Actualizadas

La tarjeta de "Libros Publicados" debería mostrar:
```
[Número grande]
Libros Publicados

X en BD + Y en Google Books
```

---

## 🧪 Test Rápido

**Caso de prueba con Gabriel García Márquez:**

1. Ve a `/autor/1` (o el ID que corresponda)
2. Espera 2-4 segundos
3. Deberías ver:
   - ✅ Foto real del autor
   - ✅ ~30-40 libros en total
   - ✅ Sección "Más Libros en Google Books"
   - ✅ Portadas de libros
   - ✅ Enlaces funcionando

**Si NO ves esto:**
1. Abre la consola (F12)
2. Busca errores en rojo
3. Copia el error completo
4. Revisa la sección de problemas comunes arriba

---

## 🔑 Información de la API

**API Key:** `AIzaSyDv1Nti5ax3FCGI-GXKzyj3S1OTK29retI`

**Límites:**
- 1,000 requests/día (gratis)
- 100 requests/100 segundos

**Con el caché de 7 días:**
- Cada autor se consulta máximo 1 vez cada 7 días
- Esto permite ~7,000 visitas únicas diarias
- Suficiente para la mayoría de aplicaciones

---

## 📞 ¿Aún no funciona?

### Opción 1: Limpiar todo y reiniciar

```bash
# En la consola del navegador
localStorage.clear()

# Recargar la página
location.reload()
```

### Opción 2: Verificar que el backend esté corriendo

```bash
curl http://localhost:3000/api/autor/1
```

Debería devolver datos del autor.

### Opción 3: Verificar el autor tiene libros en Google Books

Prueba en la página de prueba:
```
http://localhost:5174/test-google-books.html
```

Si NO funciona ahí tampoco, el problema es con la API.
Si SÍ funciona ahí, el problema es con la integración en el componente.

---

## ✅ Checklist de Verificación

- [ ] Frontend corriendo en http://localhost:5174
- [ ] Backend corriendo en http://localhost:3000
- [ ] Archivo `googleBooksAutorService.ts` existe
- [ ] `DetalleAutor.tsx` importa el servicio
- [ ] Puedes abrir la página de prueba
- [ ] La página de prueba muestra libros
- [ ] La página de autor carga sin errores
- [ ] La consola no muestra errores en rojo
- [ ] Puedes ver requests a googleapis.com en Network
- [ ] localStorage tiene entradas con `google_books_`

---

## 🎉 Cuando Todo Funciona

Deberías poder:
1. ✅ Ver fotos reales de autores
2. ✅ Ver 30-40 libros por autor (en lugar de 1-2)
3. ✅ Hacer clic en libros para ir a Google Books
4. ✅ Ver portadas profesionales
5. ✅ Ver calificaciones y años de publicación
6. ✅ Cargas instantáneas después de la primera vez (caché)

---

**Última actualización:** 31 de octubre de 2025  
**Versión:** 1.0.0
