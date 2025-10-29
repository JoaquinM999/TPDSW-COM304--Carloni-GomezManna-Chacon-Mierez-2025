# Guía de Seed de Sagas

Este script crea datos maestros (autores, libros y sagas) en la base de datos a partir de datos exportados previamente. Las sagas se asocian automáticamente a libros existentes basándose en IDs.

## Ubicación
`Backend/seed-sagas.ts`

## Requisitos Previos
- Base de datos configurada y migraciones aplicadas.
- Variables de entorno configuradas en `../.env` (misma configuración que la aplicación principal).
- Node.js y dependencias instaladas (ejecutar `npm install` en `Backend/` si es necesario).
- TypeScript compilado o `ts-node` instalado para ejecutar archivos `.ts` directamente.

## Pasos para Ejecutar el Seed

### Paso 1: Verificar la Configuración de la Base de Datos
Asegúrate de que la base de datos esté corriendo y las migraciones estén aplicadas. Si no, ejecuta:
```
cd Backend
npm run migration:up
```

### Paso 2: Ejecutar el Script de Seed
Elige uno de los siguientes métodos para ejecutar el script:

#### Opción A: Usando ts-node (Recomendado para desarrollo)
```
cd Backend
npx ts-node seed-sagas.ts
```

#### Opción B: Compilar y Ejecutar
```
cd Backend
npm run build
node dist/seed-sagas.js
```

### Paso 3: Verificar la Ejecución
- El script mostrará logs en la consola indicando el progreso (creando autores, libros, sagas).
- Al finalizar, deberías ver: `Master data creado exitosamente!`
- Si hay errores, revisa los logs para detalles (ej. problemas de conexión a DB).

### Paso 4: Confirmar en la Base de Datos
Opcionalmente, verifica que los datos se hayan insertado correctamente consultando las tablas `autor`, `libro` y `saga` en tu base de datos.

## Notas Importantes
- El script evita crear entidades duplicadas verificando por `nombre` (autores, libros, sagas).
- Los libros se asocian a autores, categorías y editoriales si existen los IDs correspondientes.
- Las sagas se crean con sus libros asociados basándose en `libroIds`.
- Si deseas modificar los datos maestros, edita el objeto `masterData` dentro de `Backend/seed-sagas.ts`.
- El script usa datos exportados de la base de datos existente, por lo que no crea categorías ni editoriales nuevas (arreglos vacíos en `masterData`).

## CÓMO USAR EL SCRIPT DE EXPORTACIÓN (export-sagas-to-seed.ts)

Si deseas exportar sagas existentes de la base de datos para crear un nuevo archivo de seed, usa el script `export-sagas-to-seed.ts`.

### Ubicación
`Backend/export-sagas-to-seed.ts`

### Pasos para Ejecutar la Exportación

#### Paso 1: Asegurarse de que Hay Sagas en la Base de Datos
Verifica que existan sagas creadas en la base de datos. Si no hay sagas, el script no generará nada.

#### Paso 2: Ejecutar el Script de Exportación
```
cd Backend
npx ts-node export-sagas-to-seed.ts
```

#### Paso 3: Verificar la Generación
- El script mostrará logs indicando cuántas sagas encontró y procesó.
- Al finalizar, generará un nuevo archivo `seed-sagas.ts` con los datos exportados.
- El archivo generado sobrescribirá cualquier `seed-sagas.ts` existente.

### Notas sobre la Exportación
- Exporta todas las sagas con sus libros asociados, incluyendo autores, categorías y editoriales relacionadas.
- Los datos se exportan en formato JSON listo para ser usado en el seed.
- Útil para migrar datos entre entornos o crear backups de sagas.

## Solución de Problemas
- **Error de conexión a DB**: Verifica las variables de entorno en `.env` y que la DB esté corriendo.
- **Errores de TypeScript**: Asegúrate de que `ts-node` esté instalado globalmente o usa la opción de compilación.
- **Entidades no creadas**: Revisa que no existan duplicados y que los IDs de libros/autores sean válidos.
- **Exportación vacía**: Verifica que existan sagas en la base de datos antes de ejecutar la exportación.
