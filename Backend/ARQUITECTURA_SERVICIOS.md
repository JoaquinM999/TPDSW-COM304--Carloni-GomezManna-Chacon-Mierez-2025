# 🏗️ Diseño de Arquitectura de Servicios - Backend

## 📊 Resumen Ejecutivo

**Fecha:** 6 de enero de 2026  
**Objetivo:** Refactorizar Backend hacia arquitectura SOLID con inyección de dependencias  
**Patrón Principal:** Repository + Service Layer  
**Estado:** 📋 Diseño completado, pendiente implementación

---

## 🎯 Principios SOLID Aplicados

### 1. **S**ingle Responsibility Principle (SRP)

**Antes (❌):**
```typescript
// resena.controller.ts - Hace TODO
class ResenaController {
  async create(req, res) {
    // Validación
    if (!req.body.titulo) return res.status(400).json({...});
    
    // Lógica de negocio
    const libro = await em.findOne(Libro, req.body.libroId);
    if (!libro) return res.status(404).json({...});
    
    // Acceso a datos
    const resena = new Resena();
    resena.titulo = req.body.titulo;
    await em.persistAndFlush(resena);
    
    // Respuesta
    res.json({ data: resena });
  }
}
```

**Después (✅):**
```typescript
// CONTROLLER: Solo manejo de HTTP
class ResenaController {
  constructor(private resenaService: IResenaService) {}
  
  async create(req, res) {
    const dto = req.body;
    const resena = await this.resenaService.create(dto);
    res.json({ data: resena });
  }
}

// SERVICE: Lógica de negocio
class ResenaService implements IResenaService {
  constructor(
    private resenaRepo: IResenaRepository,
    private libroRepo: ILibroRepository
  ) {}
  
  async create(data: CreateResenaDTO): Promise<Resena> {
    // Validar libro existe
    const libro = await this.libroRepo.findById(data.libroId);
    if (!libro) throw new NotFoundError('Libro no encontrado');
    
    // Validar usuario no reseñó antes
    const existe = await this.resenaRepo.existsByUsuarioAndLibro(
      data.usuarioId,
      data.libroId
    );
    if (existe) throw new ConflictError('Ya reseñaste este libro');
    
    // Crear reseña
    return this.resenaRepo.create(data);
  }
}

// REPOSITORY: Solo acceso a datos
class ResenaRepository implements IResenaRepository {
  constructor(private em: EntityManager) {}
  
  async create(data: Partial<Resena>): Promise<Resena> {
    const resena = this.em.create(Resena, data);
    await this.em.persistAndFlush(resena);
    return resena;
  }
}
```

---

### 2. **O**pen/Closed Principle (OCP)

**Extensible sin modificar código existente:**

```typescript
// BASE: Interface abierta a extensión
interface IResenaService {
  create(data: CreateResenaDTO): Promise<Resena>;
}

// IMPLEMENTACIÓN BASE
class ResenaService implements IResenaService {
  async create(data: CreateResenaDTO): Promise<Resena> {
    return this.resenaRepo.create(data);
  }
}

// EXTENSIÓN: Agregar moderación sin modificar original
class ModeratedResenaService extends ResenaService {
  constructor(
    resenaRepo: IResenaRepository,
    libroRepo: ILibroRepository,
    private moderationService: IModerationService  // ✅ Nueva dep
  ) {
    super(resenaRepo, libroRepo);
  }
  
  async create(data: CreateResenaDTO): Promise<Resena> {
    // ✅ Validación adicional sin tocar clase base
    const isValid = await this.moderationService.validate(data.contenido);
    if (!isValid) throw new ForbiddenError('Contenido inapropiado');
    
    // Llamar a método original
    return super.create(data);
  }
}
```

---

### 3. **L**iskov Substitution Principle (LSP)

**Cualquier implementación de interfaz puede sustituir a otra:**

