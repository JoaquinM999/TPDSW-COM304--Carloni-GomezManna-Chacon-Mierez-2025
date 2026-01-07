# 🔄 Análisis de Dependencias Circulares - Backend

## 📊 Resumen Ejecutivo

**Fecha:** 6 de enero de 2026  
**Herramienta:** madge v8.0.1  
**Archivos analizados:** 159 archivos TypeScript  
**Resultado:** ⚠️ **9 dependencias circulares detectadas**

---

## 🎯 Dependencias Circulares Identificadas

### 1️⃣ `libro.entity.ts` ↔️ `autor.entity.ts`

**Ciclo:**
```
entities/libro.entity.ts → entities/autor.entity.ts → entities/libro.entity.ts
```

**Descripción:**
- `Libro` tiene relación `@ManyToOne` con `Autor`
- `Autor` tiene relación `@OneToMany` con `Libro[]`

**Problema:**
Importaciones cruzadas entre entidades generan acoplamiento fuerte.

**Impacto:** 🟡 Medio

---

### 2️⃣ `libro.entity.ts` ↔️ `categoria.entity.ts`

**Ciclo:**
```
entities/libro.entity.ts → entities/categoria.entity.ts → entities/libro.entity.ts
```

**Descripción:**
- `Libro` tiene relación `@ManyToMany` con `Categoria[]`
- `Categoria` tiene relación inversa con `Libro[]`

**Impacto:** 🟡 Medio

---

### 3️⃣ `libro.entity.ts` ↔️ `contenidoLista.entity.ts`

**Ciclo:**
```
entities/libro.entity.ts → entities/contenidoLista.entity.ts → entities/libro.entity.ts
```

**Descripción:**
- `Libro` referenciado en `ContenidoLista`
- `ContenidoLista` pertenece a listas que contienen libros

**Impacto:** 🟡 Medio

---

### 4️⃣ `contenidoLista.entity.ts` ↔️ `lista.entity.ts`

**Ciclo:**
```
entities/contenidoLista.entity.ts → entities/lista.entity.ts → entities/contenidoLista.entity.ts
```

**Descripción:**
- `ContenidoLista` pertenece a `Lista` (ManyToOne)
- `Lista` tiene múltiples `ContenidoLista[]` (OneToMany)

**Impacto:** 🟡 Medio

---

### 5️⃣ `libro.entity.ts` ↔️ `editorial.entity.ts`

**Ciclo:**
```
entities/libro.entity.ts → entities/editorial.entity.ts → entities/libro.entity.ts
```

**Descripción:**
- `Libro` pertenece a `Editorial` (ManyToOne)
- `Editorial` publica múltiples `Libro[]` (OneToMany)

**Impacto:** 🟡 Medio

---

### 6️⃣ `libro.entity.ts` ↔️ `favorito.entity.ts`

**Ciclo:**
```
entities/libro.entity.ts → entities/favorito.entity.ts → entities/libro.entity.ts
```

**Descripción:**
- `Favorito` referencia `Libro` (ManyToOne)
- `Libro` tiene múltiples `Favorito[]` (OneToMany)

**Impacto:** 🟢 Bajo

---

### 7️⃣ `libro.entity.ts` ↔️ `resena.entity.ts`

**Ciclo:**
```
entities/libro.entity.ts → entities/resena.entity.ts → entities/libro.entity.ts
```

**Descripción:**
- `Resena` pertenece a `Libro` (ManyToOne)
- `Libro` tiene múltiples `Resena[]` (OneToMany)

**Problema:** Este es el ciclo más crítico, ya que reseñas son funcionalidad core.

**Impacto:** 🔴 Alto

---

### 8️⃣ `resena.entity.ts` ↔️ `reaccion.entity.ts`

**Ciclo:**
```
entities/resena.entity.ts → entities/reaccion.entity.ts → entities/resena.entity.ts
```

**Descripción:**
- `Reaccion` referencia `Resena` (ManyToOne)
- `Resena` tiene múltiples `Reaccion[]` (OneToMany)

**Impacto:** 🟡 Medio

---

### 9️⃣ `libro.entity.ts` ↔️ `saga.entity.ts`

**Ciclo:**
```
entities/libro.entity.ts → entities/saga.entity.ts → entities/libro.entity.ts
```

**Descripción:**
- `Libro` puede pertenecer a `Saga` (ManyToOne)
- `Saga` agrupa múltiples `Libro[]` (OneToMany)

**Impacto:** 🟡 Medio

---

## 🔍 Análisis de Impacto

### ⚠️ Problemas Causados por Dependencias Circulares

