Seed de Sagas

Este script crea sagas de ejemplo y las asocia a libros existentes en la base de datos.

Ubicación: `Backend/seed-sagas.ts`

Requisitos:
- Tener la base de datos configurada y migraciones aplicadas.
- Variables de entorno en `./.env` (misma configuración que la aplicación).
- Compilar TypeScript o usar `ts-node`.

Ejemplos de ejecución:

# Compilar y ejecutar (desde la raíz del proyecto)
npm --prefix Backend run build
node Backend/dist/seed-sagas.js

# O con ts-node (si está instalado)
npx ts-node Backend/seed-sagas.ts

Notas:
- El script evita crear sagas duplicadas por `nombre`.
- Asociará libros si encuentra coincidencias por `nombre` o `externalId`. Si no encuentra libros, creará la saga sin libros y mostrará advertencias.

Si quieres agregar más sagas, edita el arreglo `sagasToCreate` dentro del archivo `Backend/seed-sagas.ts`.
