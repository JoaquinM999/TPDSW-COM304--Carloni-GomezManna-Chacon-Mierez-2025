import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { Autor } from '../entities/autor.entity';
import redis from '../redis';
import { 
  searchGoogleBooksAuthors, 
  searchOpenLibraryAuthors,
  searchGoogleBooksAuthorsReadOnly,
  searchOpenLibraryAuthorsReadOnly,
  saveExternalAuthor,
  ExternalAuthorDTO,
  getPopularAuthorsFromAPIs
} from '../services/autor.service';
import { 
  parseAutorFilters, 
  buildAutorQuery, 
  validateAutorId 
} from '../utils/autorParser';
import {
  validateAuthorSearchQuery,
  searchAutoresLocal as searchAutoresLocalDB,
  searchAutoresExternal as searchAutoresExternalAPIs,
  combineAuthorResults,
  getFromCache,
  saveToCache,
  generateCacheKey
} from '../utils/autorSearchHelpers';


export const getAutores = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    
    // ✅ Usar parser para validar y extraer filtros
    const filters = parseAutorFilters(req.query);
    
    console.log('📚 getAutores - page:', filters.page, 'limit:', filters.limit, 'search:', filters.search);
    
    // 🚀 CACHE: Generar clave única para esta búsqueda
    const cacheKey = `autores:page:${filters.page}:limit:${filters.limit}:search:${filters.search}:sort:${filters.sortBy}`;
    const cacheTTL = 300; // 5 minutos
    
    // 🚀 CACHE: Intentar obtener del cache primero
    if (redis) {
      try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          console.log('✅ Cache HIT para autores:', cacheKey);
          return res.json(JSON.parse(cachedData));
        }
        console.log('⚠️ Cache MISS para autores:', cacheKey);
      } catch (cacheError) {
        console.error('❌ Error al leer cache de autores:', cacheError);
        // Continuar con la consulta a BD si falla el cache
      }
    }
    
    // ✅ Construir query usando el parser
    const where = buildAutorQuery(filters);
    
    // ✅ OPTIMIZACIÓN: Usar findAndCount con paginación en BD
    const [autores, total] = await em.findAndCount(Autor, where, {
      limit: filters.limit,
      offset: (filters.page - 1) * filters.limit,
      orderBy: { [filters.sortBy as keyof Autor]: 'ASC' }
    });
    
    console.log(`✅ Encontrados ${total} autores totales en BD, mostrando ${autores.length}`);
    
    // 🌟 NUEVA FUNCIONALIDAD: Si hay menos de 15 autores en BD y no hay búsqueda, complementar con externos
    const UMBRAL_MINIMO_AUTORES = 15;
    // Permitir complementar con externos en cualquier página, no solo la primera
    const debeComplementarConExternos = total < UMBRAL_MINIMO_AUTORES && !filters.search;
    
    if (debeComplementarConExternos) {
      console.log(`📦 BD tiene solo ${total} autores (< ${UMBRAL_MINIMO_AUTORES}), complementando con externos...`);
      
      try {
        // Cargar autores populares desde APIs (siempre traer 30)
        const cantidadExternosNecesarios = 30;
        const autoresPopulares = await getPopularAuthorsFromAPIs(cantidadExternosNecesarios);
        
        // Mapear autores de BD
        const autoresBD = autores.map((autor: Autor) => ({
          id: autor.id,
          nombre: autor.nombre,
          apellido: autor.apellido,
          name: `${autor.nombre} ${autor.apellido}`.trim(),
          foto: autor.foto,
          biografia: autor.biografia,
          googleBooksId: autor.googleBooksId,
          openLibraryKey: autor.openLibraryKey,
          createdAt: autor.createdAt,
          external: false
        }));
        
        // Crear Sets con los IDs externos de los autores que ya están en BD
        const googleBooksIdsEnBD = new Set(
          autoresBD
            .filter(a => a.googleBooksId)
            .map(a => a.googleBooksId)
        );
        const openLibraryKeysEnBD = new Set(
          autoresBD
            .filter(a => a.openLibraryKey)
            .map(a => a.openLibraryKey)
        );
        
        // Filtrar autores externos que NO estén ya en la BD
        const autoresExternosFiltrados = autoresPopulares.filter((autor: ExternalAuthorDTO) => {
          // Si el autor externo tiene googleBooksId y ya existe en BD, excluirlo
          if (autor.googleBooksId && googleBooksIdsEnBD.has(autor.googleBooksId)) {
            console.log(`🚫 Duplicado encontrado (Google Books): ${autor.nombre} ${autor.apellido}`);
            return false;
          }
          // Si el autor externo tiene openLibraryKey y ya existe en BD, excluirlo
          if (autor.openLibraryKey && openLibraryKeysEnBD.has(autor.openLibraryKey)) {
            console.log(`🚫 Duplicado encontrado (OpenLibrary): ${autor.nombre} ${autor.apellido}`);
            return false;
          }
          return true;
        });
        
        // Mapear autores externos filtrados
        const autoresExternos = autoresExternosFiltrados.map((autor: ExternalAuthorDTO) => ({
          nombre: autor.nombre,
          apellido: autor.apellido,
          name: `${autor.nombre} ${autor.apellido}`.trim(),
          foto: autor.foto,
          biografia: autor.biografia,
          googleBooksId: autor.googleBooksId,
          openLibraryKey: autor.openLibraryKey,
          external: true
        }));
        
        // 🧹 ELIMINAR DUPLICADOS por nombre normalizado
        // Función auxiliar para normalizar nombres (quitar acentos, mayúsculas, espacios extra, puntos, comas)
        const normalizarNombre = (texto: string): string => {
          return texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // quitar acentos
            .replace(/\./g, '') // quitar puntos (J.K. → JK)
            .replace(/,/g, '') // quitar comas
            .replace(/\s+/g, '') // quitar TODOS los espacios
            .trim();
        };
        
        // Función para generar múltiples claves normalizadas (considerando orden de palabras)
        const generarClavesNormalizadas = (autor: any): string[] => {
          const nombreCompleto = autor.name || `${autor.nombre} ${autor.apellido}`.trim();
          const palabras = nombreCompleto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[.,]/g, '')
            .split(/\s+/)
            .filter((p: string) => p.length > 0);
          
          // Generar variaciones ordenadas alfabéticamente para capturar "García Márquez Gabriel" y "Gabriel García Márquez"
          const clavePrincipal = palabras.sort().join('');
          const claveOriginal = palabras.join('');
          
          return [clavePrincipal, claveOriginal];
        };
        
        // Combinar todos los autores primero
        const autoresCombinados = [...autoresBD, ...autoresExternos];
        
        // Crear un Map para eliminar duplicados por nombre normalizado
        const autoresUnicos = new Map<string, any>();
        const clavesUsadas = new Set<string>();
        
        autoresCombinados.forEach(autor => {
          const nombreCompleto = autor.name || `${autor.nombre} ${autor.apellido}`.trim();
          const claves = generarClavesNormalizadas(autor);
          
          // Verificar si alguna de las claves ya fue usada
          const yaExiste = claves.some(clave => clavesUsadas.has(clave));
          
          if (yaExiste) {
            // Encontrar el autor existente
            let existente: any = null;
            let claveExistente = '';
            for (const clave of claves) {
              if (autoresUnicos.has(clave)) {
                existente = autoresUnicos.get(clave);
                claveExistente = clave;
                break;
              }
            }
            
            if (existente) {
              // Priorizar autores de BD (external: false) sobre externos
              if (!autor.external && existente.external) {
                console.log(`🔄 Reemplazando autor externo duplicado: "${existente.name}" con autor de BD: "${nombreCompleto}"`);
                // Remover el autor antiguo del map
                autoresUnicos.delete(claveExistente);
                // Agregar el nuevo con la primera clave
                autoresUnicos.set(claves[0], autor);
                claves.forEach(c => clavesUsadas.add(c));
              } else {
                console.log(`🚫 Duplicado por nombre encontrado: "${nombreCompleto}" (ya existe como "${existente.name}")`);
              }
            }
          } else {
            // Agregar el autor si no existe
            autoresUnicos.set(claves[0], autor);
            claves.forEach(c => clavesUsadas.add(c));
          }
        });
        
        // Convertir el Map a array
        const todosLosAutores = Array.from(autoresUnicos.values());
        const totalCompleto = todosLosAutores.length;
        
        console.log(`📊 Autores después de eliminar duplicados: ${autoresCombinados.length} → ${totalCompleto}`);
        
        // 🔧 Aplicar paginación: calcular offset y limit ANTES de slicear
        const totalPaginasCalculado = Math.ceil(totalCompleto / filters.limit);
        const offset = (filters.page - 1) * filters.limit;
        const autoresPaginados = todosLosAutores.slice(offset, offset + filters.limit);
        
        console.log(`✅ Respuesta híbrida: ${autoresBD.length} de BD + ${autoresExternos.length} externos = ${totalCompleto} total | Mostrando ${autoresPaginados.length} en página ${filters.page}/${totalPaginasCalculado}`);
        
        const responseData = {
          autores: autoresPaginados,
          total: totalCompleto,
          page: filters.page,
          totalPages: totalPaginasCalculado,
          hasMore: filters.page < totalPaginasCalculado,
          fromExternalAPIs: true,
          autoresBD: autoresBD.length,
          autoresExternos: autoresExternos.length
        };
        
        // 🚀 CACHE: Guardar respuesta híbrida en cache
        if (redis) {
          try {
            await redis.setex(cacheKey, cacheTTL, JSON.stringify(responseData));
            console.log('💾 Respuesta híbrida guardada en cache');
          } catch (cacheError) {
            console.error('❌ Error al guardar en cache:', cacheError);
          }
        }
        
        return res.json(responseData);
      } catch (error: any) {
        console.error('❌ Error cargando autores populares:', error.message);
        // Si falla cargar externos, continuar con solo BD
      }
    }
    
    // Respuesta normal (solo BD)
    const responseData = {
      autores: autores.map((autor: Autor) => ({
        id: autor.id,
        nombre: autor.nombre,
        apellido: autor.apellido,
        name: `${autor.nombre} ${autor.apellido}`.trim(),
        foto: autor.foto,
        biografia: autor.biografia,
        googleBooksId: autor.googleBooksId,
        openLibraryKey: autor.openLibraryKey,
        createdAt: autor.createdAt,
        external: false
      })),
      total,
      page: filters.page,
      totalPages: Math.ceil(total / filters.limit),
      hasMore: filters.page < Math.ceil(total / filters.limit),
      fromExternalAPIs: false
    };
    
    // 🚀 CACHE: Guardar respuesta en cache
    if (redis) {
      try {
        await redis.setex(cacheKey, cacheTTL, JSON.stringify(responseData));
        console.log('💾 Respuesta guardada en cache');
      } catch (cacheError) {
        console.error('❌ Error al guardar en cache:', cacheError);
      }
    }
    
    res.json(responseData);
  } catch (error: any) {
    console.error('❌ Error en getAutores:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Error al obtener autores',
      details: error.message 
    });
  }
};

