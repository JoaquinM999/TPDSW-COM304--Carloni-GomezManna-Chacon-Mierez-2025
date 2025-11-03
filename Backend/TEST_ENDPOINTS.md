# 🧪 Comandos de Prueba para Endpoints de Autores

## Asegúrate de que el servidor esté corriendo en http://localhost:3000

### 1. Lista básica de autores (paginada)
```powershell
curl "http://localhost:3000/api/autores"
```

### 2. Búsqueda local por nombre
```powershell
curl "http://localhost:3000/api/autores?search=Gabriel"
```

### 3. Búsqueda híbrida (solo local)
```powershell
curl "http://localhost:3000/api/autores/search?q=Rowling"
```

### 4. Búsqueda híbrida (con APIs externas) ⭐
```powershell
curl "http://localhost:3000/api/autores/search?q=Rowling&includeExternal=true"
```

### 5. Obtener autor por ID
```powershell
curl "http://localhost:3000/api/autores/1"
```

### 6. Estadísticas de autor
```powershell
curl "http://localhost:3000/api/autores/1/stats"
```

---

## 🔍 Para ver mejor el JSON, puedes usar:

### Con PowerShell:
```powershell
(Invoke-WebRequest -Uri "http://localhost:3000/api/autores/search?q=Rowling&includeExternal=true").Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

### Con curl + jq (si lo tienes instalado):
```bash
curl "http://localhost:3000/api/autores/search?q=Rowling&includeExternal=true" | jq
```

---

## 🎯 Casos de Prueba Recomendados:

### 1. Autor Popular
```powershell
curl "http://localhost:3000/api/autores/search?q=Gabriel+García+Márquez&includeExternal=true"
```

### 2. Autor Menos Conocido
```powershell
curl "http://localhost:3000/api/autores/search?q=Smith&includeExternal=true"
```

### 3. Búsqueda Sin Resultados
```powershell
curl "http://localhost:3000/api/autores/search?q=XXXYYYZZZ"
```

### 4. Búsqueda con Menos de 2 Caracteres (debe dar error)
```powershell
curl "http://localhost:3000/api/autores/search?q=X"
```

---

## 📊 Verificar Logs del Servidor

Después de cada request, revisa la consola del servidor para ver:
- 🔍 Queries recibidas
- 📚 Resultados de búsqueda local
- 🌐 Llamadas a APIs externas
- ✅ Éxitos
- ❌ Errores

Los logs incluyen emojis para fácil identificación!
