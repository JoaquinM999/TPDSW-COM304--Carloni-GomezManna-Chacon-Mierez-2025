# 📚 Guía de Uso: Export y Seed de Sagas

## 📋 Índice
1. [¿Qué son estos archivos?](#qué-son-estos-archivos)
3. [export-sagas.ts](#export-sagasts)
4. [seed-sagas.ts](#seed-sagasts)
5. [Casos de Uso](#casos-de-uso)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 ¿Qué son estos archivos?

### `export-sagas.ts`
**Script de EXPORTACIÓN** que lee tu base de datos actual y genera un archivo `seed-sagas.ts` con todos los datos.

### `seed-sagas.ts`
**Script de IMPORTACIÓN** que toma datos predefinidos y los carga en la base de datos.

---

```
┌─────────────────┐
│   Base de Datos │
│   (MySQL)       │
└────────┬────────┘
         │
         │ 1. Exportar
         ↓
┌─────────────────┐
│ export-sagas.ts │ ──→ Lee BD y genera código
└────────┬────────┘
         │
         │ 2. Genera
         ↓
┌─────────────────┐
│ seed-sagas.ts   │ ──→ Archivo con datos hardcodeados
└────────┬────────┘
         │
         │ 3. Ejecutar seed
         ↓
┌─────────────────┐
│ Base de Datos   │
│ (cualquier env) │
└─────────────────┘
```

---

## 📤 export-sagas.ts

### ¿Cuándo usar?

✅ **Acabas de agregar sagas manualmente** en la BD  
✅ **Quieres actualizar el seed** con datos nuevos  
✅ **Necesitas crear un backup** de las sagas actuales  
✅ **Migraste datos** y quieres el nuevo seed  

### ¿Qué hace?

1. 🔍 **Lee** todos los datos de tu BD:
   - Autores
   - Categorías (si existen)
   - Editoriales (si existen)
   - Libros con sus relaciones
   - Sagas con sus libros asociados

2. 📝 **Genera** un nuevo archivo `seed-sagas.ts` con:
   - Interfaces TypeScript correctas
   - Datos formateados como código
   - Validaciones para arrays vacíos
   - Búsqueda por `externalId` (portable entre ambientes)

### Cómo ejecutar

```bash
cd Backend && npx ts-node export-sagas.ts
```

### Salida esperada

```
📦 Exportando datos de la base de datos...

✅ Encontrados 11 autores
✅ Encontrados 0 categorías
✅ Encontrados 0 editoriales
✅ Encontrados 39 libros
✅ Encontrados 9 sagas

✅ Archivo seed-sagas.ts generado exitosamente!

📊 Resumen:
   - 11 autores
   - 0 categorías
   - 0 editoriales
   - 39 libros
   - 9 sagas

✨ Puedes ejecutar el nuevo seed con: cd backend && npx ts-node seed-sagas.ts
```

### ⚠️ Importante

- ✅ **Sobrescribe** el archivo `seed-sagas.ts` existente
- ✅ **No modifica** la base de datos, solo lee
- ✅ Requiere que `.env` esté configurado correctamente

---

## 📥 seed-sagas.ts

### ¿Cuándo usar?

✅ **Nueva instalación** del proyecto  
✅ **Ambiente de desarrollo** limpio  
✅ **Testing** con datos consistentes  
✅ **Recuperar datos** después de limpiar BD  
✅ **Poblar BD** en producción inicial  

### ¿Qué hace?

1. 📝 **Crea Autores** (si no existen)
   - Busca por nombre + apellido
   - Solo crea si no está duplicado

2. 📝 **Crea Categorías** (si hay en el seed)
   - Busca por nombre
   - Salta si está vacío

3. 📝 **Crea Editoriales** (si hay en el seed)
   - Busca por nombre
   - Salta si está vacío

4. 📚 **Crea Libros** (si no existen)
   - Busca por `externalId` ⭐ (importante)
   - Asocia con autor, categoría, editorial

5. 🎭 **Crea Sagas** (si no existen)
   - Busca por nombre
   - Asocia libros usando `externalId` ⭐

### Cómo ejecutar

```bash
cd Backend && npx ts-node seed-sagas.ts
```

### Salida esperada

```
Creando sagas de master data...
Creando autores...
Autor creado: Rebecca Yarros
Autor creado: Eva García Sáenz de Urturi
...
No hay categorías para crear.
No hay editoriales para crear.
Creando libros...
Libro creado: Alas de sangre (Empíreo 1)
Libro creado: Alas de hierro (Empíreo 2)
...
Creando sagas y asociando libros...
Saga creada: Serie Empíreo
Asociando 3 libros a la saga: Serie Empíreo
  ✅ Libro "Alas de sangre (Empíreo 1)" asociado a saga "Serie Empíreo"
  ✅ Libro "Alas de hierro (Empíreo 2)" asociado a saga "Serie Empíreo"
  ✅ Libro "Alas de ónix (Empíreo 3)" asociado a saga "Serie Empíreo"
Saga "Serie Empíreo" completada con sus libros
...
Master data creado exitosamente!
```

### ⚠️ Importante

- ✅ **Idempotente**: Puedes ejecutarlo varias veces sin duplicar
- ✅ **Portable**: Funciona en cualquier ambiente (usa `externalId`)
- ✅ **Seguro**: No borra datos, solo agrega si no existen
- ⚠️ **Requiere libros primero**: Si no existen libros con esos `externalId`, no asociará a sagas

---

## 💡 Casos de Uso

### Caso 1: Agregar nuevas sagas manualmente

```bash
# 1. Agregar sagas manualmente en la BD (phpMyAdmin, MySQL Workbench, etc.)
# 2. Exportar para generar nuevo seed
npx ts-node export-sagas.ts

# 3. Revisar que seed-sagas.ts tenga los nuevos datos
# 4. Opcional: Ejecutar en otro ambiente
npx ts-node seed-sagas.ts
```

### Caso 2: Setup de nuevo ambiente

```bash
# 1. Clonar repo
git clone ...

# 2. Instalar dependencias
cd Backend
npm install

# 3. Configurar .env con DB vacía
# DB_HOST=localhost
# DB_NAME=tpdsw

# 4. Ejecutar migraciones
npx mikro-orm migration:up

# 5. Cargar datos de sagas
npx ts-node seed-sagas.ts

# ✅ Listo! Tienes BD con sagas
```

### Caso 3: Backup de datos

```bash
# Exportar estado actual como backup
npx ts-node export-sagas.ts

# Copiar seed-sagas.ts a carpeta de backups
cp seed-sagas.ts ../backups/seed-sagas-2025-11-04.ts
```

### Caso 4: Testing

```bash
# 1. Limpiar sagas de BD
# DELETE FROM libro WHERE saga_id IS NOT NULL;
# DELETE FROM saga;

# 2. Recargar datos limpios
npx ts-node seed-sagas.ts

# 3. Ejecutar tests
npm test
```

---

## 🔧 Troubleshooting

### ❌ Error: "Cannot find module"

**Causa**: No estás en el directorio correcto

**Solución**:
```bash
cd Backend
npx ts-node export-sagas.ts
```

---

### ❌ Error: "Connection refused" / "ER_ACCESS_DENIED"

**Causa**: Configuración de `.env` incorrecta

**Solución**:
```bash
# Verificar .env
cat ../.env

# Debe tener:
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tpdsw
DB_USER=tpdsw_user
DB_PASSWORD=tu_password
```

---

### ❌ Error: "Libro con externalId XXX no encontrado"

**Causa**: El libro no existe en la BD

**Solución 1**: Ejecutar seed completo de libros primero
```bash
# Si tienes otro seed de libros
npx ts-node seed-libros.ts
npx ts-node seed-sagas.ts
```

**Solución 2**: Exportar de nuevo desde BD actual
```bash
npx ts-node export-sagas.ts
```

---

### ❌ Los libros se asocian a sagas incorrectas

**Causa**: IDs hardcodeados en lugar de externalId

**Solución**: Regenerar seed con export-sagas.ts
```bash
npx ts-node export-sagas.ts
# Esto generará un seed que usa externalId
```

---

### ⚠️ Warning: "Saga creada pero sin libros asociados"

**Causa**: Los libros no existen o tienen externalId diferente

**Solución**:
```bash
# 1. Verificar que libros existan
# SELECT * FROM libro WHERE external_id = 'OJjkEAAAQBAJ';

# 2. Si no existen, cargar libros primero
# 3. Luego ejecutar seed de sagas
```

---

## 📊 Estructura de Datos

### masterData Format

```typescript
{
  autores: [
    {
      id: 1,
      nombre: "Rebecca",
      apellido: "Yarros",
      createdAt: Date
    }
  ],
  categorias: [...], // Puede estar vacío
  editoriales: [...], // Puede estar vacío
  libros: [
    {
      id: 1,
      nombre: "Alas de sangre",
      externalId: "6PjIEAAAQBAJ", // ⭐ Clave única
      autorId: 1,
      // ... más campos
    }
  ],
  sagas: [
    {
      id: 1,
      nombre: "Serie Empíreo",
      libroExternalIds: [ // ⭐ Usa externalId, no id
        "6PjIEAAAQBAJ",
        "OJjkEAAAQBAJ",
        "VpQnEQAAQBAJ"
      ],
      createdAt: Date
    }
  ]
}
```

---

## ✅ Checklist Pre-Ejecución

### Antes de exportar (export-sagas.ts):

- [ ] ✅ BD tiene datos actualizados
- [ ] ✅ Sagas están correctamente asociadas a libros
- [ ] ✅ `.env` configurado correctamente
- [ ] ✅ Conexión a BD funciona

### Antes de importar (seed-sagas.ts):

- [ ] ✅ `.env` configurado para el ambiente destino
- [ ] ✅ Migraciones ejecutadas (`npx mikro-orm migration:up`)
- [ ] ✅ Libros cargados (si no, se saltarán asociaciones)
- [ ] ✅ Backup de BD (opcional pero recomendado)

---

## 🎓 Tips y Best Practices

### ✅ DO (Hacer)

1. **Exportar después de cambios manuales**
   ```bash
   # Después de agregar sagas en BD
   npx ts-node export-sagas.ts
   git add seed-sagas.ts
   git commit -m "Update sagas seed with new data"
   ```

2. **Usar externalId para búsquedas**
   - Es único y portable entre ambientes
   - No depende de auto-increment

3. **Hacer backups periódicos**
   ```bash
   npx ts-node export-sagas.ts
   cp seed-sagas.ts backups/seed-$(date +%Y%m%d).ts
   ```

4. **Verificar datos después de seed**
   ```sql
   -- Verificar sagas creadas
   SELECT * FROM saga;
   
   -- Verificar libros asociados
   SELECT l.nombre, s.nombre as saga 
   FROM libro l 
   LEFT JOIN saga s ON l.saga_id = s.id;
   ```

### ❌ DON'T (No hacer)

1. **No editar seed-sagas.ts manualmente**
   - Usa export-sagas.ts para regenerarlo

2. **No usar IDs hardcodeados**
   - Siempre usa `externalId` para libros

3. **No ejecutar sin backup en producción**
   ```bash
   # MAL ❌
   npx ts-node seed-sagas.ts
   
   # BIEN ✅
   mysqldump -u user -p database > backup.sql
   npx ts-node seed-sagas.ts
   ```

4. **No asumir que todos los libros existen**
   - Verifica logs para warnings de libros no encontrados

---

## 📞 Soporte

Si encuentras problemas:

1. 🔍 **Revisa logs** de consola
2. 🗄️ **Verifica estado de BD** con queries SQL
3. 📝 **Compara masterData** con datos reales en BD
4. 🔄 **Regenera seed** con export-sagas.ts

---

**Última actualización**: 4 de noviembre de 2025  
**Versión**: 1.0  
**Autor**: Sistema de Migración BookCode