1. **Dificultad en Testing:**
   - Mocks complejos debido a importaciones cruzadas
   - Setup de tests requiere múltiples entidades

2. **Acoplamiento Fuerte:**
   - Cambios en `Libro` pueden afectar 7 entidades relacionadas
   - Difícil aislar módulos para mantenimiento

3. **Riesgo de Memory Leaks:**
   - Referencias bidireccionales pueden causar problemas de garbage collection

4. **Complejidad de Refactorización:**
   - Cambiar estructura de una entidad requiere actualizar múltiples archivos

### ✅ Aspectos Positivos

1. **No hay ciclos en Services:**
   - Los servicios no tienen dependencias circulares (bien diseñados)

2. **No hay ciclos en Controllers:**
   - Los controladores están bien aislados

3. **Helpers y Utils limpios:**
   - Funciones auxiliares sin dependencias circulares

---

## 🎯 Plan de Refactorización

### Fase 1: Estrategia de Lazy Loading (Recomendado para MikroORM) ✅

**Acción:** Usar `() => Entity` en decoradores para romper ciclos.

**Antes:**
```typescript
// libro.entity.ts
import { Autor } from './autor.entity';

@Entity()
export class Libro {
  @ManyToOne(() => Autor)
  autor!: Autor;  // ❌ Importación directa
}
```

**Después:**
```typescript
// libro.entity.ts
@Entity()
export class Libro {
  @ManyToOne(() => Autor, { lazy: true })  // ✅ Lazy loading
  autor!: Ref<Autor>;  // Usar Ref<> de MikroORM
}
```

**Ventajas:**
- ✅ Sin cambios en lógica de negocio
- ✅ Compatible con MikroORM
- ✅ Rompe ciclos de importación

---

### Fase 2: Interfaces de Tipo (Alternativa)

**Acción:** Extraer interfaces separadas para romper dependencias.

**Estructura:**
```
entities/
  types/
    libro.interface.ts       // Solo tipos
    autor.interface.ts       // Solo tipos
    resena.interface.ts      // Solo tipos
  libro.entity.ts            // Implementa ILibro
  autor.entity.ts            // Implementa IAutor
  resena.entity.ts           // Implementa IResena
```

**Ejemplo:**
```typescript
// types/libro.interface.ts
export interface ILibro {
  id: number;
  titulo: string;
  isbn: string;
  // ...sin relaciones
}

// libro.entity.ts
import { ILibro } from './types/libro.interface';

@Entity()
export class Libro implements ILibro {
  @PrimaryKey()
  id!: number;
  
  @Property()
  titulo!: string;
  
  @ManyToOne(() => Autor, { lazy: true })  // Lazy loading
  autor!: Ref<Autor>;
}
```

**Ventajas:**
- ✅ Separación clara de tipos vs implementación
- ✅ Mejor para testing (mock interfaces)
- ✅ Type-safety mantenida

---

### Fase 3: Repository Pattern Completo

**Acción:** Abstraer acceso a entidades mediante repositories.

**Estructura:**
```
repositories/
  interfaces/
    ILibroRepository.ts      // Contrato
    IAutorRepository.ts
  implementations/
    LibroRepository.ts       // Implementación
    AutorRepository.ts
```

**Ejemplo:**
```typescript
// repositories/interfaces/ILibroRepository.ts
export interface ILibroRepository {
  findById(id: number): Promise<Libro | null>;
  findByISBN(isbn: string): Promise<Libro | null>;
  create(data: CreateLibroDTO): Promise<Libro>;
  // ... sin dependencias de entidades
}

// services/libro.service.ts
export class LibroService {
  constructor(
    private libroRepo: ILibroRepository,  // ✅ Depende de interface
    private autorRepo: IAutorRepository
  ) {}
  
  async crearLibro(data: CreateLibroDTO) {
    // Lógica sin importar entidades directamente
    return this.libroRepo.create(data);
  }
}
```

**Ventajas:**
- ✅ Inversión de dependencias (SOLID)
- ✅ Testing más fácil (mock repositories)
- ✅ Desacoplamiento total

---

## 📈 Priorización de Refactorización

### 🔴 Prioridad Alta

**1. Ciclo Libro ↔️ Resena**
- **Razón:** Funcionalidad core del sistema
- **Impacto:** Alto tráfico, uso frecuente
- **Solución recomendada:** Lazy loading + Repository pattern

**2. Ciclo Resena ↔️ Reaccion**
- **Razón:** Relación crítica para interacción de usuarios
- **Impacto:** Afecta engagement
- **Solución recomendada:** Lazy loading