```typescript
// Interface base
interface ILibroRepository {
  findById(id: number): Promise<Libro | null>;
}

// Implementación 1: MikroORM
class MikroORMLibroRepository implements ILibroRepository {
  constructor(private em: EntityManager) {}
  
  async findById(id: number): Promise<Libro | null> {
    return this.em.findOne(Libro, id);
  }
}

// Implementación 2: Cache (Redis)
class CachedLibroRepository implements ILibroRepository {
  constructor(
    private baseRepo: ILibroRepository,
    private cache: Redis
  ) {}
  
  async findById(id: number): Promise<Libro | null> {
    // Buscar en cache
    const cached = await this.cache.get(`libro:${id}`);
    if (cached) return JSON.parse(cached);
    
    // Buscar en DB y cachear
    const libro = await this.baseRepo.findById(id);
    if (libro) {
      await this.cache.set(`libro:${id}`, JSON.stringify(libro), 'EX', 3600);
    }
    return libro;
  }
}

// ✅ Ambas implementaciones intercambiables
const service = new LibroService(
  // Puede ser MikroORMLibroRepository O CachedLibroRepository
  process.env.USE_CACHE 
    ? new CachedLibroRepository(new MikroORMLibroRepository(em), redis)
    : new MikroORMLibroRepository(em)
);
```

---

### 4. **I**nterface Segregation Principle (ISP)

**Interfaces pequeñas y específicas:**

❌ **MAL: Interface gigante**
```typescript
interface ILibroService {
  // CRUD básico
  create(data: CreateLibroDTO): Promise<Libro>;
  update(id: number, data: UpdateLibroDTO): Promise<Libro>;
  delete(id: number): Promise<void>;
  
  // Búsqueda
  search(filters: LibroSearchDTO): Promise<Libro[]>;
  
  // Estadísticas
  getStats(id: number): Promise<LibroStatsDTO>;
  
  // Importación
  importFromGoogle(isbn: string): Promise<Libro>;
  importFromOpenLibrary(isbn: string): Promise<Libro>;
  
  // Recomendaciones
  getRecommended(libroId: number): Promise<Libro[]>;
  
  // Exportación
  exportToPDF(libroId: number): Promise<Buffer>;
  exportToCSV(libroIds: number[]): Promise<string>;
}
```

✅ **BIEN: Interfaces segregadas**
```typescript
// Interface base con operaciones comunes
interface ILibroService {
  create(data: CreateLibroDTO): Promise<Libro>;
  update(id: number, data: UpdateLibroDTO): Promise<Libro>;
  delete(id: number): Promise<void>;
  getById(id: number): Promise<Libro | null>;
}

// Búsqueda separada
interface ILibroSearchService {
  search(filters: LibroSearchDTO): Promise<Libro[]>;
  searchByISBN(isbn: string): Promise<Libro | null>;
}

// Estadísticas separadas
interface ILibroStatsService {
  getStats(id: number): Promise<LibroStatsDTO>;
  getMostPopular(limit: number): Promise<Libro[]>;
}

// Importación separada
interface ILibroImportService {
  importFromGoogle(isbn: string): Promise<Libro>;
  importFromOpenLibrary(isbn: string): Promise<Libro>;
}

// Exportación separada
interface ILibroExportService {
  exportToPDF(libroId: number): Promise<Buffer>;
  exportToCSV(libroIds: number[]): Promise<string>;
}
```

---

### 5. **D**ependency Inversion Principle (DIP)

**Depender de abstracciones, no de implementaciones concretas:**

❌ **MAL: Dependencia de clase concreta**
```typescript
class ResenaService {
  private em: EntityManager;  // ❌ Dependencia concreta
  
  constructor(em: EntityManager) {
    this.em = em;
  }
  
  async create(data: CreateResenaDTO): Promise<Resena> {
    // Acoplado a MikroORM
    const resena = this.em.create(Resena, data);
    await this.em.persistAndFlush(resena);
    return resena;
  }
}
```

✅ **BIEN: Dependencia de abstracción**
```typescript
class ResenaService implements IResenaService {
  constructor(
    private resenaRepo: IResenaRepository,  // ✅ Abstracción
    private libroRepo: ILibroRepository     // ✅ Abstracción
  ) {}
  
  async create(data: CreateResenaDTO): Promise<Resena> {
    // Desacoplado de implementación específica
    const libro = await this.libroRepo.findById(data.libroId);
    if (!libro) throw new NotFoundError('Libro no encontrado');
    
    return this.resenaRepo.create(data);
  }
}

// ✅ Las implementaciones concretas se inyectan
const service = new ResenaService(
  new MikroORMResenaRepository(em),
  new MikroORMLibroRepository(em)
);
```

---

## 📂 Estructura de Archivos Propuesta

