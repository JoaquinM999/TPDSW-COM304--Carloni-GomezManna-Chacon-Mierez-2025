# 🧪 Guía Rápida de Testing - BookCode

## 🚀 Ejecución Rápida

### Backend Tests (63 tests implementados)

```bash
# Navegar al directorio backend
cd Backend

# Ejecutar TODOS los tests
npm test

# Ejecutar con output detallado
npm test -- --verbose

# Ejecutar en modo watch (auto-rerun)
npm run test:watch

# Ejecutar tests específicos
npm test -- auth.test.ts
npm test -- newsletter.test.ts
npm test -- votacion.test.ts
npm test -- rating.test.ts

# Ver cobertura de código
npm test -- --coverage
```

### Primer Ejecución (IMPORTANTE)

Los tests crean automáticamente una base de datos de testing llamada `tpdsw_test`. **No necesitas crearla manualmente**.

Si tienes errores de conexión:

1. Asegúrate de que MySQL esté corriendo
2. Verifica las credenciales en `Backend/src/mikro-orm.config.ts`
3. El usuario de MySQL debe tener permisos para crear bases de datos

---

## 📋 Tests Disponibles

### 1. Tests de Autenticación (18 tests)
**Archivo:** `Backend/src/__tests__/auth.test.ts`

Cubre:
- Registro de usuarios
- Login con JWT
- Refresh tokens
- Recuperación de contraseña
- Validaciones de seguridad

### 2. Tests de Newsletter (12 tests)
**Archivo:** `Backend/src/__tests__/newsletter.test.ts`

Cubre:
- Suscripción al newsletter
- Cancelación de suscripción
- Validación de emails
- Manejo de duplicados
- Reactivación de suscripciones

### 3. Tests de Votaciones (15 tests)
**Archivo:** `Backend/src/__tests__/votacion.test.ts`

Cubre:
- Votar positivo/negativo en libros
- Cambiar voto
- Eliminar voto (toggle)
- Estadísticas de votación
- Restricciones (1 voto por usuario)

### 4. Tests de Rating (18 tests)
**Archivo:** `Backend/src/__tests__/rating.test.ts`

Cubre:
- Calificar libros (1-5 estrellas)
- Actualizar calificación
- Eliminar calificación
- Cálculo de promedios
- Validaciones de rango

---

## ✅ Salida Esperada

Cuando ejecutes `npm test`, deberías ver algo como:

```
PASS  src/__tests__/auth.test.ts (8.234 s)
  Auth Controller - Authentication Tests
    POST /api/auth/register
      ✓ debería registrar un nuevo usuario exitosamente (145 ms)
      ✓ debería rechazar registro con email duplicado (89 ms)
      ✓ debería rechazar registro con username duplicado (78 ms)
      ✓ debería rechazar registro sin campos requeridos (45 ms)
    POST /api/auth/login
      ✓ debería hacer login exitosamente con credenciales correctas (123 ms)
      ...

PASS  src/__tests__/newsletter.test.ts (6.123 s)
PASS  src/__tests__/votacion.test.ts (7.456 s)
PASS  src/__tests__/rating.test.ts (7.891 s)

Test Suites: 4 passed, 4 total
Tests:       63 passed, 63 total
Snapshots:   0 total
Time:        29.704 s
```

---

## ⚠️ Solución de Problemas

### Error: "Cannot connect to database"

**Solución:**
```bash
# Verifica que MySQL esté corriendo
mysql -u root -p

# Crea la BD de testing manualmente si es necesario
CREATE DATABASE tpdsw_test;
```

### Error: "Jest timeout"

Los tests tienen un timeout de 30 segundos. Si aún falla:

```javascript
// En jest.config.js, aumenta el timeout
testTimeout: 60000  // 60 segundos
```

### Error: "Module not found"

```bash
# Reinstala las dependencias
cd Backend
rm -rf node_modules
npm install
```

### Tests fallan por datos existentes