export const getAutorById = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const identifier = req.params.id;

    console.log('🔍 getAutorById - Identifier:', identifier);

    // Intentar convertir a número
    const autorId = +identifier;

    let autor: Autor | null = null;

    // Si es un número válido, buscar por ID
    if (!isNaN(autorId) && autorId > 0) {
      console.log('🔢 Buscando por ID numérico:', autorId);
      autor = await em.findOne(Autor, { id: autorId });
    } 
    // Si no es un número, buscar por nombre completo
    else {
      console.log('📝 Buscando por nombre completo:', identifier);
      const decodedName = decodeURIComponent(identifier);
      
      // Intentar dividir en nombre y apellido
      const parts = decodedName.trim().split(' ');
      
      if (parts.length >= 2) {
        // Asumimos que el último elemento es el apellido y el resto es el nombre
        const apellido = parts[parts.length - 1];
        const nombre = parts.slice(0, -1).join(' ');
        
        console.log('🔍 Buscando autor - Nombre:', nombre, 'Apellido:', apellido);
        
        // Buscar exacto primero
        autor = await em.findOne(Autor, { 
          nombre: nombre,
          apellido: apellido 
        });
        
        // Si no encuentra exacto, intentar búsqueda flexible
        if (!autor) {
          console.log('⚠️ No encontrado exacto, intentando búsqueda flexible');
          autor = await em.findOne(Autor, { 
            $and: [
              { nombre: { $like: `%${nombre}%` } },
              { apellido: { $like: `%${apellido}%` } }
            ]
          });
        }
      } else {
        // Si solo hay una palabra, buscar en ambos campos
        console.log('🔍 Una sola palabra, buscando en nombre y apellido:', decodedName);
        autor = await em.findOne(Autor, { 
          $or: [
            { nombre: { $like: `%${decodedName}%` } },
            { apellido: { $like: `%${decodedName}%` } }
          ]
        });
      }
    }
    
    if (!autor) {
      console.log('❌ Autor no encontrado en BD');
      
      // Si llegamos aquí y el identifier no es numérico, intentar buscar en APIs externas
      if (isNaN(autorId)) {
        console.log('🌐 Buscando autor en APIs externas:', identifier);
        const decodedName = decodeURIComponent(identifier);
        
        try {
          // Buscar en paralelo en Google Books y OpenLibrary
          const [googleAuthors, openLibraryAuthors] = await Promise.all([
            searchGoogleBooksAuthorsReadOnly(decodedName).catch(() => []),
            searchOpenLibraryAuthorsReadOnly(decodedName).catch(() => [])
          ]);
          
          // Combinar resultados y buscar coincidencia exacta
          const allAuthors = [...googleAuthors, ...openLibraryAuthors];
          const nombreCompleto = (a: ExternalAuthorDTO) => `${a.nombre} ${a.apellido}`.trim().toLowerCase();
          const autorExterno = allAuthors.find(a => 
            nombreCompleto(a) === decodedName.toLowerCase().trim()
          ) || allAuthors[0]; // Si no hay coincidencia exacta, tomar el primero
          
          if (autorExterno) {
            console.log('✅ Autor encontrado en API externa:', autorExterno);
            // Devolver el autor externo con formato compatible
            return res.json({
              id: 0, // ID temporal para indicar que es externo
              nombre: autorExterno.nombre,
              apellido: autorExterno.apellido,
              foto: autorExterno.foto || null,
              biografia: autorExterno.biografia || null,
              googleBooksId: autorExterno.googleBooksId || null,
              openLibraryKey: autorExterno.openLibraryKey || null,
              external: true, // Marcar como externo
              createdAt: new Date().toISOString()
            });
          }
        } catch (apiError: any) {
          console.error('❌ Error al buscar en APIs externas:', apiError.message);
        }
      }
      
      return res.status(404).json({ error: 'Autor no encontrado' });
    }
    
    console.log('✅ Autor encontrado:', autor.nombre, autor.apellido);
    res.json(autor);
  } catch (error: any) {
    console.error('❌ Error en getAutorById:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Error al obtener autor',
      details: error.message 
    });
  }
};