```
src/
├── interfaces/              # ✅ NUEVO
│   ├── repositories/
│   │   ├── ILibroRepository.ts
│   │   ├── IResenaRepository.ts
│   │   ├── IAutorRepository.ts
│   │   └── IUsuarioRepository.ts
│   ├── services/
│   │   ├── ILibroService.ts
│   │   ├── IResenaService.ts
│   │   ├── IAutorService.ts
│   │   └── IUsuarioService.ts
│   └── index.ts
│
├── repositories/            # ✅ NUEVO
│   ├── implementations/
│   │   ├── MikroORMLibroRepository.ts
│   │   ├── MikroORMResenaRepository.ts
│   │   ├── MikroORMAutorRepository.ts
│   │   └── MikroORMUsuarioRepository.ts
│   └── index.ts
│
├── services/                # ✅ REFACTORIZAR
│   ├── implementations/
│   │   ├── LibroService.ts
│   │   ├── ResenaService.ts
│   │   ├── AutorService.ts
│   │   └── UsuarioService.ts
│   └── index.ts
│
├── controllers/             # ✅ REFACTORIZAR
│   ├── libro.controller.ts    (usar ILibroService)
│   ├── resena.controller.ts   (usar IResenaService)
│   ├── autor.controller.ts    (usar IAutorService)
│   └── usuario.controller.ts  (usar IUsuarioService)
│
├── di/                      # ✅ NUEVO - Dependency Injection
│   ├── container.ts         (configuración del contenedor)
│   └── types.ts             (símbolos de inyección)
│
└── entities/                # Sin cambios
    ├── libro.entity.ts
    ├── resena.entity.ts
    └── ...
```

---

## 🔧 Implementación de Dependency Injection

### Opción 1: Manual (Recomendado para empezar) ✅

```typescript
// di/container.ts
import { EntityManager } from '@mikro-orm/core';
import { MikroORMLibroRepository } from '../repositories/implementations/MikroORMLibroRepository';
import { LibroService } from '../services/implementations/LibroService';
import type { ILibroRepository } from '../interfaces/ILibroRepository';
import type { ILibroService } from '../interfaces/ILibroService';

export class DIContainer {
  private static instances = new Map<string, any>();
  
  static register(key: string, instance: any) {
    this.instances.set(key, instance);
  }
  
  static resolve<T>(key: string): T {
    const instance = this.instances.get(key);
    if (!instance) {
      throw new Error(`No se encontró instancia para: ${key}`);
    }
    return instance;
  }
  
  static initialize(em: EntityManager) {
    // Repositories
    const libroRepo = new MikroORMLibroRepository(em);
    this.register('ILibroRepository', libroRepo);
    
    const resenaRepo = new MikroORMResenaRepository(em);
    this.register('IResenaRepository', resenaRepo);
    
    // Services
    const libroService = new LibroService(libroRepo);
    this.register('ILibroService', libroService);
    
    const resenaService = new ResenaService(resenaRepo, libroRepo);
    this.register('IResenaService', resenaService);
  }
}

// app.ts
import { DIContainer } from './di/container';

const app = express();
const orm = await MikroORM.init(config);

// Inicializar contenedor
DIContainer.initialize(orm.em);

// Usar en rutas
app.use('/libros', createLibroRouter(
  DIContainer.resolve<ILibroService>('ILibroService')
));
```

---

### Opción 2: InversifyJS (Avanzado)

```bash
npm install inversify reflect-metadata
```

```typescript
// di/types.ts
export const TYPES = {
  // Repositories
  LibroRepository: Symbol.for('ILibroRepository'),
  ResenaRepository: Symbol.for('IResenaRepository'),
  
  // Services
  LibroService: Symbol.for('ILibroService'),
  ResenaService: Symbol.for('IResenaService'),
  
  // ORM
  EntityManager: Symbol.for('EntityManager'),
};

// di/container.ts
import { Container } from 'inversify';
import { TYPES } from './types';

const container = new Container();

// Bind repositories
container.bind<ILibroRepository>(TYPES.LibroRepository)
  .to(MikroORMLibroRepository)
  .inSingletonScope();

// Bind services
container.bind<ILibroService>(TYPES.LibroService)
  .to(LibroService)
  .inSingletonScope();

export { container };

// services/implementations/LibroService.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '../../di/types';

@injectable()
export class LibroService implements ILibroService {
  constructor(
    @inject(TYPES.LibroRepository) private libroRepo: ILibroRepository
  ) {}
  
  async create(data: CreateLibroDTO): Promise<Libro> {
    return this.libroRepo.create(data);
  }
}
```

---

## 🎯 Plan de Migración (4 Fases)

### **Fase 1: Crear Interfaces y Repositories** ✅

**Estado:** COMPLETADO

