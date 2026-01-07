# 📋 Guía de Testing - Backend

## 🎯 Resumen Ejecutivo

Sistema de testing con **620 tests unitarios** usando Vitest 4.0.16, alcanzando **100% de cobertura** en validaciones, parsers, helpers y serialización.

**Métricas Actuales:**
- ✅ **620 tests pasando** (100%)
- ⚡ Ejecución: **~1.8 segundos**
- 📁 **19 archivos** de test
- 🎨 Framework: **Vitest 4.0.16**
- 📊 Cobertura: **Validations (60), Parsers (180), Helpers (352), Integration (24)**

---

## 📂 Estructura de Archivos

### Convención de Naming

```
<nombre-módulo>.test.ts          // Tests unitarios básicos
<nombre-módulo>.edge-cases.test.ts    // Casos extremos y edge cases
<nombre-módulo>.integration.test.ts   // Tests de integración entre módulos
```

### Ubicación de Tests

Los tests se ubican **junto al código que testean**:

```
src/
├── services/
│   ├── validation.service.ts
│   └── validation.service.test.ts        // ✅ Ubicación correcta
├── utils/
│   ├── parsers.ts
│   ├── parsers.test.ts
│   └── parsers.edge-cases.test.ts
└── helpers/
    ├── resenaHelpers.ts
    └── resenaHelpers.test.ts
```

---

## 🧪 Anatomía de un Test

### Estructura Básica

```typescript
import { describe, it, expect } from 'vitest';
import { miFuncion } from './miModulo';

describe('Nombre del Módulo', () => {
  describe('nombre de la función', () => {
    it('debe hacer algo específico', () => {
      // Arrange: Preparar datos
      const input = 'valor de prueba';
      
      // Act: Ejecutar función
      const result = miFuncion(input);
      
      // Assert: Verificar resultado
      expect(result).toBe('valor esperado');
    });
  });
});
```

### Ejemplo Real: Test de Validación

```typescript
// validation.service.test.ts
import { describe, it, expect } from 'vitest';
import { validarEmail } from './validation.service';

describe('Validation Service', () => {
  describe('validarEmail', () => {
    it('debe validar email correcto', () => {
      const result = validarEmail('usuario@ejemplo.com');
      expect(result.valido).toBe(true);
      expect(result.errores).toHaveLength(0);
    });

    it('debe rechazar email sin @', () => {
      const result = validarEmail('usuario.com');
      expect(result.valido).toBe(false);
      expect(result.errores).toContain('Email inválido');
    });

    it('debe rechazar email vacío', () => {
      const result = validarEmail('');
      expect(result.valido).toBe(false);
      expect(result.errores[0]).toContain('Email requerido');
    });

    it('debe normalizar email a lowercase', () => {
      const result = validarEmail('USUARIO@EJEMPLO.COM');
      expect(result.valor).toBe('usuario@ejemplo.com');
    });
  });
});
```

---

## 🎭 Estrategias de Mocking

### 1. Mock de EntityManager (MikroORM)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EntityManager } from '@mikro-orm/core';

