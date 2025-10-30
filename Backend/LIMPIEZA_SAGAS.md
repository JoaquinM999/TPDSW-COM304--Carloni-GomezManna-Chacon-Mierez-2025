# Limpieza de Datos de Saga

**Fecha:** 30 de octubre de 2025

## 🎯 Objetivo

Eliminar todos los datos relacionados con sagas de la base de datos, incluyendo las referencias desde la tabla `libro`.

## 📋 Cambios Realizados

### 1. Script de Limpieza (`Backend/delete-example-sagas.ts`)
- Busca y elimina sagas que contengan palabras clave: "ejemplo", "Saga A", "Saga B", "clásicas"
- Búsqueda case-insensitive con múltiples variantes
- Muestra lista antes de eliminar para confirmación

**Uso:**
```bash
cd Backend
npx ts-node delete-example-sagas.ts
```

### 2. Migración de Limpieza (`Migration20251030000000_clean_saga_data.ts`)

**SQL ejecutado:**
```sql
-- 1. Desvincular todos los libros de sus sagas
UPDATE libro SET saga_id = NULL WHERE saga_id IS NOT NULL;

-- 2. Eliminar todas las sagas
DELETE FROM saga;

-- 3. Resetear el auto_increment
ALTER TABLE saga AUTO_INCREMENT = 1;
```

## ✅ Resultados

### Verificación Post-Limpieza
```bash
mysql -u root -p tpdsw -e "
  SELECT COUNT(*) as total_sagas FROM saga;
  SELECT COUNT(*) as libros_con_saga FROM libro WHERE saga_id IS NOT NULL;
"
```

**Resultado:**
- ✅ **0 sagas** en la tabla `saga`
- ✅ **0 libros** vinculados a sagas (todos tienen `saga_id = NULL`)

## 🔄 Estructura de Datos

### Relación Actual
```
Saga (1) ←── (N) Libro
```

- Un libro puede pertenecer a **una saga** (o ninguna)
- Una saga puede tener **múltiples libros**
- Relación: `ManyToOne` desde Libro hacia Saga

### Tablas Afectadas
1. **`saga`** - Completamente limpia, auto_increment reseteado a 1
2. **`libro`** - Campo `saga_id` puesto en NULL para todos los registros

## 📝 Notas Importantes

⚠️ **Esta operación es IRREVERSIBLE**
- No existe rollback para datos eliminados
- Respaldo de la base de datos recomendado antes de ejecutar

🔒 **Integridad Referencial**
- Las foreign keys permiten NULL, por lo que no hay conflictos
- Los libros siguen existiendo, solo pierden su asociación con sagas

## 🚀 Próximos Pasos

Si necesitas crear nuevas sagas:

```bash
# Usando el script seed
cd Backend
ts-node src/seed-sagas.ts "Nombre de la Saga" "query para buscar libros"

# Ejemplo:
ts-node src/seed-sagas.ts "Harry Potter" "Harry Potter"
```

## 📊 Commits Relacionados

1. **609424d** - Script de eliminación de sagas de ejemplo
2. **ea8b518** - Migración de limpieza de datos de saga

---

**Ejecutado por:** Sistema de migración MikroORM  
**Estado:** ✅ Completado exitosamente