- ✅ Crear carpeta `interfaces/`
- ✅ Definir `ILibroRepository`, `IResenaRepository`, `IAutorRepository`, `IUsuarioRepository`
- ✅ Definir `ILibroService`, `IResenaService`, `IAutorService`, `IUsuarioService`
- ✅ Crear DTOs para cada servicio

---

### **Fase 2: Implementar Repositories**

**Objetivo:** Aislar acceso a datos

**Archivos a crear:**

1. `repositories/implementations/MikroORMLibroRepository.ts`
```typescript
import { injectable } from 'inversify';
import { EntityManager } from '@mikro-orm/core';
import type { ILibroRepository } from '../../interfaces/ILibroRepository';
import { Libro } from '../../entities/libro.entity';

@injectable()
export class MikroORMLibroRepository implements ILibroRepository {
  constructor(private em: EntityManager) {}
  
  async findById(id: number): Promise<Libro | null> {
    return this.em.findOne(Libro, id);
  }
  
  async findByISBN(isbn: string): Promise<Libro | null> {
    return this.em.findOne(Libro, { isbn });
  }
  
  async create(data: Partial<Libro>): Promise<Libro> {
    const libro = this.em.create(Libro, data);
    await this.em.persistAndFlush(libro);
    return libro;
  }
  
  // ... implementar resto de métodos
}
```

2. `repositories/implementations/MikroORMResenaRepository.ts`
3. `repositories/implementations/MikroORMAutorRepository.ts`
4. `repositories/implementations/MikroORMUsuarioRepository.ts`

**Tests:** Crear tests unitarios para cada repository

---

### **Fase 3: Implementar Services**

**Objetivo:** Centralizar lógica de negocio

**Archivos a refactorizar:**

1. `services/implementations/LibroService.ts`
```typescript
import { injectable, inject } from 'inversify';
import { TYPES } from '../../di/types';
import type { ILibroService } from '../../interfaces/ILibroService';
import type { ILibroRepository } from '../../interfaces/ILibroRepository';

@injectable()
export class LibroService implements ILibroService {
  constructor(
    @inject(TYPES.LibroRepository) private libroRepo: ILibroRepository
  ) {}
  
  async getById(id: number): Promise<Libro | null> {
    return this.libroRepo.findById(id, {
      populate: ['autor', 'editorial', 'categorias']
    });
  }
  
  async create(data: CreateLibroDTO): Promise<Libro> {
    // Validaciones de negocio
    if (await this.libroRepo.existsByISBN(data.isbn)) {
      throw new ConflictError('ISBN ya existe');
    }
    
    // Crear libro
    return this.libroRepo.create(data);
  }
  
  async getStats(id: number): Promise<LibroStatsDTO> {
    const libro = await this.libroRepo.findById(id, {
      populate: ['resenas', 'favoritos']
    });
    
    if (!libro) throw new NotFoundError('Libro no encontrado');
    
    return {
      totalResenas: libro.resenas.length,
      promedioCalificacion: this.calcularPromedio(libro.resenas),
      distribucionCalificaciones: this.calcularDistribucion(libro.resenas),
      totalFavoritos: libro.favoritos.length
    };
  }
  
  private calcularPromedio(resenas: Resena[]): number {
    if (resenas.length === 0) return 0;
    const suma = resenas.reduce((acc, r) => acc + r.calificacion, 0);
    return suma / resenas.length;
  }
  
  private calcularDistribucion(resenas: Resena[]): Record<number, number> {
    // Implementación...
  }
}
```

2. `services/implementations/ResenaService.ts`
3. `services/implementations/AutorService.ts`
4. `services/implementations/UsuarioService.ts`

**Tests:** Crear tests unitarios con mocks de repositories

---

### **Fase 4: Refactorizar Controllers**

**Objetivo:** Controllers solo manejan HTTP, delegan a servicios

**Antes:**
```typescript
// libro.controller.ts
export const getLibro = async (req: Request, res: Response) => {
  const em = req.em;  // ❌ Acceso directo a EntityManager
  
  const libro = await em.findOne(Libro, req.params.id, {
    populate: ['autor', 'editorial']
  });
  
  if (!libro) {
    return res.status(404).json({ error: 'Libro no encontrado' });
  }
  
  res.json({ data: libro });
};
```

