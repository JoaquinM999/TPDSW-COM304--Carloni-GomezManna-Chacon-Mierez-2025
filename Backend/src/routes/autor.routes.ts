import { Router } from 'express';
import { getAutores, getAutoresWithBooks, getAutorById, createAutor, updateAutor, deleteAutor } from '../controllers/autor.controller';
import { validateAutor } from '../middleware/autorValidation.middleware';

const router = Router();

router.get('/', getAutores);
router.get('/with-books', getAutoresWithBooks);
router.get('/:id', getAutorById);
router.post('/', validateAutor, createAutor);
router.put('/:id', validateAutor, updateAutor);
router.delete('/:id', deleteAutor);

export { router as autorRoutes };

// Add this route to serve /autores path in backend
import { Application } from 'express';

export function registerAutorRoutes(app: Application) {
  app.use('/api/autores', router);
}
