import { Router } from 'express';
import { getAutores, getAutorById, createAutor, updateAutor, deleteAutor, searchAutores, getAutorStats } from '../controllers/autor.controller';

const router = Router();

router.get('/', getAutores);
router.get('/search', searchAutores);
router.get('/:id/stats', getAutorStats); // Debe ir ANTES de /:id
router.get('/:id', getAutorById);
router.post('/', createAutor);
router.put('/:id', updateAutor);
router.delete('/:id', deleteAutor);

export { router as autorRoutes };