**Después:**
```typescript
// libro.controller.ts
import { inject } from 'inversify';
import { TYPES } from '../di/types';
import type { ILibroService } from '../interfaces/ILibroService';

export class LibroController {
  constructor(
    @inject(TYPES.LibroService) private libroService: ILibroService
  ) {}
  
  async getLibro(req: Request, res: Response) {
    try {
      const libro = await this.libroService.getById(
        parseInt(req.params.id)
      );
      
      if (!libro) {
        return res.status(404).json({ error: 'Libro no encontrado' });
      }
      
      res.json({ data: libro });
    } catch (error) {
      next(error);  // Delegar manejo de errores a middleware
    }
  }
}
```

---

## 📊 Beneficios de la Arquitectura

### 1. **Testing Mejorado** 🧪

**Antes (difícil de testear):**
```typescript
// ❌ Test requiere EntityManager real
describe('ResenaController', () => {
  it('debe crear reseña', async () => {
    const em = await createTestEntityManager();  // Complejo
    const controller = new ResenaController();
    // ...
  });
});
```

**Después (fácil de testear):**
```typescript
// ✅ Test usa mocks simples
describe('ResenaService', () => {
  it('debe crear reseña', async () => {
    const mockRepo = {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      existsByUsuarioAndLibro: vi.fn().mockResolvedValue(false)
    } as any;
    
    const service = new ResenaService(mockRepo, mockLibroRepo);
    const result = await service.create(mockData);
    
    expect(mockRepo.create).toHaveBeenCalledWith(mockData);
    expect(result.id).toBe(1);
  });
});
```

---

### 2. **Mantenibilidad** 🔧

- ✅ Cambios en DB solo afectan repositories
- ✅ Cambios en lógica solo afectan services
- ✅ Cambios en API solo afectan controllers
- ✅ Cada capa independiente y testeable

---

### 3. **Escalabilidad** 📈

```typescript
// Fácil agregar cache
class CachedLibroService implements ILibroService {
  constructor(
    private baseService: ILibroService,
    private cache: Redis
  ) {}
  
  async getById(id: number): Promise<Libro | null> {
    const cached = await this.cache.get(`libro:${id}`);
    if (cached) return JSON.parse(cached);
    
    const libro = await this.baseService.getById(id);
    if (libro) {
      await this.cache.set(`libro:${id}`, JSON.stringify(libro));
    }
    return libro;
  }
}

// Fácil agregar logging
class LoggedResenaService implements IResenaService {
  constructor(
    private baseService: IResenaService,
    private logger: Logger
  ) {}
  
  async create(data: CreateResenaDTO): Promise<Resena> {
    this.logger.info('Creando reseña', { data });
    const resena = await this.baseService.create(data);
    this.logger.info('Reseña creada', { resenaId: resena.id });
    return resena;
  }
}
```

---

### 4. **Reutilización** ♻️

```typescript
// Services reutilizables en múltiples lugares
class LibroController {
  constructor(private libroService: ILibroService) {}
}

class GraphQLLibroResolver {
  constructor(private libroService: ILibroService) {}  // ✅ Mismo servicio
}

class LibroCronJob {
  constructor(private libroService: ILibroService) {}  // ✅ Mismo servicio
}
```

---

## 🚀 Próximos Pasos

### Semana 1: Implementar Repositories
- [ ] Crear MikroORMLibroRepository
- [ ] Crear MikroORMResenaRepository
- [ ] Crear MikroORMAutorRepository
- [ ] Crear MikroORMUsuarioRepository
- [ ] Tests unitarios (100+ tests)

### Semana 2: Implementar Services
- [ ] Implementar LibroService
- [ ] Implementar ResenaService
- [ ] Implementar AutorService
- [ ] Implementar UsuarioService
- [ ] Tests unitarios con mocks (150+ tests)

### Semana 3: Refactorizar Controllers
- [ ] Refactorizar LibroController
- [ ] Refactorizar ResenaController
- [ ] Refactorizar AutorController
- [ ] Refactorizar UsuarioController
- [ ] Tests de integración

### Semana 4: DI Container y Optimizaciones
- [ ] Configurar InversifyJS (o DIContainer manual)
- [ ] Migrar todas las rutas
- [ ] Agregar decoradores de validación
- [ ] Documentar con JSDoc
- [ ] Performance testing

---

## 📚 Referencias

- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection)
- [InversifyJS](https://inversify.io/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Última actualización:** 6 de enero de 2026  
**Autor:** Equipo COM304 - TPDSW  
**Estado:** 📋 Diseño completado con 8 interfaces (4 repos + 4 services) + DTOs
