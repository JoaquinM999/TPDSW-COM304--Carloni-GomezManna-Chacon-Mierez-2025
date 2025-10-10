// src/routes/libro.routes.ts
import { Router } from 'express';
import {
  getLibros, getLibroById, createLibro, updateLibro, deleteLibro,
  getLibrosByCategoria, getLibrosByEstrellasMinimas, getReviewsByBookIdController, searchLibros
} from '../controllers/libro.controller';

const router = Router();

router.get('/', getLibros);
router.get('/search', searchLibros);
router.get('/categoria/:categoriaId', getLibrosByCategoria);
router.get('/estrellas', getLibrosByEstrellasMinimas);
router.get('/:id/reviews', getReviewsByBookIdController);
router.get('/:id', getLibroById);
router.post('/', createLibro);
router.put('/:id', updateLibro);
router.delete('/:id', deleteLibro);

export { router as libroRoutes };