### 🟡 Prioridad Media

**3. Ciclo Libro ↔️ Autor**
**4. Ciclo Libro ↔️ Editorial**
**5. Ciclo Libro ↔️ Categoria**
**6. Ciclo Libro ↔️ Saga**

- **Razón:** Relaciones básicas de modelo
- **Impacto:** Medio, pero no crítico para funcionalidad
- **Solución recomendada:** Lazy loading

### 🟢 Prioridad Baja

**7. Ciclo Libro ↔️ Favorito**
**8. Ciclo Libro ↔️ ContenidoLista**
**9. Ciclo ContenidoLista ↔️ Lista**

- **Razón:** Funcionalidad secundaria
- **Impacto:** Bajo uso relativo
- **Solución recomendada:** Lazy loading (cuando se refactoricen otras)

---

## 🛠️ Implementación Paso a Paso

### Paso 1: Refactorizar Libro ↔️ Resena

**Archivo:** `entities/libro.entity.ts`

```typescript
import { Entity, PrimaryKey, Property, OneToMany, ManyToOne, Ref } from '@mikro-orm/core';
import type { Resena } from './resena.entity';  // ✅ Type-only import

@Entity()
export class Libro {
  @PrimaryKey()
  id!: number;

  @Property()
  titulo!: string;

  @OneToMany(() => Resena, (resena) => resena.libro, { lazy: true })
  resenas = new Collection<Resena>(this);  // ✅ Lazy collection
}
```

**Archivo:** `entities/resena.entity.ts`

```typescript
import { Entity, PrimaryKey, ManyToOne, Ref } from '@mikro-orm/core';
import type { Libro } from './libro.entity';  // ✅ Type-only import

@Entity()
export class Resena {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Libro, { lazy: true })
  libro!: Ref<Libro>;  // ✅ Usar Ref<>
}
```

**Uso en Service:**

```typescript
// services/resena.service.ts
async obtenerResenaConLibro(id: number) {
  const resena = await this.em.findOne(Resena, id, {
    populate: ['libro']  // MikroORM maneja lazy loading
  });
  
  if (!resena) return null;
  
  // Acceder a libro (se carga automáticamente)
  const libroTitulo = resena.libro.unwrap().titulo;
  
  return resena;
}
```

---

### Paso 2: Actualizar Tests

**Antes:**
```typescript
// ❌ Tests con dependencia directa
const libro = new Libro();
libro.titulo = 'Test';

const resena = new Resena();
resena.libro = libro;  // Error con Ref<>
```

**Después:**
```typescript
// ✅ Tests con Ref<>
import { wrap } from '@mikro-orm/core';

const libro = new Libro();
libro.titulo = 'Test';

const resena = new Resena();
resena.libro = wrap(libro).toReference();  // Correcto
```

---

### Paso 3: Verificar con Madge

Después de cada refactorización:

```bash
npx madge --circular --extensions ts src/
```

Debe mostrar una dependencia circular menos cada vez.

---

## 📊 Métricas de Éxito

### Antes de Refactorización
- ❌ **9 dependencias circulares**
- ⚠️ **159 archivos analizados**
- 🔴 **Acoplamiento fuerte entre entidades**

### Objetivo Post-Refactorización
- ✅ **0 dependencias circulares**
- ✅ **Entidades desacopladas con lazy loading**
- ✅ **Repository pattern implementado**
- ✅ **Tests actualizados y pasando**

---

## 🚀 Próximos Pasos

1. **Fase 1 (Esta semana):**
   - ✅ Análisis completado
   - ⏳ Implementar lazy loading en Libro ↔️ Resena
   - ⏳ Actualizar tests relacionados

2. **Fase 2 (Próxima semana):**
   - Refactorizar Resena ↔️ Reaccion
   - Implementar interfaces de tipo

3. **Fase 3 (Dos semanas):**
   - Completar lazy loading en todos los ciclos
   - Repository pattern completo

4. **Fase 4 (Tres semanas):**
   - Validar con madge: 0 ciclos
   - Documentar arquitectura final

---

## 📚 Referencias

- [MikroORM - Lazy Loading](https://mikro-orm.io/docs/loading-strategies#lazy-loading)
- [MikroORM - Reference Wrapper](https://mikro-orm.io/docs/entity-references)
- [Madge - Circular Dependencies](https://github.com/pahen/madge)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

**Última actualización:** 6 de enero de 2026  
**Autor:** Equipo COM304 - TPDSW  
**Estado:** 📋 Análisis completado, pendiente implementación