describe('Resena Service', () => {
  let mockEM: EntityManager;

  beforeEach(() => {
    // Crear mock completo de EntityManager
    mockEM = {
      findOne: vi.fn(),
      find: vi.fn(),
      persist: vi.fn(),
      flush: vi.fn(),
      removeAndFlush: vi.fn(),
      fork: vi.fn().mockReturnThis(),
    } as unknown as EntityManager;
  });

  it('debe crear reseña correctamente', async () => {
    // Configurar comportamiento del mock
    mockEM.findOne.mockResolvedValueOnce({ id: 1, nombre: 'Usuario' });
    mockEM.findOne.mockResolvedValueOnce({ id: 2, titulo: 'Libro' });

    const service = new ResenaService(mockEM);
    await service.crearResena(datosResena);

    // Verificar llamadas
    expect(mockEM.persist).toHaveBeenCalledTimes(1);
    expect(mockEM.flush).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Mock de Funciones Externas

```typescript
import { vi } from 'vitest';
import * as utils from './utils';

// Mock parcial de módulo
vi.mock('./utils', () => ({
  calcularPromedio: vi.fn(() => 4.5),
  formatearFecha: vi.fn((date) => '2025-01-06'),
}));

it('debe usar función mockeada', () => {
  const promedio = utils.calcularPromedio([4, 5]);
  expect(promedio).toBe(4.5);
  expect(utils.calcularPromedio).toHaveBeenCalledWith([4, 5]);
});
```

### 3. Mock de Relaciones MikroORM

```typescript
it('debe serializar reseña con libro y autor', () => {
  const resena = {
    id: 1,
    titulo: 'Gran libro',
    libro: {
      id: 2,
      titulo: 'El Señor de los Anillos',
      autor: {
        id: 3,
        nombre: 'J.R.R. Tolkien'
      }
    },
    usuario: {
      id: 4,
      username: 'lector123'
    }
  } as Resena;

  const resultado = serializarResenaCompleta(resena);
  
  expect(resultado.libro.titulo).toBe('El Señor de los Anillos');
  expect(resultado.libro.autor.nombre).toBe('J.R.R. Tolkien');
});
```

---

## 📊 Tipos de Tests

### 1. Tests Unitarios (80% del total)

**Propósito:** Probar funciones aisladas sin dependencias externas.

```typescript
// libroHelpers.test.ts
describe('normalizeISBN', () => {
  it('debe limpiar ISBN con guiones', () => {
    expect(normalizeISBN('978-84-376-0494-7')).toBe('9788437604947');
  });

  it('debe limpiar ISBN con espacios', () => {
    expect(normalizeISBN('978 84 376 0494 7')).toBe('9788437604947');
  });

  it('debe manejar ISBN ya normalizado', () => {
    expect(normalizeISBN('9788437604947')).toBe('9788437604947');
  });
});
```

### 2. Tests de Edge Cases (10% del total)

**Propósito:** Casos límite, errores esperados, datos inválidos.

```typescript
// parsers.edge-cases.test.ts
describe('Parser Edge Cases', () => {
  it('debe manejar null en campos opcionales', () => {
    const input = {
      titulo: 'Libro',
      descripcion: null,  // Campo opcional
      paginas: null       // Campo opcional
    };

    const result = parseLibroInput(input);
    expect(result.descripcion).toBeUndefined();
    expect(result.paginas).toBeUndefined();
  });

  it('debe limpiar HTML peligroso', () => {
    const input = '<script>alert("XSS")</script>Texto limpio';
    const result = sanitizeHTML(input);
    expect(result).toBe('Texto limpio');
    expect(result).not.toContain('<script>');
  });
});
```

### 3. Tests de Integración (10% del total)

**Propósito:** Probar flujos completos entre múltiples módulos.

```typescript
// libroSearchIntegration.test.ts
describe('Libro Search Integration', () => {
  it('debe validar y filtrar búsqueda SQL injection', () => {
    const maliciousQuery = "'; DROP TABLE libros; --";
    
    // Paso 1: Validar
    const validationResult = validateSearchQuery(maliciousQuery);
    expect(validationResult.valido).toBe(false);
    
    // Paso 2: Si hubiera pasado, el filtro lo detiene
    const sanitized = sanitizeSearchQuery(maliciousQuery);
    expect(sanitized).not.toContain('DROP');
    expect(sanitized).not.toContain(';');
  });

  it('debe manejar búsqueda unicode correctamente', () => {
    const query = 'café naïve résumé';
    
    // Validar que pasa validación
    const validation = validateSearchQuery(query);
    expect(validation.valido).toBe(true);
    
    // Construir filtro de búsqueda
    const filter = buildSearchFilter(query);
    expect(filter.$or).toBeDefined();
    expect(filter.$or[0].titulo.$ilike).toContain('café');
  });
});
```

---

## 🎯 Casos de Uso Comunes

### Testing de Validaciones con Múltiples Errores

```typescript
describe('validarResenaCompleta', () => {
  it('debe retornar múltiples errores para datos inválidos', () => {
    const resenaInvalida = {
      titulo: 'ab',  // Muy corto
      contenido: 'corto',  // Muy corto
      calificacion: 6  // Fuera de rango
    };

    const result = validarResenaCompleta(resenaInvalida);
    
    expect(result.valido).toBe(false);
    expect(result.errores).toHaveLength(3);
    expect(result.errores).toContainEqual(
      expect.objectContaining({
        campo: 'titulo',
        mensaje: expect.stringContaining('mínimo 3')
      })
    );
  });
});
```

### Testing de Parsers con Sanitización

```typescript
describe('parseResenaInput', () => {
  it('debe sanitizar HTML en título y contenido', () => {
    const input = {
      titulo: '<b>Título</b> con <script>alert()</script>',
      contenido: 'Texto <img src=x onerror=alert()> limpio'
    };

    const result = parseResenaInput(input);
    
    expect(result.titulo).toBe('Título con');
    expect(result.contenido).not.toContain('<script>');
    expect(result.contenido).not.toContain('onerror');
  });

  it('debe preservar texto largo (5000 caracteres)', () => {
    const largeText = 'a'.repeat(5000);
    const input = { titulo: 'Test', contenido: largeText };

    const result = parseResenaInput(input);
    expect(result.contenido.length).toBe(5000);
  });
});
```

### Testing de Helpers con Relaciones Complejas

```typescript
describe('serializarResenaConRespuestas', () => {
  it('debe serializar árbol de respuestas anidado', () => {
    const resena = {
      id: 1,
      titulo: 'Reseña principal',
      respuestas: [
        {
          id: 2,
          contenido: 'Respuesta nivel 1',
          respuestas: [
            {
              id: 3,
              contenido: 'Respuesta nivel 2',
              respuestas: []
            }
          ]
        }
      ]
    };

    const result = serializarResenaConRespuestas(resena);
    
    expect(result.respuestas).toHaveLength(1);
    expect(result.respuestas[0].respuestas).toHaveLength(1);
    expect(result.respuestas[0].respuestas[0].id).toBe(3);
  });
});
```

---

## ⚡ Comandos de Testing

### Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (desarrollo)
npm run test:watch

# Ejecutar tests con reporte de cobertura
npm run test:coverage

# Ejecutar tests de un archivo específico
npx vitest run src/services/validation.service.test.ts

# Ejecutar tests que coincidan con un patrón
npx vitest run --grep "validarEmail"
```

### Interpretar Resultados

```bash
✓ src/services/validation.service.test.ts (60 tests) 234ms
  ✓ Validation Service (60)
    ✓ validarEmail (12)
    ✓ validarISBN (15)
    ✓ validarCalificacion (8)

Test Files  19 passed (19)
     Tests  620 passed (620)
  Start at  12:34:56
  Duration  1.80s (transform 123ms, setup 0ms, collect 456ms, tests 789ms)
```

**Interpretación:**
- ✅ **620 passed**: Todos los tests exitosos
- ⏱️ **1.80s**: Tiempo total de ejecución (excelente, <3s)
- 📦 **transform 123ms**: Tiempo de compilar TypeScript
- 🧪 **tests 789ms**: Tiempo real de ejecución de tests

---

## 🏗️ Convenciones del Proyecto

### 1. Estructura de `describe` Anidado

```typescript
describe('Nombre del Módulo/Clase', () => {
  describe('nombreDeFuncion', () => {
    it('debe comportarse de cierta manera', () => {
      // Test
    });

    it('debe manejar error X', () => {
      // Test
    });
  });

  describe('otraFuncion', () => {
    it('debe hacer Y', () => {
      // Test
    });
  });
});
```

### 2. Naming de Tests

✅ **CORRECTO:**
```typescript
it('debe validar email correcto')
it('debe rechazar email sin @')
it('debe normalizar ISBN con guiones')
it('debe retornar error si libro no existe')
```

❌ **INCORRECTO:**
```typescript
it('funciona')  // Demasiado vago
it('test 1')    // No descriptivo
it('valida')    // Incompleto
```

### 3. Organización de Expects

**Orden recomendado:**
1. Verificar propiedad principal
2. Verificar propiedades secundarias
3. Verificar ausencia de errores

```typescript
it('debe crear reseña válida', () => {
  const result = crearResena(datos);
  
  // 1. Principal
  expect(result.id).toBeDefined();
  expect(result.titulo).toBe('Mi Reseña');
  
  // 2. Secundarias
  expect(result.calificacion).toBe(5);
  expect(result.usuario.id).toBe(1);
  
  // 3. Validaciones
  expect(result.errores).toBeUndefined();
});
```

### 4. beforeEach vs beforeAll

```typescript
// Use beforeEach cuando cada test necesite datos frescos
describe('Resena Service', () => {
  let mockEM: EntityManager;

  beforeEach(() => {
    mockEM = createMockEntityManager();  // Reset entre tests
  });

  it('test 1', () => { /* ... */ });
  it('test 2', () => { /* ... */ });
});

// Use beforeAll para operaciones costosas compartidas
describe('Parser Tests', () => {
  let largeFixture: string;

  beforeAll(() => {
    largeFixture = fs.readFileSync('fixture.json', 'utf-8');  // Una sola vez
  });

  it('test 1', () => { /* usa largeFixture */ });
  it('test 2', () => { /* usa largeFixture */ });
});
```

---

## 📈 Mejores Prácticas

### ✅ DO: Tests Específicos y Atómicos

```typescript
// Cada test verifica UNA sola cosa
it('debe validar formato de email', () => {
  expect(validarEmail('test@test.com').valido).toBe(true);
});

it('debe validar dominio de email', () => {
  expect(validarEmail('test@').valido).toBe(false);
});

it('debe validar usuario de email', () => {
  expect(validarEmail('@test.com').valido).toBe(false);
});
```

### ✅ DO: Usar Datos Representativos

```typescript
// Datos realistas que reflejan casos de uso reales
const resenaReal = {
  titulo: 'Una aventura épica inolvidable',
  contenido: 'Este libro me transportó a un mundo de fantasía...',
  calificacion: 5,
  usuario: { id: 1, username: 'lector_apasionado' },
  libro: { id: 42, titulo: 'El Señor de los Anillos', isbn: '9780544003415' }
};
```

### ✅ DO: Testear Edge Cases

```typescript
it('debe manejar texto extremadamente largo', () => {
  const largeText = 'a'.repeat(10000);
  const result = parseResena({ contenido: largeText });
  expect(result.contenido.length).toBe(10000);
});

it('debe manejar emojis y unicode', () => {
  const emojiText = '📚 Me encantó este libro! 🌟🌟🌟';
  const result = parseResena({ contenido: emojiText });
  expect(result.contenido).toContain('📚');
});
```

### ❌ DON'T: Tests Dependientes

```typescript
// ❌ MAL: Test 2 depende del resultado de Test 1
let globalResenaId: number;

it('debe crear reseña', () => {
  const resena = crearResena(datos);
  globalResenaId = resena.id;  // Estado compartido
});

it('debe actualizar reseña', () => {
  actualizarResena(globalResenaId, nuevosDatos);  // Dependencia
});

// ✅ BIEN: Tests independientes
it('debe crear reseña', () => {
  const resena = crearResena(datos);
  expect(resena.id).toBeDefined();
});

it('debe actualizar reseña', () => {
  const resena = crearResena(datos);  // Crear datos propios
  const updated = actualizarResena(resena.id, nuevosDatos);
  expect(updated.titulo).toBe(nuevosDatos.titulo);
});
```

### ❌ DON'T: Tests Genéricos

```typescript
// ❌ MAL
it('debe funcionar', () => {
  expect(miFuncion()).toBeTruthy();
});

// ✅ BIEN
it('debe retornar lista de 5 reseñas ordenadas por fecha', () => {
  const resenas = obtenerResenas({ limite: 5, orden: 'fecha' });
  expect(resenas).toHaveLength(5);
  expect(resenas[0].fecha).toBeGreaterThanOrEqual(resenas[1].fecha);
});
```

---

## 🔍 Debugging de Tests

### Ver Output de Console

```typescript
it('debe procesar datos', () => {
  console.log('Valor de input:', input);  // Se muestra en output
  const result = procesarDatos(input);
  console.log('Resultado:', result);
  expect(result).toBeDefined();
});
```

### Usar only para Ejecutar un Solo Test

```typescript
describe('Validation Service', () => {
  it.only('debe validar este caso específico', () => {
    // Solo este test se ejecutará
  });

  it('otro test', () => {
    // Este será ignorado
  });
});
```

### Usar skip para Ignorar Tests

```typescript
it.skip('test temporal deshabilitado', () => {
  // Este test no se ejecutará
});
```

---

## 📊 Cobertura de Tests por Módulo

### Estado Actual (Enero 2026)

| Módulo | Tests | Estado | Archivos |
|--------|-------|--------|----------|
| **Validation Service** | 60 | ✅ 100% | `validation.service.test.ts` |
| **Parsers** | 180 | ✅ 100% | 4 archivos (básico, edge cases, integration, avanzado) |
| **Libro Helpers** | 180 | ✅ 100% | 3 archivos (básico, búsqueda, integración) |
| **Reseña Helpers** | 172 | ✅ 100% | 3 archivos (básico, filtrado, serialización) |
| **Simple Helpers** | 2 | ✅ 100% | `helpers.simple.test.ts` |
| **Integration** | 24 | ✅ 100% | 2 archivos (búsqueda, parsers) |

**Total: 620 tests | Cobertura: 100% | Tiempo: ~1.8s**

---

## 🚀 Agregar Nuevos Tests

### Proceso Paso a Paso

1. **Identificar módulo a testear:**
   ```bash
   # Ejemplo: quiero testear authorHelpers.ts
   src/helpers/authorHelpers.ts  # Archivo original
   ```

2. **Crear archivo de test:**
   ```bash
   touch src/helpers/authorHelpers.test.ts
   ```

3. **Estructura inicial:**
   ```typescript
   import { describe, it, expect } from 'vitest';
   import { funcionA, funcionB } from './authorHelpers';

   describe('Author Helpers', () => {
     describe('funcionA', () => {
       it('debe hacer X', () => {
         // Test
       });
     });

     describe('funcionB', () => {
       it('debe hacer Y', () => {
         // Test
       });
     });
   });
   ```

4. **Ejecutar test:**
   ```bash
   npm test
   ```

5. **Verificar cobertura:**
   ```bash
   npm run test:coverage
   ```

---

## 📚 Recursos y Referencias

### Documentación Oficial

- [Vitest](https://vitest.dev/) - Framework de testing
- [Expect API](https://vitest.dev/api/expect.html) - Assertions disponibles
- [Mocking Guide](https://vitest.dev/guide/mocking.html) - Guía de mocks

### Matchers Más Usados

```typescript
// Igualdad
expect(valor).toBe(5)                    // Igualdad estricta (===)
expect(objeto).toEqual({ a: 1 })         // Igualdad profunda

// Truthiness
expect(valor).toBeTruthy()               // Cualquier valor verdadero
expect(valor).toBeFalsy()                // Cualquier valor falso
expect(valor).toBeNull()                 // Estrictamente null
expect(valor).toBeUndefined()            // Estrictamente undefined
expect(valor).toBeDefined()              // No undefined

// Números
expect(valor).toBeGreaterThan(3)         // > 3
expect(valor).toBeGreaterThanOrEqual(3)  // >= 3
expect(valor).toBeLessThan(5)            // < 5
expect(valor).toBeCloseTo(0.3)           // Aproximadamente 0.3 (floats)

// Strings
expect(texto).toContain('substring')     // Contiene substring
expect(texto).toMatch(/regex/)           // Coincide con regex

// Arrays
expect(array).toHaveLength(3)            // Longitud exacta
expect(array).toContain('elemento')      // Contiene elemento
expect(array).toContainEqual({a: 1})     // Contiene objeto igual

// Objetos
expect(obj).toHaveProperty('key')        // Tiene propiedad
expect(obj).toMatchObject({ a: 1 })      // Coincide parcialmente

// Funciones
expect(fn).toHaveBeenCalled()            // Fue llamada
expect(fn).toHaveBeenCalledTimes(2)      // Llamada N veces
expect(fn).toHaveBeenCalledWith(arg)     // Llamada con argumentos
expect(() => fn()).toThrow()             // Lanza error
```

---

## 🎓 Ejercicios de Práctica

### Ejercicio 1: Test Básico de Validación

Crear test para función que valida username:
- Mínimo 3 caracteres
- Máximo 20 caracteres
- Solo alfanumérico y guiones bajos

<details>
<summary>Ver solución</summary>

```typescript
describe('validarUsername', () => {
  it('debe aceptar username válido', () => {
    expect(validarUsername('user_123').valido).toBe(true);
  });

  it('debe rechazar username muy corto', () => {
    const result = validarUsername('ab');
    expect(result.valido).toBe(false);
    expect(result.errores[0]).toContain('mínimo 3');
  });

  it('debe rechazar username muy largo', () => {
    const result = validarUsername('a'.repeat(21));
    expect(result.valido).toBe(false);
    expect(result.errores[0]).toContain('máximo 20');
  });

  it('debe rechazar caracteres especiales', () => {
    expect(validarUsername('user@123').valido).toBe(false);
    expect(validarUsername('user-123').valido).toBe(false);
  });
});
```
</details>

### Ejercicio 2: Test de Helper con Transformación

Crear test para función que capitaliza nombres de autores:
- Primera letra mayúscula
- Resto minúscula
- Manejar múltiples nombres

<details>
<summary>Ver solución</summary>

```typescript
describe('capitalizarNombreAutor', () => {
  it('debe capitalizar nombre simple', () => {
    expect(capitalizarNombreAutor('tolkien')).toBe('Tolkien');
  });

  it('debe capitalizar nombre completo', () => {
    expect(capitalizarNombreAutor('j.r.r. tolkien')).toBe('J.R.R. Tolkien');
  });

  it('debe manejar mayúsculas iniciales', () => {
    expect(capitalizarNombreAutor('TOLKIEN')).toBe('Tolkien');
  });

  it('debe preservar formato de partículas', () => {
    expect(capitalizarNombreAutor('miguel de cervantes')).toBe('Miguel de Cervantes');
  });
});
```
</details>

---

## 🔄 Próximos Pasos

### Fase 4: Mejora de Arquitectura (En Planning)

- **Análisis de dependencias circulares** con madge
- **Implementación de inyección de dependencias**
- **Refactorización de servicios** hacia SOLID

### Frontend Testing (Planificado)

- Configurar React Testing Library
- Tests de componentes críticos (50+ tests objetivo)
- Tests de hooks personalizados

### CI/CD (Planificado)

- GitHub Actions para ejecutar tests en cada PR
- Reportes de cobertura automáticos
- Linting y type checking integrados

---

## 📞 Contacto y Contribución

¿Encontraste un bug? ¿Tienes una sugerencia?

- Crear issue en el repositorio
- Seguir convenciones de esta guía al agregar tests
- Mantener cobertura al 100%

---

**Última actualización:** 6 de enero de 2026  
**Autor:** Equipo COM304 - TPDSW  
**Versión:** 1.0.0