/**
 * Nuevo endpoint: Guarda un autor externo bajo demanda cuando el usuario lo visualiza
 * Recibe los datos del autor externo en el body y lo guarda en la BDD
 */
export const saveExternalAuthorOnDemand = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const externalAuthor: ExternalAuthorDTO = req.body;

    console.log('💾 saveExternalAutorOnDemand - Autor:', externalAuthor.nombre, externalAuthor.apellido);

    // Validación
    if (!externalAuthor.nombre || !externalAuthor.apellido) {
      return res.status(400).json({ error: 'Nombre y apellido son requeridos' });
    }

    if (!externalAuthor.external) {
      return res.status(400).json({ error: 'Este endpoint es solo para autores externos' });
    }

    // Guardar el autor externo en la BDD
    const autorGuardado = await saveExternalAuthor(em, externalAuthor);
    
    // 🚀 CACHE: Invalidar cache de autores al guardar uno externo
    if (redis) {
      try {
        const keys = await redis.keys('autores:*');
        if (keys.length > 0) {
          await redis.del(...keys);
          console.log(`💾 Cache invalidado: ${keys.length} keys eliminadas`);
        }
      } catch (cacheError) {
        console.error('❌ Error al invalidar cache:', cacheError);
      }
    }
    
    console.log('✅ Autor externo guardado con ID:', autorGuardado.id);
    res.status(201).json(autorGuardado);
  } catch (error: any) {
    console.error('❌ Error en saveExternalAutorOnDemand:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Error al guardar autor externo',
      details: error.message 
    });
  }
};export const createAutor = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const { nombre, apellido } = req.body;

    // Validación robusta de inputs
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      return res.status(400).json({ error: 'Nombre es requerido y debe ser un string no vacío' });
    }

    if (!apellido || typeof apellido !== 'string' || apellido.trim().length === 0) {
      return res.status(400).json({ error: 'Apellido es requerido y debe ser un string no vacío' });
    }

    if (nombre.trim().length > 100) {
      return res.status(400).json({ error: 'El nombre no puede exceder 100 caracteres' });
    }

    if (apellido.trim().length > 100) {
      return res.status(400).json({ error: 'El apellido no puede exceder 100 caracteres' });
    }

    // Verificar si ya existe un autor con el mismo nombre y apellido
    const existingAutor = await em.findOne(Autor, { 
      nombre: nombre.trim(), 
      apellido: apellido.trim() 
    });

    if (existingAutor) {
      return res.status(400).json({ 
        error: 'Ya existe un autor con ese nombre y apellido',
        autorExistente: {
          id: existingAutor.id,
          nombre: existingAutor.nombre,
          apellido: existingAutor.apellido
        }
      });
    }

    // Crear nuevo autor
    const autor = em.create(Autor, req.body);
    await em.persistAndFlush(autor);
    
    // 🚀 CACHE: Invalidar cache de autores al crear uno nuevo
    if (redis) {
      try {
        // Obtener todas las keys que empiecen con 'autores:'
        const keys = await redis.keys('autores:*');
        if (keys.length > 0) {
          await redis.del(...keys);
          console.log(`💾 Cache invalidado: ${keys.length} keys eliminadas`);
        }
      } catch (cacheError) {
        console.error('❌ Error al invalidar cache:', cacheError);
      }
    }
    
    res.status(201).json(autor);
  } catch (error) {
    console.error('Error en createAutor:', error);
    res.status(500).json({ error: 'Error al crear autor' });
  }
};

