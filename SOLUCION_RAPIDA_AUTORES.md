# 🚨 PROBLEMA URGENTE - Página de Autores

## Estado Actual:
- ✅ **Base de datos:** 225 autores + 205 libros (COMPLETADO)
- ❌ **Frontend:** Solo muestra 9 autores + loading infinito (ROTO)

## Causa:
`AutoresPageMejorada.tsx` usa APIs externas (Open Library) en lugar de la BD local.

## Solución Rápida (30 minutos):

### 1. Backend - Crear endpoint `/api/autores`

**Archivo:** `Backend/src/controllers/autor.controller.ts`

Agregar método:
```typescript
async getAutores(req: Request, res: Response) {
  const { page = 1, limit = 20, search = '' } = req.query;
  const em = this.orm.em.fork();
  
  const qb = em.createQueryBuilder(Autor, 'a');
  
  if (search) {
    qb.where({
      $or: [
        { nombre: { $like: `%${search}%` } },
        { apellido: { $like: `%${search}%` } }
      ]
    });
  }
  
  const offset = (Number(page) - 1) * Number(limit);
  const autores = await qb.limit(Number(limit)).offset(offset).getResult();
  const total = await em.count(Autor);
  
  res.json({
    autores,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit))
  });
}
```

**Archivo:** `Backend/src/routes/autor.routes.ts`

Agregar ruta:
```typescript
router.get('/', autorController.getAutores.bind(autorController));
```

### 2. Frontend - Modificar `AutoresPageMejorada.tsx`

Reemplazar función `fetchAutores` (línea ~95):
```typescript
const fetchAutores = async (searchTerm = '', pageNum = 1) => {
  setLoading(true);
  try {
    const response = await fetch(
      `http://localhost:3000/api/autores?page=${pageNum}&limit=20&search=${searchTerm}`
    );
    const data = await response.json();
    
    if (pageNum === 1) {
      setAutores(data.autores);
      setDisplayedAutores(data.autores);
    } else {
      setDisplayedAutores(prev => [...prev, ...data.autores]);
    }
    
    setHasMore(data.page < data.totalPages);
    setPage(pageNum);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setLoading(false);
  }
};

// Cargar al inicio
useEffect(() => {
  fetchAutores('', 1);
}, []);

// Búsqueda
useEffect(() => {
  if (searchTerm.length >= 2) {
    const timer = setTimeout(() => fetchAutores(searchTerm, 1), 500);
    return () => clearTimeout(timer);
  } else if (searchTerm === '') {
    fetchAutores('', 1);
  }
}, [searchTerm]);

// Scroll infinito
const loadMore = () => {
  fetchAutores(searchTerm, page + 1);
};
```

## Resultado Esperado:
- ✅ Muestra 20 autores inicialmente
- ✅ Scroll infinito carga más (hasta 225 autores)
- ✅ Búsqueda funciona con BD local
- ✅ No más loading infinito

## Archivos a Modificar:
1. `Backend/src/controllers/autor.controller.ts` (1 método)
2. `Backend/src/routes/autor.routes.ts` (1 ruta)
3. `Frontend/src/paginas/AutoresPageMejorada.tsx` (1 función)

**Total: 3 archivos**

---

Ver análisis completo en: `PROBLEMA_PAGINA_AUTORES.md`
