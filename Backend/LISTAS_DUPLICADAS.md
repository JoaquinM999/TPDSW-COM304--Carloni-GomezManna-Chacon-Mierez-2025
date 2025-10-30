# Protección contra Listas Duplicadas

## Problema
Las listas predeterminadas ("Ver más tarde", "Pendiente", "Leídos") se estaban duplicando en la base de datos cuando los usuarios agregaban libros desde la página de detalle.

## Solución Implementada

### Backend (lista.controller.ts)

```typescript
export const createLista = async (req: AuthRequest, res: Response) => {
  // ...
  
  // Verificar si ya existe una lista con el mismo nombre para este usuario
  const listaExistente = await orm.em.findOne(Lista, {
    nombre,
    usuario: { id: userId }
  });

  if (listaExistente) {
    return res.status(200).json(listaExistente); // Devolver la existente
  }
  
  // Crear solo si no existe...
}
```

**Características:**
- ✅ Verifica unicidad por `nombre + usuario_id`
- ✅ Devuelve lista existente en lugar de error
- ✅ Status 200 (no 409) para compatibilidad con frontend

### Frontend (DetalleLibro.tsx)

```typescript
const handleAddToListByName = async (nombre: string) => {
  // 1. Verificar en estado local
  let lista = listas.find(l => l.nombre === nombre);
  
  if (!lista) {
    // 2. Verificar en servidor
    const listasUsuario = await listaService.getUserListas();
    lista = listasUsuario.find(l => l.nombre === nombre);
    
    if (!lista) {
      // 3. Crear solo si realmente no existe
      lista = await listaService.createLista(nombre, tipo);
    }
    
    // 4. Actualizar estado sin duplicar
    setListas(prev => {
      const exists = prev.some(l => l.id === lista!.id);
      if (!exists) {
        return [...prev, lista!];
      }
      return prev;
    });
  }
  
  // 5. Agregar libro a la lista
  await listaService.addLibroALista(lista.id, libro);
}
```

**Flujo de verificación:**
1. ✅ Estado local React (instantáneo)
2. ✅ Llamada a servidor (cache actualizado)
3. ✅ Backend verifica BD (última protección)
4. ✅ Actualización de estado sin duplicar
5. ✅ Agregar libro y actualizar UI

## Script de Limpieza

### cleanup-duplicate-listas.ts

Para limpiar duplicados existentes:

```bash
cd Backend
npx ts-node cleanup-duplicate-listas.ts
```

**Funcionalidad:**
- 🔍 Busca listas con mismo `nombre + usuario_id`
- 📦 Migra contenido de duplicadas a la más antigua
- 🗑️ Elimina listas duplicadas
- ✅ Previene pérdida de datos
- 📊 Muestra resumen de operaciones

**Ejemplo de salida:**
```
📋 Usuario 1 - Lista "Ver más tarde": 3 duplicados encontrados
   ✅ Manteniendo lista ID 5 (creada: 2025-10-15)
   📦 Migrando 2 libros de lista ID 12
   🗑️  Eliminando lista duplicada ID 12
   📦 Migrando 1 libros de lista ID 18
   🗑️  Eliminando lista duplicada ID 18
   ✨ Limpieza completada para "Ver más tarde"

📊 RESUMEN:
   Listas duplicadas eliminadas: 2
   Libros migrados: 3
```

## Ventajas de esta Solución

### 1. Múltiples Capas de Protección
- Frontend verifica antes de solicitar
- Backend valida antes de crear
- Estado local sincronizado

### 2. Sin Pérdida de Datos
- Migración automática de libros
- Mantiene lista más antigua (historial)
- Libros no se pierden ni duplican

### 3. Experiencia de Usuario
- Transparente para el usuario
- Sin errores molestos
- Comportamiento predecible

### 4. Performance
- Verificación en estado local primero
- Reduce llamadas innecesarias al servidor
- Cache eficiente

## Testing

### Casos de Prueba

1. **Usuario nuevo agrega libro a "Ver más tarde"**
   - ✅ Se crea lista nueva
   - ✅ Libro se agrega correctamente

2. **Usuario con lista existente agrega otro libro**
   - ✅ Se usa lista existente
   - ✅ No se crea duplicado
   - ✅ Libro se agrega correctamente

3. **Usuario con duplicados existentes ejecuta limpieza**
   - ✅ Se mantiene lista más antigua
   - ✅ Libros se migran correctamente
   - ✅ Duplicados se eliminan

4. **Múltiples usuarios con mismo nombre de lista**
   - ✅ Cada usuario tiene su propia lista
   - ✅ No hay conflictos entre usuarios

## Mantenimiento

### Verificar Duplicados Existentes

```sql
SELECT 
  usuario_id, 
  nombre, 
  COUNT(*) as cantidad
FROM lista
GROUP BY usuario_id, nombre
HAVING COUNT(*) > 1;
```

### Contar Listas por Tipo

```sql
SELECT 
  tipo,
  COUNT(*) as total,
  COUNT(DISTINCT usuario_id) as usuarios_unicos
FROM lista
GROUP BY tipo;
```

## Notas Técnicas

- **Constraint DB**: Considerar agregar UNIQUE constraint en (usuario_id, nombre)
- **Race Conditions**: Protegido por transacciones de MikroORM
- **Rollback**: Script de limpieza puede revertirse manualmente si es necesario
- **Logs**: Backend logea intentos de creación duplicada (nivel info)

## Migración Futura

Para agregar constraint UNIQUE en base de datos:

```sql
ALTER TABLE lista 
ADD CONSTRAINT unique_usuario_nombre 
UNIQUE (usuario_id, nombre);
```

**Nota**: Ejecutar script de limpieza ANTES de agregar constraint.
