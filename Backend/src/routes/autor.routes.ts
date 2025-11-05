import { Router } from 'express';
import { 
  getAutores, 
  getAutorById, 
  createAutor, 
  updateAutor, 
  deleteAutor, 
  searchAutores, 
  getAutorStats,
  saveExternalAuthorOnDemand 
} from '../controllers/autor.controller';
import redis from '../redis';

const router = Router();

router.get('/', getAutores);
router.get('/search', searchAutores);
router.get('/:id/stats', getAutorStats); // Debe ir ANTES de /:id
router.get('/:id', getAutorById);
router.post('/', createAutor);
router.post('/external/save', saveExternalAuthorOnDemand); // Nuevo endpoint para guardar autor externo bajo demanda
router.put('/:id', updateAutor);
router.delete('/:id', deleteAutor);

// Endpoint temporal para limpiar caché de autores
router.delete('/cache/clear', async (req, res) => {
  try {
    if (redis) {
      const keys = await redis.keys('autores:*');
      if (keys.length > 0) {
        await redis.del(...keys);
        res.json({ message: `Cache limpiado: ${keys.length} keys eliminadas`, keys });
      } else {
        res.json({ message: 'No hay keys de autores en cache' });
      }
    } else {
      res.status(503).json({ error: 'Redis no disponible' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as autorRoutes };
