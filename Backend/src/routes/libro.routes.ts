// src/routes/libro.routes.ts
import { Router } from 'express';
import { 
  getLibros, getLibroById, createLibro, updateLibro, deleteLibro,
  getLibrosByCategoria, getLibrosByEstrellasMinimas
} from '../controllers/libro.controller';

const router = Router();

router.get('/', getLibros);
router.get('/:id', getLibroById);
router.post('/', createLibro);
router.put('/:id', updateLibro);
router.delete('/:id', deleteLibro);

router.get('/categoria/:categoriaId', getLibrosByCategoria);
router.get('/estrellas', getLibrosByEstrellasMinimas);

export { router as libroRoutes };
