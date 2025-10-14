# TODO: Mostrar reseñas PENDING y APPROVED en DetalleLibro

## Información Recopilada
- **Problema**: Las reseñas no aparecen en DetalleLibro hasta publicar una nueva. Después de publicar, aparecen todas (PENDING, APPROVED, REJECTED), pero al recargar solo quedan APPROVED.
- **Causa**: El endpoint `getResenas` filtra solo APPROVED para no-admin cuando no se especifica estado.
- **Objetivo**: Para consultas por `libroId`, mostrar PENDING y APPROVED, ocultar solo REJECTED, para todos los usuarios (autenticados o no).

## Plan
1. Modificar `Backend/src/controllers/resena.controller.ts` en `getResenas`:
   - Si `libroId` está presente y no `estado`, filtrar `estado IN [APPROVED, PENDING]`.
   - Para admin: mostrar todas si no estado.
   - Para no autenticados: mostrar APPROVED y PENDING.
2. Verificar que el frontend maneje correctamente los estados (ya lo hace con badge para pending).
3. Probar: Cargar DetalleLibro, ver reseñas PENDING y APPROVED; recargar página, deberían persistir.

## Archivos a Editar
- `Backend/src/controllers/resena.controller.ts`

## Pasos de Seguimiento
- [] Editar getResenas para ajustar filtro por libroId.
- [] Probar en frontend: Cargar página, ver reseñas; recargar, verificar persistencia.