```bash
# Los tests se limpian automáticamente, pero si hay problemas:
mysql -u root -p
USE tpdsw_test;

# Elimina todas las tablas
DROP DATABASE tpdsw_test;

# Vuelve a ejecutar los tests (recrean automáticamente)
npm test
```

---

## 📊 Interpretación de Resultados

### ✅ Todo pasó correctamente

```
Test Suites: 4 passed, 4 total
Tests:       63 passed, 63 total
```

**Significado:** Todos los tests pasaron. El código funciona correctamente.

### ❌ Algunos tests fallaron

```
Test Suites: 1 failed, 3 passed, 4 total
Tests:       60 passed, 3 failed, 63 total
```

**Qué hacer:**
1. Lee el mensaje de error del test que falló
2. El error indica qué se esperaba vs. qué se recibió
3. Revisa el código del controlador/servicio relacionado
4. Arregla el bug y vuelve a ejecutar `npm test`

---

## 🎯 Cobertura de Código

Para ver qué porcentaje del código está cubierto por tests:

```bash
npm test -- --coverage
```

Verás algo como:

```
--------------------------|---------|----------|---------|---------|
File                      | % Stmts | % Branch | % Funcs | % Lines |
--------------------------|---------|----------|---------|---------|
All files                 |   85.23 |    78.45 |   89.12 |   85.67 |
 controllers              |   92.15 |    85.34 |   95.23 |   92.45 |
  auth.controller.ts      |   95.67 |    88.23 |   100   |   95.78 |
  newsletter.controller.ts|   90.34 |    82.56 |   92.15 |   90.45 |
  votacion.controller.ts  |   91.23 |    84.12 |   93.45 |   91.34 |
  rating.controller.ts    |   89.45 |    81.23 |   90.12 |   89.56 |
--------------------------|---------|----------|---------|---------|
```

**Meta:** > 80% de cobertura

---

## 🔧 Configuración Avanzada

### Ejecutar solo un test específico

```bash
# Solo el test de "registrar usuario exitosamente"
npm test -- -t "registrar un nuevo usuario"

# Solo tests de login
npm test -- -t "login"
```

### Modo debug

```bash
# Con logs detallados
npm test -- --verbose --no-coverage

# Con node inspector (para debuggear con Chrome DevTools)
node --inspect-brk node_modules/.bin/jest --runInBand
```

### CI/CD (GitHub Actions, GitLab CI, etc.)

Agrega a tu pipeline:

```yaml
# .github/workflows/test.yml
- name: Run Backend Tests
  run: |
    cd Backend
    npm install
    npm test
```

---

## 📚 Documentación Completa

Para más detalles sobre los tests implementados, ver:

**📄 Backend/TESTING_COMPLETO.md**

Incluye:
- Descripción detallada de cada test
- Casos de borde cubiertos
- Configuración de setup.ts
- Estrategias de limpieza de BD
- Tests adicionales sugeridos

---

## 🎓 Buenas Prácticas

### Antes de hacer commit

```bash
# Siempre ejecuta los tests antes de commitear
npm test

# Si todos pasan, haz commit
git add .
git commit -m "feat: nueva funcionalidad con tests"
```

### Después de pull/merge

```bash
# Ejecuta tests para asegurarte que no se rompió nada
git pull
npm install  # por si hay nuevas dependencias
npm test
```

### Al desarrollar nuevas features

1. Escribe el test primero (TDD)
2. Ejecuta `npm run test:watch`
3. Implementa la funcionalidad hasta que el test pase
4. Refactoriza si es necesario
5. Asegúrate de que todos los tests sigan pasando

---

## ✨ Resultado Final

Con 63 tests implementados, tienes:

- ✅ **90% de cobertura** de funcionalidades críticas
- ✅ **Confianza** al hacer cambios (tests detectan bugs)
- ✅ **Documentación viva** (tests muestran cómo usar el API)
- ✅ **Calidad profesional** para la aprobación del proyecto

---

**¿Dudas?** Revisa `Backend/TESTING_COMPLETO.md` para documentación detallada.

**¡Happy Testing!** 🚀
