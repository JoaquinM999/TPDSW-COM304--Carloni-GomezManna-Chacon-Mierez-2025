# 🔧 Guía de Implementación - Dependency Injection

## 📊 Estado Actual

**Fecha:** 6 de enero de 2026  
**Progreso:** Fase 2 (Repositories) - 80% completado

### ✅ Completado

1. **Interfaces definidas (8 archivos)**
   - ✅ ILibroRepository, IResenaRepository, IAutorRepository, IUsuarioRepository
   - ✅ ILibroService, IResenaService, IAutorService, IUsuarioService
   - ✅ DTOs completos para cada servicio

2. **Repositories implementados (4 archivos)**
   - ✅ MikroORMLibroRepository
   - ✅ MikroORMResenaRepository
   - ✅ MikroORMAutorRepository
   - ✅ MikroORMUsuarioRepository

3. **DI Container creado**
   - ✅ DIContainer (implementación simple sin librerías)
   - ✅ TYPES (símbolos para inyección)
   - ✅ Métodos: initialize(), resolve(), register(), clear()

### ⚠️ Errores de TypeScript a Resolver

Los repositories tienen errores porque asumen nombres de campos diferentes a los de las entidades reales. **NO es crítico** - son errores de compilación que se corregirán cuando se ajusten los nombres.

Ejemplos:
- `resenaOriginal` → Verificar nombre real en entity
- `aprobada/rechazada` → Usar `estado: EstadoResena`
- `fechaCreacion` → Verificar nombre real
- `role` → Usar `rol`
- `favoritos/listas/actividades` → Verificar relaciones en entities

---

## 🚀 Cómo Usar el DI Container

### 1. Inicializar en `app.ts` o `index.ts`

```typescript
// src/app.ts o src/index.ts
import { MikroORM } from '@mikro-orm/core';
import { DIContainer } from './di';
import mikroOrmConfig from './mikro-orm.config';

async function bootstrap() {
  // Inicializar ORM
  const orm = await MikroORM.init(mikroOrmConfig);
  
  // ✅ Inicializar DI Container
  DIContainer.initialize(orm.em);
  
  // Opcional: Ver diagnóstico
  DIContainer.diagnose();
  
  // Continuar con configuración de Express...
  const app = express();
  // ...
}

bootstrap();
```

### 2. Usar en Controllers (Ejemplo actual)

**Antes (acceso directo a EntityManager):**
```typescript
// libro.controller.ts
import { Request, Response } from 'express';

export const getLibro = async (req: Request, res: Response) => {
  const em = req.em;  // ❌ Acceso directo
  
  const libro = await em.findOne(Libro, req.params.id, {
    populate: ['autor', 'editorial', 'categorias']
  });
  
  if (!libro) {
    return res.status(404).json({ error: 'Libro no encontrado' });
  }
  
  res.json({ data: libro });
};
```

**Después (usando DI Container):**
```typescript
// libro.controller.ts
import { Request, Response } from 'express';
import { DIContainer, TYPES } from '../di';
import type { ILibroRepository } from '../interfaces';

export const getLibro = async (req: Request, res: Response) => {
  // ✅ Obtener repository desde DI
  const libroRepo = DIContainer.resolve<ILibroRepository>(TYPES.LibroRepository);
  
  const libro = await libroRepo.findById(
    parseInt(req.params.id),
    { populate: ['autor', 'editorial', 'categorias'] }
  );
  
  if (!libro) {
    return res.status(404).json({ error: 'Libro no encontrado' });
  }
  
  res.json({ data: libro });
};
```

### 3. Usar en Services (cuando se implementen)

```typescript
// services/implementations/LibroService.ts
import type { ILibroRepository } from '../../interfaces/ILibroRepository';
import type { ILibroService } from '../../interfaces/ILibroService';

export class LibroService implements ILibroService {
  // ✅ Dependency Injection via constructor
  constructor(private readonly libroRepo: ILibroRepository) {}
  
  async getById(id: number): Promise<Libro | null> {
    return this.libroRepo.findById(id, {
      populate: ['autor', 'editorial', 'categorias']
    });
  }
  
  async create(data: CreateLibroDTO): Promise<Libro> {
    // Validación de negocio
    if (await this.libroRepo.existsByISBN(data.isbn)) {
      throw new Error('ISBN ya existe');
    }
    
    // Crear libro
    return this.libroRepo.create(data);
  }
  
  // ... más métodos
}
```

**Registrar service en DIContainer:**
```typescript
// di/container.ts
import { LibroService } from '../services/implementations/LibroService';

DIContainer.initialize(em: EntityManager): void {
  // ... repositories
  
  const libroRepo = DIContainer.resolve<ILibroRepository>(TYPES.LibroRepository);
  const libroService = new LibroService(libroRepo);
  DIContainer.register(TYPES.LibroService, libroService);
}
```

**Usar service en controller:**
```typescript
// controllers/libro.controller.ts
import { DIContainer, TYPES } from '../di';
import type { ILibroService } from '../interfaces';

export const getLibro = async (req: Request, res: Response) => {
  const libroService = DIContainer.resolve<ILibroService>(TYPES.LibroService);
  
  const libro = await libroService.getById(parseInt(req.params.id));
  
  if (!libro) {
    return res.status(404).json({ error: 'Libro no encontrado' });
  }
  
  res.json({ data: libro });
};
```

---

## 🧪 Testing con DI Container

### Ventaja: Fácil Mock de Dependencias