export const updateAutor = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const autor = await orm.em.findOne(Autor, { id: +req.params.id });
  if (!autor) return res.status(404).json({ error: 'Autor no encontrado' });

  orm.em.assign(autor, req.body);
  await orm.em.flush();
  res.json(autor);
};

export const deleteAutor = async (req: Request, res: Response) => {
  const orm = req.app.get('orm') as MikroORM;
  const autor = await orm.em.findOne(Autor, { id: +req.params.id });
  if (!autor) return res.status(404).json({ error: 'Autor no encontrado' });

  await orm.em.removeAndFlush(autor);
  res.json({ mensaje: 'Autor eliminado' });
};

/**
 * Búsqueda de autores solo en base de datos local
 */
export const searchAutoresLocal = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const query = req.query.q as string;

    console.log('🔍 searchAutoresLocal - Query recibida:', query);

    // Validar query
    const validation = validateAuthorSearchQuery(query);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { trimmedQuery } = validation;
    const cacheKey = generateCacheKey(trimmedQuery!, false);

    // Intentar obtener del cache
    const cachedResults = await getFromCache(cacheKey);
    if (cachedResults) {
      return res.json(cachedResults);
    }

    // Buscar en BD local
    const autores = await searchAutoresLocalDB(em, trimmedQuery!);

    // Guardar en cache
    await saveToCache(cacheKey, autores);

    res.json(autores);
  } catch (error: any) {
    console.error('❌ Error en searchAutoresLocal:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * Búsqueda de autores con resultados combinados (local + APIs externas)
 */
export const searchAutoresWithExternal = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const query = req.query.q as string;

    console.log('🔍 searchAutoresWithExternal - Query recibida:', query);

    // Validar query
    const validation = validateAuthorSearchQuery(query);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { trimmedQuery } = validation;
    const cacheKey = generateCacheKey(trimmedQuery!, true);

    // Intentar obtener del cache
    const cachedResults = await getFromCache(cacheKey);
    if (cachedResults) {
      return res.json(cachedResults);
    }

    // Buscar en BD local
    const autoresLocales = await searchAutoresLocalDB(em, trimmedQuery!);

    // Si hay suficientes resultados locales, no buscar en APIs externas
    if (autoresLocales.length >= 5) {
      await saveToCache(cacheKey, autoresLocales);
      return res.json(autoresLocales);
    }

    // Buscar en APIs externas (sin guardar)
    const autoresExternos = await searchAutoresExternalAPIs(trimmedQuery!);

    // Combinar resultados
    const autoresCombinados = combineAuthorResults(autoresLocales, autoresExternos);

    // Guardar en cache
    await saveToCache(cacheKey, autoresCombinados);

    res.json(autoresCombinados);
  } catch (error: any) {
    console.error('❌ Error en searchAutoresWithExternal:', error.message);
    
    // Fallback: devolver solo resultados locales
    try {
      const orm = req.app.get('orm') as MikroORM;
      const em = orm.em.fork();
      const query = req.query.q as string;
      const validation = validateAuthorSearchQuery(query);
      
      if (validation.valid && validation.trimmedQuery) {
        const autoresLocales = await searchAutoresLocalDB(em, validation.trimmedQuery);
        return res.json(autoresLocales);
      }
    } catch (fallbackError) {
      console.error('❌ Error en fallback:', fallbackError);
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * @deprecated Use searchAutoresLocal o searchAutoresWithExternal
 * Mantenida por compatibilidad. Será removida en v2.0
 */
export const searchAutores = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const query = req.query.q as string;
    const includeExternal = req.query.includeExternal === 'true';

    console.log('🔍 searchAutores - Query recibida:', query);

    // Validación robusta de inputs
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'El parámetro "q" es requerido y debe ser un string' });
    }

    const trimmedQuery = query.trim();
    
    if (trimmedQuery.length < 2) {
      return res.status(400).json({ error: 'La consulta de búsqueda debe tener al menos 2 caracteres' });
    }

    if (trimmedQuery.length > 100) {
      return res.status(400).json({ error: 'La consulta de búsqueda no puede exceder 100 caracteres' });
    }

    // 🚀 CACHE: Generar clave única para esta búsqueda
    const cacheKey = `autores:search:${trimmedQuery}:external:${includeExternal}`;
    const cacheTTL = 300; // 5 minutos
    
    // 🚀 CACHE: Intentar obtener del cache primero
    if (redis) {
      try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          console.log('✅ Cache HIT para búsqueda:', cacheKey);
          return res.json(JSON.parse(cachedData));
        }
        console.log('⚠️ Cache MISS para búsqueda:', cacheKey);
      } catch (cacheError) {
        console.error('❌ Error al leer cache de búsqueda:', cacheError);
        // Continuar con la consulta a BD si falla el cache
      }
    }

    // Paso 1: Buscar en BDD (fuente única de verdad)
    console.log('📚 Buscando en BDD local...');
    const autoresLocales = await em.find(Autor, {
      $or: [
        { nombre: { $like: `%${trimmedQuery}%` } },
        { apellido: { $like: `%${trimmedQuery}%` } }
      ]
    });

    console.log(`✅ Encontrados ${autoresLocales.length} autores locales`);

    // Paso 2 (opcional): Buscar en APIs externas si hay pocos resultados
    // y el usuario quiere descubrir más autores
    // IMPORTANTE: Solo muestra resultados, NO guarda en BDD hasta que el usuario vea el perfil
    if (includeExternal && autoresLocales.length < 5) {
      try {
        console.log('🌐 Buscando en APIs externas (READ-ONLY)...');
        
        // Buscar en paralelo en Google Books y OpenLibrary (sin guardar)
        const [autoresGoogleDTO, autoresOpenLibraryDTO] = await Promise.all([
          searchGoogleBooksAuthorsReadOnly(trimmedQuery).catch((err) => {
            console.error('❌ Error en Google Books:', err.message);
            return [];
          }),
          searchOpenLibraryAuthorsReadOnly(trimmedQuery).catch((err) => {
            console.error('❌ Error en OpenLibrary:', err.message);
            return [];
          })
        ]);
        
        console.log(`✅ Encontrados ${autoresGoogleDTO.length} autores en Google Books`);
        console.log(`✅ Encontrados ${autoresOpenLibraryDTO.length} autores en OpenLibrary`);
        
        // Combinar resultados: primero locales (tienen ID), luego externos (sin ID)
        const autoresCombinados = [
          ...autoresLocales,
          ...autoresGoogleDTO,
          ...autoresOpenLibraryDTO
        ];
        
        console.log(`✅ Total combinado: ${autoresCombinados.length} autores (${autoresLocales.length} locales, ${autoresGoogleDTO.length + autoresOpenLibraryDTO.length} externos)`);
        
        // 🚀 CACHE: Guardar respuesta combinada en cache
        if (redis) {
          try {
            await redis.setex(cacheKey, cacheTTL, JSON.stringify(autoresCombinados));
            console.log('💾 Búsqueda combinada guardada en cache');
          } catch (cacheError) {
            console.error('❌ Error al guardar en cache:', cacheError);
          }
        }
        
        return res.json(autoresCombinados);
      } catch (error: any) {
        console.error('❌ Error buscando en APIs externas:', error.message);
        console.error('Stack:', error.stack);
        // Si falla la búsqueda externa, devolver solo los locales
        return res.json(autoresLocales);
      }
    }

    // 🚀 CACHE: Guardar respuesta local en cache
    if (redis) {
      try {
        await redis.setex(cacheKey, cacheTTL, JSON.stringify(autoresLocales));
        console.log('💾 Búsqueda local guardada en cache');
      } catch (cacheError) {
        console.error('❌ Error al guardar en cache:', cacheError);
      }
    }

    res.json(autoresLocales);
  } catch (error: any) {
    console.error('❌ Error en searchAutores:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Error al buscar autores',
      details: error.message 
    });
  }
};

// Obtener estadísticas de un autor
export const getAutorStats = async (req: Request, res: Response) => {
  try {
    const orm = req.app.get('orm') as MikroORM;
    const em = orm.em.fork();
    const autorId = +req.params.id;

    console.log('📊 getAutorStats - ID:', autorId);

    // Validación robusta del ID
    if (isNaN(autorId) || autorId < 1) {
      return res.status(400).json({ error: 'ID de autor inválido. Debe ser un número positivo' });
    }

    // Verificar que el autor existe
    const autor = await em.findOne(Autor, { id: autorId }, { populate: ['libros'] });
    if (!autor) {
      console.log('❌ Autor no encontrado');
      return res.status(404).json({ error: 'Autor no encontrado' });
    }

    // Cargar libros del autor
    await autor.libros.loadItems();
    const libros = autor.libros.getItems();
    const totalLibros = libros.length;

    console.log(`✅ Autor encontrado con ${totalLibros} libros`);

    // Si no tiene libros, devolver estadísticas vacías
    if (totalLibros === 0) {
      return res.json({
        autorId,
        nombreCompleto: `${autor.nombre} ${autor.apellido}`.trim(),
        estadisticas: {
          totalLibros: 0,
          totalResenas: 0,
          promedioCalificacion: 0,
          librosMasPopulares: []
        }
      });
    }

    // Obtener IDs de los libros
    const libroIds = libros.map(l => l.id);

    // Contar reseñas totales de los libros del autor (usando QueryBuilder para evitar problemas)
    let totalResenas = 0;
    try {
      totalResenas = await em.count('Resena', {
        libro: { id: { $in: libroIds } },
        deletedAt: null
      });
    } catch (error: any) {
      console.warn('⚠️ Error contando reseñas:', error.message);
      totalResenas = 0;
    }

    // Calcular promedio de calificaciones (solo si hay libros)
    let promedioCalificacion = 0;
    try {
      const result = await em.getConnection().execute(
        `SELECT AVG(estrellas) as promedio 
         FROM resena 
         WHERE libro_id IN (${libroIds.join(',')}) AND deleted_at IS NULL AND estrellas IS NOT NULL`
      );
      promedioCalificacion = result[0]?.promedio ? parseFloat(result[0].promedio) : 0;
    } catch (error: any) {
      console.warn('⚠️ Error calculando promedio:', error.message);
      promedioCalificacion = 0;
    }

    // Obtener libros más populares (más reseñas)
    let librosMasPopulares: any[] = [];
    try {
      librosMasPopulares = await em.getConnection().execute(
        `SELECT l.id, l.nombre, l.imagen, COUNT(r.id) as total_resenas
         FROM libro l
         LEFT JOIN resena r ON r.libro_id = l.id AND r.deleted_at IS NULL
         WHERE l.id IN (${libroIds.join(',')})
         GROUP BY l.id, l.nombre, l.imagen
         ORDER BY total_resenas DESC
         LIMIT 5`
      );
    } catch (error: any) {
      console.warn('⚠️ Error obteniendo libros populares:', error.message);
      librosMasPopulares = [];
    }

    res.json({
      autorId,
      nombreCompleto: `${autor.nombre} ${autor.apellido}`.trim(),
      estadisticas: {
        totalLibros,
        totalResenas,
        promedioCalificacion: parseFloat(promedioCalificacion.toFixed(1)),
        librosMasPopulares: librosMasPopulares.map((libro: any) => ({
          id: libro.id,
          nombre: libro.nombre,
          imagen: libro.imagen,
          totalResenas: parseInt(libro.total_resenas || '0')
        }))
      }
    });
  } catch (error: any) {
    console.error('❌ Error en getAutorStats:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas del autor',
      details: error.message 
    });
  }
};