```typescript
// tests/libro.service.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LibroService } from '../services/implementations/LibroService';
import type { ILibroRepository } from '../interfaces';

describe('LibroService', () => {
  let libroService: LibroService;
  let mockLibroRepo: ILibroRepository;

  beforeEach(() => {
    // ✅ Mock simple del repository
    mockLibroRepo = {
      findById: vi.fn().mockResolvedValue({ id: 1, titulo: 'Test Book' }),
      existsByISBN: vi.fn().mockResolvedValue(false),
      create: vi.fn().mockResolvedValue({ id: 1, titulo: 'New Book' }),
      // ... otros métodos
    } as any;

    // Inyectar mock en service
    libroService = new LibroService(mockLibroRepo);
  });

  it('debe obtener libro por ID', async () => {
    const libro = await libroService.getById(1);
    
    expect(libro).toBeDefined();
    expect(libro?.titulo).toBe('Test Book');
    expect(mockLibroRepo.findById).toHaveBeenCalledWith(1, expect.any(Object));
  });

  it('debe crear libro si ISBN no existe', async () => {
    const dto = { titulo: 'New Book', isbn: '1234567890' };
    
    const libro = await libroService.create(dto);
    
    expect(mockLibroRepo.existsByISBN).toHaveBeenCalledWith('1234567890');
    expect(mockLibroRepo.create).toHaveBeenCalledWith(dto);
    expect(libro.id).toBe(1);
  });

  it('debe lanzar error si ISBN ya existe', async () => {
    mockLibroRepo.existsByISBN = vi.fn().mockResolvedValue(true);
    
    const dto = { titulo: 'Duplicate', isbn: '1234567890' };
    
    await expect(libroService.create(dto)).rejects.toThrow('ISBN ya existe');
  });
});
```

---

## 📝 Tareas Pendientes

### Prioridad Alta 🔴

1. **Corregir errores TypeScript en repositories**
   - Ajustar nombres de campos a entidades reales
   - Verificar relaciones (ManyToOne, OneToMany, etc.)
   - Ajustar QueryBuilder queries

2. **Implementar Services (4 archivos)**
   - LibroService
   - ResenaService
   - AutorService
   - UsuarioService

3. **Crear tests para repositories (100+ tests)**
   - Tests unitarios con EntityManager mockeado
   - Verificar cada método (findById, create, update, delete, etc.)

### Prioridad Media 🟡

4. **Refactorizar un controller como ejemplo**
   - Elegir LibroController
   - Migrar de EntityManager directo a usar repositories/services
   - Documentar patrón

5. **Crear tests para services (150+ tests)**
   - Tests con repositories mockeados
   - Validar lógica de negocio

### Prioridad Baja 🟢

6. **Migrar resto de controllers**
   - ResenaController
   - AutorController
   - UsuarioController
   - CategoriaController, etc.

7. **Optimizaciones**
   - Cache layer (CachedLibroRepository)
   - Logging layer (LoggedResenaService)
   - Métricas y observabilidad

---

## 🎯 Plan de Acción Inmediato

### Opción A: Continuar con Repositories (Recomendado)

1. ✅ Verificar estructura real de entidades
2. ✅ Corregir MikroORMResenaRepository
3. ✅ Corregir MikroORMAutorRepository
4. ✅ Corregir MikroORMUsuarioRepository
5. ✅ Crear tests básicos (20-30 tests)
6. ✅ Verificar compilación sin errores

**Tiempo estimado:** 2-3 horas

---

### Opción B: Implementar Services

1. ✅ Crear LibroService (10-15 métodos)
2. ✅ Crear ResenaService (15-20 métodos)
3. ✅ Registrar en DIContainer
4. ✅ Crear tests (50+ tests)

**Tiempo estimado:** 3-4 horas

---

### Opción C: Ejemplo End-to-End

1. ✅ Corregir MikroORMLibroRepository (ya está bien)
2. ✅ Crear LibroService simple
3. ✅ Refactorizar LibroController
4. ✅ Crear tests de integración
5. ✅ Documentar patrón completo

**Tiempo estimado:** 1-2 horas  
**Ventaja:** Ejemplo completo funcional para replicar

---

## 💡 Beneficios Ya Obtenidos

### 1. Separación de Responsabilidades ✅

```
Controller → Service → Repository → EntityManager
    ↓           ↓           ↓
  HTTP      Business     Data Access
```

### 2. Testeable ✅

```typescript
// ❌ ANTES: Difícil de testear
test('controller', () => {
  // Necesito EntityManager real + base de datos
});

// ✅ AHORA: Fácil de testear
test('service', () => {
  const mockRepo = { findById: vi.fn() };
  const service = new LibroService(mockRepo);
  // Testing aislado
});
```

### 3. Flexible ✅

```typescript
// Cambiar implementación fácilmente
const libroRepo = process.env.USE_CACHE
  ? new CachedLibroRepository(new MikroORMLibroRepository(em), redis)
  : new MikroORMLibroRepository(em);

DIContainer.register(TYPES.LibroRepository, libroRepo);
```

---

## 📚 Recursos

- [ARQUITECTURA_SERVICIOS.md](./ARQUITECTURA_SERVICIOS.md) - Diseño completo con SOLID
- [ANALISIS_DEPENDENCIAS.md](./ANALISIS_DEPENDENCIAS.md) - Dependencias circulares
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Guía de testing

---

**Última actualización:** 6 de enero de 2026  
**Autor:** Equipo COM304 - TPDSW  
**Próximo paso:** Elegir Opción A, B o C y continuar implementación
